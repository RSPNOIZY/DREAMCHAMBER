# Onboard New Actor

Register a new human actor in the NOIZY consent system with full Never Clause protections.

## Required Information

- Full legal name
- Email address
- Country/territory
- Personal Never Clauses (minimum: inherit RSP_001 defaults, can add more)

## Steps

1. Create actor record via `POST /api/v1/actors` with:
   - actor_id: generated UUID
   - name, email, country
   - is_active: 1
2. Register their personal Never Clauses via `POST /api/v1/never-clauses` for each clause
3. Create estate record via `POST /api/v1/estates` with:
   - 100-year OAIS/PREMIS preservation default
   - Link to actor_id
4. Verify via `GET /api/v1/actors/:id` — confirm active
5. Verify via `GET /api/v1/never-clauses?actor_id=:id` — confirm all clauses active
6. Log ACTOR_ONBOARDED event to ledger
7. Send welcome notification (when webhooks are live)

## Consent Token Setup

After actor is onboarded, they need at least one consent token:
- `POST /api/v1/consent-tokens` with scope, territory, time window
- Token must reference the actor and at least one descendant (or be pre-recording)

## Validation

- Actor must have at least the 7 personal Never Clauses
- System Never Clauses (NC_SYSTEM_INTEGRITY, NC_SYSTEM_TRANSFER) apply globally
- Rate table entry must exist for their use categories
- 75/25 royalty split is non-negotiable
