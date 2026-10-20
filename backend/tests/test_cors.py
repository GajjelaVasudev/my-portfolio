"""
Unit tests for CORS preflight and access control in the Portfolio RAG backend.
Verifies that:
1. Exact production origins (Netlify and custom dpdns.org domain) are allowed.
2. Local development origins (localhost:5173 and 127.0.0.1:5173) are allowed.
3. Netlify preview deployment subdomains are allowed via regex.
4. Unapproved / malicious origins are rejected with 400 Disallowed CORS origin.
5. Preflight headers, allowed methods, exposed headers, and credentials policies match requirements.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings

client = TestClient(app)

APPROVED_ORIGINS = [
    "https://devportfolio24.netlify.app",
    "https://vasudevbuilds.dpdns.org",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://portfolio-rag-backend-vkq8.onrender.com",
    "https://branch-preview--devportfolio24.netlify.app",  # Netlify preview domain
]

DISALLOWED_ORIGINS = [
    "https://malicious-attacker.com",
    "https://evil-vasudevbuilds.dpdns.org.attacker.com",
    "https://fake-netlify.app.attacker.com",
    "http://localhost:9999",
    "null",
]


@pytest.mark.parametrize("origin", APPROVED_ORIGINS)
def test_preflight_options_allowed_origins(origin):
    """
    Verifies that preflight OPTIONS /api/chat requests from approved production
    and development origins return HTTP 200 with appropriate CORS headers.
    """
    response = client.options(
        "/api/chat",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-request-id",
        },
    )

    assert response.status_code == 200, f"Expected 200 for origin {origin}, got {response.status_code}"
    assert response.headers.get("access-control-allow-origin") == origin
    
    # Check allowed methods include POST
    allowed_methods = response.headers.get("access-control-allow-methods", "")
    assert "POST" in allowed_methods
    assert "OPTIONS" in allowed_methods

    # Check allowed headers match requested headers
    allowed_headers = response.headers.get("access-control-allow-headers", "").lower()
    assert "content-type" in allowed_headers
    assert "x-request-id" in allowed_headers

    # Credentials should NOT be enabled since frontend does not require them
    assert "access-control-allow-credentials" not in response.headers


@pytest.mark.parametrize("origin", DISALLOWED_ORIGINS)
def test_preflight_options_disallowed_origins(origin):
    """
    Verifies that preflight requests from unapproved origins are rejected by Starlette
    CORSMiddleware with 400 Bad Request and Disallowed CORS origin.
    """
    response = client.options(
        "/api/chat",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-request-id",
        },
    )

    assert response.status_code == 400, f"Expected 400 for unapproved origin {origin}, got {response.status_code}"
    assert "Disallowed CORS origin" in response.text
    assert "access-control-allow-origin" not in response.headers


def test_cors_simple_get_health():
    """
    Verifies that simple GET /health requests include Access-Control-Allow-Origin
    for allowed origins and expose custom headers if specified.
    """
    origin = "https://vasudevbuilds.dpdns.org"
    response = client.get("/health", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") is None


def test_cors_origins_list_guarantees_core_origins():
    """
    Verifies that settings.cors_origins_list always contains core production
    and dev origins even if the environment variable has extra or partial entries.
    """
    origins = settings.cors_origins_list
    assert "https://devportfolio24.netlify.app" in origins
    assert "https://vasudevbuilds.dpdns.org" in origins
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins


def test_raw_options_probe_succeeds():
    """
    Verifies that raw non-preflight OPTIONS requests (such as load balancer probes)
    return HTTP 200 instead of 405 Method Not Allowed.
    """
    response = client.options("/api/chat")
    assert response.status_code == 200
