from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

API_HEADERS = {"X-API-Key": "local-dev-token"}
ADMIN_HEADERS = {"X-API-Key": "local-admin-token"}


def test_health_check() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "timestamp" in body


def test_voice_policy_and_generation_flow() -> None:
    voice_name = f"calm-voice-smoke-{uuid4().hex[:8]}"
    with TestClient(app) as client:
        unauth_response = client.get("/api/v1/voices/profiles")
        assert unauth_response.status_code == 401

        create_response = client.post(
            "/api/v1/voices/profiles",
            json={
                "artist_id": "artist-1",
                "voice_name": voice_name,
                "modes": ["calm", "story"],
            },
            headers=API_HEADERS,
        )
        assert create_response.status_code == 201
        voice_id = create_response.json()["id"]

        status_response = client.patch(
            f"/api/v1/voices/profiles/{voice_id}/status",
            json={"status": "published"},
            headers=API_HEADERS,
        )
        assert status_response.status_code == 200

        policy_response = client.put(
            f"/api/v1/voices/profiles/{voice_id}/license",
            json={
                "allowed_contexts": ["education", "accessibility_reading"],
                "disallowed_contexts": ["political"],
                "pricing_tier": "indie",
                "usage_model": "per_character",
            },
            headers=API_HEADERS,
        )
        assert policy_response.status_code == 200

        generate_ok = client.post(
            "/api/v1/voices/generate",
            json={
                "voice_id": voice_id,
                "buyer_id": "buyer-1",
                "context": "education",
                "mode": "calm",
                "tier": "indie",
                "characters_generated": 1200,
            },
            headers=API_HEADERS,
        )
        assert generate_ok.status_code == 201

        generate_blocked = client.post(
            "/api/v1/voices/generate",
            json={
                "voice_id": voice_id,
                "buyer_id": "buyer-1",
                "context": "political",
                "mode": "calm",
                "tier": "indie",
                "characters_generated": 1200,
            },
            headers=API_HEADERS,
        )
        assert generate_blocked.status_code == 400

        moderation_user_denied = client.get("/api/v1/moderation/incidents", headers=API_HEADERS)
        assert moderation_user_denied.status_code == 403

        moderation_admin_ok = client.get("/api/v1/moderation/incidents", headers=ADMIN_HEADERS)
        assert moderation_admin_ok.status_code == 200
