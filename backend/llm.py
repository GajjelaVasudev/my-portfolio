"""
Multi-provider grounded answer generation for the Portfolio RAG Assistant.
Priority order:
  1. Google Gemini (Primary) via official google-genai SDK
  2. OpenAI (Fallback 1) via openai SDK (if OPENAI_API_KEY is configured)
  3. Groq (Fallback 2) via groq SDK (if GROQ_API_KEY is configured)

Enforces:
  - Strict grounding in retrieved context
  - Automatic skipping of unconfigured providers
  - Bounded timeouts per provider
  - Sanitized logging without exposing secrets
  - Graceful fallback when all providers or retrieval fail
"""

import logging
import time
from typing import Dict, List, Optional, Tuple, Any
from backend.config import settings
from backend.retriever import RetrievedChunk

logger = logging.getLogger("rag_assistant.llm")

SYSTEM_PROMPT = """You are Leo, the personal AI assistant for Gajjela Vasudev's portfolio website.
Your role is to accurately, concisely, and warmly answer visitors' questions about Vasudev's engineering work, skills, projects, experience, hackathons, and verified credentials.

STRICT ACCURACY & GROUNDING RULES:
1. Answer ONLY using the facts present in the provided retrieved context.
2. DO NOT assume, extrapolate, or invent any education, companies, internships, dates, skill proficiencies, or project features.
3. If the retrieved context does NOT provide sufficient information to answer the question, DO NOT speculate. Politely provide this exact fallback:
   "I don't have enough verified information in Vasudev's portfolio knowledge base to answer that. Vasudev's portfolio highlights his work in full-stack web applications, backend engineering with Node.js/Express and Spring Boot, and cloud foundations. You can reach out directly to Vasudev via vgajjella@gmail.com."
4. Distinguish completed projects (NxtGen LMS, Webinar Management System) from projects currently in development (Scalable E-commerce Platform backend phase).
5. Note that Vasudev is currently a full-time student at KL University (CGPA 9.6, expected graduation May 2028) preparing for software engineering internships; he has no past internships added yet.
6. Clearly highlight his verified achievement: Runner-up at JPMorgan Chase Code for Good 2026 (Problem Statement 2 — Dharmalife, Team 28, DLONE / DLE Sarthi).
7. Keep answers natural, concise, and recruiter-ready. Avoid repeating the full identity introduction in every response.
"""

FALLBACK_MESSAGE = (
    "I don't have enough verified information in Vasudev's portfolio knowledge base to answer that. "
    "Vasudev's portfolio highlights his work in full-stack web applications, backend engineering with Node.js/Express and Spring Boot, "
    "and cloud foundations. You can reach out directly to Vasudev via vgajjella@gmail.com."
)

SERVICE_UNAVAILABLE_MESSAGE = (
    "Leo is temporarily unavailable. Please try again in a moment, or reach out to Vasudev directly via vgajjella@gmail.com."
)


def _is_valid_key(key: Optional[str]) -> bool:
    """Checks whether an API key is provided and not a placeholder."""
    if not key:
        return False
    k = key.strip()
    if len(k) < 8:
        return False
    if k.lower().startswith("your_") or "api_key_here" in k.lower():
        return False
    return True


def _deduplicate_sources(chunks: List[RetrievedChunk]) -> List[Dict[str, str]]:
    """Extracts unique source document and section references."""
    seen = set()
    sources = []
    for chunk in chunks:
        key = (chunk.file_name, chunk.section_title)
        if key not in seen:
            seen.add(key)
            sources.append({
                "file_name": chunk.file_name,
                "section_title": chunk.section_title or "General"
            })
    return sources


def _format_grounded_prompt(
    query: str,
    retrieved_chunks: List[RetrievedChunk],
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Builds the grounded evidence prompt containing context passages and conversation history."""
    context_text = "\n\n".join(
        f"--- CONTEXT PASSAGE [{i+1}] ({c.file_name} // {c.section_title}) ---\n{c.content}"
        for i, c in enumerate(retrieved_chunks)
    )

    prompt_parts: List[str] = [
        f"RETRIEVED PORTFOLIO EVIDENCE:\n{context_text}\n\n"
    ]

    if history:
        prompt_parts.append("RECENT CONVERSATION HISTORY:\n")
        for turn in history[-4:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role in ("user", "assistant") and content:
                prompt_parts.append(f"{role.upper()}: {content}\n")
        prompt_parts.append("\n")

    prompt_parts.append(f"VISITOR QUESTION:\n{query.strip()}")
    return "".join(prompt_parts)


class GeminiProviderError(Exception):
    """Raised when Google Gemini calls fail across all candidates."""
    pass


def _call_gemini_provider(prompt: str) -> Optional[str]:
    """Calls Google Gemini primary provider with bounded timeouts and fast model fallbacks."""
    api_key = settings.effective_gemini_api_key
    if not _is_valid_key(api_key):
        logger.info("Google Gemini provider skipped: No valid API key configured.")
        return None

    # Priority models to try if the primary encounters 404 or transient timeout
    primary_model = settings.gemini_generation_model or "gemini-flash-lite-latest"
    # Never try gemini-flash-latest because it is known to hang
    candidate_models: List[str] = [primary_model]
    for alt_model in ["gemini-flash-lite-latest", "gemini-3.5-flash-lite"]:
        if alt_model not in candidate_models:
            candidate_models.append(alt_model)

    # Milliseconds timeout for google-genai SDK
    timeout_ms = int(settings.provider_timeout_seconds * 1000)
    last_captured_error: Optional[str] = None

    try:
        from google import genai
        from google.genai import types

        http_opts = types.HttpOptions(timeout=timeout_ms)
        client = genai.Client(api_key=api_key, http_options=http_opts)
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=settings.gemini_temperature,
            max_output_tokens=600,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
        )

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                )
                if response.text and response.text.strip():
                    return response.text.strip()
            except Exception as model_err:
                sanitized_err = str(model_err).replace(api_key, "[REDACTED]").splitlines()[0]
                last_captured_error = f"SDK {type(model_err).__name__} ({model_name}): {sanitized_err}"
                err_str = str(model_err).lower()
                is_recoverable = (
                    "not found" in err_str
                    or "404" in err_str
                    or "timed out" in err_str
                    or "deadline" in err_str
                    or "timeout" in err_str
                    or "servererror" in err_str
                    or "503" in err_str
                    or "504" in err_str
                )
                if is_recoverable and model_name != candidate_models[-1]:
                    logger.warning(
                        f"Gemini model '{model_name}' failed ({type(model_err).__name__}), trying next candidate..."
                    )
                    continue
                logger.warning(
                    f"Gemini SDK call for '{model_name}' failed ({type(model_err).__name__}). Trying direct REST fallback..."
                )
                break
    except Exception as sdk_init_err:
        last_captured_error = f"SDK Init {type(sdk_init_err).__name__}: {sdk_init_err}"
        logger.warning(f"Google GenAI SDK unavailable or initialization failed: {sdk_init_err}")

    # Fallback to direct REST call using httpx with bounded timeout
    import httpx
    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": settings.gemini_temperature,
                "maxOutputTokens": 600
            }
        }
        try:
            with httpx.Client(timeout=settings.provider_timeout_seconds) as rest_client:
                resp = rest_client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                if parts and "text" in parts[0]:
                    return parts[0]["text"].strip()
            elif resp.status_code == 404:
                last_captured_error = f"REST HTTP 404 ({model_name}): Model not found"
                continue
            else:
                clean_body = resp.text.replace(api_key, "[REDACTED]").splitlines()[0][:150]
                last_captured_error = f"REST HTTP {resp.status_code} ({model_name}): {clean_body}"
                logger.warning(f"Gemini REST endpoint returned status {resp.status_code} for {model_name}")
        except Exception as rest_err:
            clean_err = str(rest_err).replace(api_key, "[REDACTED]")
            last_captured_error = f"REST {type(rest_err).__name__} ({model_name}): {clean_err}"
            logger.warning(f"Gemini REST call to '{model_name}' timed out/failed: {clean_err}")

    # Raise explicit error so generate_grounded_answer captures exact root cause
    raise GeminiProviderError(last_captured_error or "Unknown Gemini execution failure")


def _call_openai_provider(prompt: str) -> Optional[str]:
    """Calls OpenAI fallback provider 1."""
    api_key = settings.openai_api_key
    if not _is_valid_key(api_key):
        logger.info("OpenAI fallback skipped: OPENAI_API_KEY is not configured.")
        return None

    from openai import OpenAI

    client = OpenAI(
        api_key=api_key,
        timeout=settings.provider_timeout_seconds
    )

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=settings.gemini_temperature,
        max_tokens=600
    )

    if response.choices and response.choices[0].message:
        return response.choices[0].message.content.strip()
    return None


def _call_groq_provider(prompt: str) -> Optional[str]:
    """Calls Groq fallback provider 2."""
    api_key = settings.groq_api_key
    if not _is_valid_key(api_key):
        logger.info("Groq fallback skipped: GROQ_API_KEY is not configured.")
        return None

    try:
        from groq import Groq
        client = Groq(
            api_key=api_key,
            timeout=settings.provider_timeout_seconds
        )
    except ImportError:
        from openai import OpenAI
        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key,
            timeout=settings.provider_timeout_seconds
        )

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=settings.gemini_temperature,
        max_tokens=600
    )

    if response.choices and response.choices[0].message:
        return response.choices[0].message.content.strip()
    return None


def generate_grounded_answer(
    query: str,
    retrieved_chunks: List[RetrievedChunk],
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Synthesizes a grounded answer from retrieved chunks using multi-provider fallback:
      1. Primary: Google Gemini
      2. Fallback 1: OpenAI
      3. Fallback 2: Groq
    """
    sources = _deduplicate_sources(retrieved_chunks)

    # 1. Enforce grounding: if no chunks retrieved or below threshold, return fallback without calling LLMs
    if not retrieved_chunks:
        return {
            "answer": FALLBACK_MESSAGE,
            "sources": [],
            "is_fallback": True,
            "provider_used": "none"
        }

    # 2. Check for unconfigured local developer / offline test mode
    has_any_configured_provider = (
        _is_valid_key(settings.effective_gemini_api_key) or
        _is_valid_key(settings.openai_api_key) or
        _is_valid_key(settings.groq_api_key)
    )

    if not has_any_configured_provider:
        logger.info("No AI providers configured; generating structured local excerpt response.")
        top_chunk = retrieved_chunks[0]
        excerpt_answer = (
            f"Based on Vasudev's **{top_chunk.file_name}** ({top_chunk.section_title}):\n\n"
            f"{top_chunk.content.splitlines()[-1] if len(top_chunk.content.splitlines()) > 1 else top_chunk.content}\n\n"
            f"*(Note: Configure `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` in `backend/.env` for full conversational synthesis).*"
        )
        return {
            "answer": excerpt_answer,
            "sources": sources,
            "is_fallback": False,
            "provider_used": "local_excerpt"
        }

    # 3. Format the grounded prompt
    prompt = _format_grounded_prompt(query, retrieved_chunks, history)

    # 4. Multi-provider execution chain
    providers: List[Tuple[str, Any]] = [
        ("gemini", _call_gemini_provider),
        ("openai", _call_openai_provider),
        ("groq", _call_groq_provider)
    ]

    last_error: Optional[str] = None

    for provider_name, provider_fn in providers:
        start_time = time.time()
        try:
            logger.info(f"Attempting grounded generation with provider: '{provider_name}'...")
            answer_text = provider_fn(prompt)

            if answer_text is not None and len(answer_text) > 0:
                elapsed = round(time.time() - start_time, 2)
                logger.info(f"Provider '{provider_name}' succeeded in {elapsed}s.")

                is_fallback = "don't have enough verified information" in answer_text.lower()
                return {
                    "answer": answer_text,
                    "sources": [] if is_fallback else sources,
                    "is_fallback": is_fallback,
                    "provider_used": provider_name
                }
            else:
                logger.info(f"Provider '{provider_name}' was skipped (unconfigured or empty).")

        except Exception as exc:
            elapsed = round(time.time() - start_time, 2)
            error_type = type(exc).__name__
            # Clean sanitized error message
            clean_err = str(exc).splitlines()[0] if str(exc) else "Unknown error"
            logger.warning(
                f"Provider '{provider_name}' failed after {elapsed}s [{error_type}]: {clean_err}."
            )
            last_error = f"{provider_name}: {error_type} ({clean_err})"

    # 5. If every configured provider failed or was unconfigured
    logger.error(f"All AI providers failed or were unconfigured. Last error summary: {last_error}")
    return {
        "answer": SERVICE_UNAVAILABLE_MESSAGE,
        "sources": [],
        "is_fallback": True,
        "provider_used": "none"
    }
