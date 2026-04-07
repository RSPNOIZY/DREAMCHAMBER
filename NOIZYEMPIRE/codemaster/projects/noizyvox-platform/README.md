# NOIZYVOX Platform Backend

This service implements the NOIZYVOX architecture with:

- Calm Studio flows
- Regulation Voices flows
- Moderation and safety review
- Research opt-in and aggregate outputs

## Stack

- FastAPI
- SQLAlchemy
- SQLite (default)
- Pydantic

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Folder Structure

```text
noizyvox-platform/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── calm.py
│   │       ├── health.py
│   │       ├── moderation.py
│   │       ├── research.py
│   │       └── voices.py
│   ├── core/
│   │   └── config.py
│   ├── db/
│   │   ├── base.py
│   │   ├── init_db.py
│   │   └── session.py
│   ├── models/
│   │   ├── calm.py
│   │   ├── moderation.py
│   │   ├── research.py
│   │   └── voices.py
│   ├── schemas/
│   │   ├── calm.py
│   │   ├── moderation.py
│   │   ├── research.py
│   │   └── voices.py
│   ├── services/
│   │   ├── calm_service.py
│   │   ├── moderation_service.py
│   │   ├── research_service.py
│   │   └── voices_service.py
│   ├── utils/
│   │   └── ids.py
│   └── main.py
├── tests/
│   └── test_api_smoke.py
├── requirements.txt
└── README.md
```

## Environment

Copy `.env.example` to `.env` if needed. Defaults are safe for local development.

Security-critical env keys:

- `NOIZYVOX_AUTH_ENABLED=true`
- `NOIZYVOX_API_TOKENS=<comma-separated service/user tokens>`
- `NOIZYVOX_ADMIN_TOKENS=<comma-separated admin tokens>`
- `NOIZYVOX_CORS_ORIGINS=<explicit origins only; wildcard is rejected>`
- `NOIZYVOX_ALLOWED_HOSTS=<trusted hostnames>`
- `NOIZYVOX_MAX_BODY_BYTES=<max request body size>`

## API Base

`/api/v1`

## Security Improvements Implemented

- Authentication required on non-health endpoints (`X-API-Key` or `Authorization: Bearer <token>`).
- Admin authorization enforced on moderation review endpoints.
- Strict CORS allow-list (wildcard origins rejected at startup).
- Trusted host allow-list middleware enabled.
- Request size enforcement (`413` when body exceeds configured max).
- Security headers added on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy`
  - `Content-Security-Policy`
- Optional HTTPS enforcement + HSTS with `NOIZYVOX_FORCE_HTTPS=true`.
- Request ID propagation with `X-Request-ID` and structured request logging.

## Backend Services (Domain Layer)

- `app/services/calm_service.py`
  - Calm profile CRUD/list
  - Calm session create/list
  - Recommendation engine based on distress rate
- `app/services/voices_service.py`
  - Voice profile create/list/status update
  - License policy upsert
  - Generation policy enforcement (status + allowed/disallowed + revocations)
  - Revocation rules + usage receipts
- `app/services/moderation_service.py`
  - Incident intake/list
  - Decision actions with status transitions
- `app/services/research_service.py`
  - Caregiver consent upsert/get
  - Aggregate opt-in metrics

## Database Models

- Calm Studio:
  - `CalmProfile`
  - `CalmSession`
- Regulation Voices:
  - `VoiceProfile`
  - `VoiceLicensePolicy`
  - `RevocationRule`
  - `UsageReceipt`
- Moderation:
  - `IncidentReport`
  - `ModerationDecision`
- Research:
  - `ResearchConsent`

## API Endpoints

### Health

- `GET /api/v1/health`

### Calm Studio

- `POST /api/v1/calm/profiles`
- `GET /api/v1/calm/profiles`
- `POST /api/v1/calm/sessions`
- `GET /api/v1/calm/sessions`
- `GET /api/v1/calm/recommendations/{profile_id}`

### Regulation Voices

- `POST /api/v1/voices/profiles`
- `GET /api/v1/voices/profiles`
- `GET /api/v1/voices/profiles/{voice_id}`
- `PATCH /api/v1/voices/profiles/{voice_id}/status`
- `PUT /api/v1/voices/profiles/{voice_id}/license`
- `POST /api/v1/voices/profiles/{voice_id}/revocations`
- `POST /api/v1/voices/generate`
- `GET /api/v1/voices/receipts`

### Moderation

- `POST /api/v1/moderation/incidents`
- `GET /api/v1/moderation/incidents`
- `POST /api/v1/moderation/incidents/{incident_id}/decisions`
- `GET /api/v1/moderation/decisions`

Authorization for moderation:

- `POST /incidents`: authenticated token
- `GET /incidents`: admin token
- `POST /incidents/{id}/decisions`: admin token
- `GET /decisions`: admin token

### Research

- `PUT /api/v1/research/consents`
- `GET /api/v1/research/consents/{caregiver_id}`
- `GET /api/v1/research/aggregate`

## Smoke Tests

```bash
.venv/bin/pytest -q
```

## Example Auth Header

```bash
curl -H "X-API-Key: local-dev-token" http://127.0.0.1:8000/api/v1/voices/profiles
```
