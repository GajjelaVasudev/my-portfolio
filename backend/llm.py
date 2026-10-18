"""
Grounded answer generation using an LLM.
Enforces strict factual fidelity, citation attribution, and honest fallback
when retrieved evidence is insufficient.
"""

import logging
from typing import Dict, List, Optional
from backend.config import settings
from backend.retriever import RetrievedChunk

logger = logging.getLogger("rag_assistant.llm")

SYSTEM_PROMPT = """You are the personal AI assistant for Gajjela Vasudev's portfolio website.
Your role is to accurately answer visitors' questions about Vasudev's engineering work, skills, projects, experience, hackathons, and certifications.

STRICT ACCURACY RULES:
1. Answer ONLY using the facts present in the provided retrieved context.
2. DO NOT assume, extrapolate, or invent any education, companies, dates, skill proficiencies, or project metrics.
3. If the retrieved context does NOT provide sufficient information to answer the question, DO NOT speculate. Instead, politely provide this exact fallback stance:
   "I don't have enough verified information in Vasudev's portfolio knowledge base to answer that. Vasudev's portfolio highlights his expertise in distributed systems, backend engineering with Java/Spring Boot, and modern web applications. You are welcome to reach out directly via gajjelavasudev@gmail.com."
4. When mentioning projects, tools, or experiences, attribute them clearly to Vasudev's genuine work.
5. Keep your tone professional, concise, articulate, and welcoming. Do not speak in corporate clichés or robotic jargon.
"""

FALLBACK_MESSAGE = (
    "I don't have enough verified information in Vasudev's portfolio knowledge base to answer that. "
    "Vasudev's portfolio highlights his work in distributed systems, backend engineering with Java/Spring Boot, "
    "and full-stack development. You can reach out directly to Vasudev via gajjelavasudev@gmail.com."
)


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


def generate_grounded_answer(
    query: str,
    retrieved_chunks: List[RetrievedChunk],
    history: Optional[List[Dict[str, str]]] = None
) -> Dict:
    """
    Synthesizes a grounded answer from retrieved chunks using the configured LLM.
    Returns a dictionary with 'answer', 'sources', and 'is_fallback'.
    """
    sources = _deduplicate_sources(retrieved_chunks)

    # 1. If no chunks were retrieved or similarity was too low
    if not retrieved_chunks:
        return {
            "answer": FALLBACK_MESSAGE,
            "sources": [],
            "is_fallback": True
        }

    # 2. Format context block
    context_text = "\n\n".join(
        f"--- CONTEXT PASSAGE [{i+1}] ({c.file_name} // {c.section_title}) ---\n{c.content}"
        for i, c in enumerate(retrieved_chunks)
    )

    # 3. Check for active OpenAI client
    api_key = settings.openai_api_key
    if not api_key or api_key == "your_openai_api_key_here":
        # Fallback response for unconfigured local environment
        logger.info("OPENAI_API_KEY is not configured; generating structured local excerpt response.")
        top_chunk = retrieved_chunks[0]
        excerpt_answer = (
            f"Based on Vasudev's **{top_chunk.file_name}** ({top_chunk.section_title}):\n\n"
            f"{top_chunk.content.splitlines()[-1] if len(top_chunk.content.splitlines()) > 1 else top_chunk.content}\n\n"
            f"*(Note: Configure `OPENAI_API_KEY` in `backend/.env` for full generative conversational synthesis).* "
            f"Feel free to reach out directly to Vasudev at `gajjelavasudev@gmail.com`."
        )
        return {
            "answer": excerpt_answer,
            "sources": sources,
            "is_fallback": False
        }

    # 4. Generate with OpenAI API
    try:
        from openai import OpenAI
        kwargs = {"api_key": api_key}
        if settings.openai_base_url:
            kwargs["base_url"] = settings.openai_base_url
        client = OpenAI(**kwargs)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

        # Append recent session history (last 4 turns)
        if history:
            for turn in history[-4:]:
                role = turn.get("role")
                content = turn.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})

        user_content = (
            f"RETRIEVED PORTFOLIO EVIDENCE:\n{context_text}\n\n"
            f"VISITOR QUESTION:\n{query.strip()}"
        )
        messages.append({"role": "user", "content": user_content})

        response = client.chat.completions.create(
            model=settings.llm_model,
            temperature=settings.llm_temperature,
            messages=messages,
            max_tokens=600
        )

        answer_text = response.choices[0].message.content.strip()
        is_fallback = "don't have enough verified information" in answer_text.lower()

        return {
            "answer": answer_text,
            "sources": sources,
            "is_fallback": is_fallback
        }

    except Exception as exc:
        logger.error(f"LLM generation error: {exc}")
        return {
            "answer": (
                "An error occurred while connecting to the intelligence service. "
                "Please try again in a moment, or reach out to Vasudev directly via gajjelavasudev@gmail.com."
            ),
            "sources": sources,
            "is_fallback": True
        }
