/**
 * NOIZY Enterprise Azure Function — Content Sanitization + Claude Enrichment
 * Trigger: HTTP POST (called by Power Automate or direct API)
 * Purpose: Sanitize inbound content, extract voice/consent signals, enrich via Claude
 *
 * Deploy: Azure Functions Node.js v4 runtime
 * Env vars required: ANTHROPIC_API_KEY, NOIZY_API_KEY, HEAVEN_URL
 */

const { app } = require("@azure/functions");
const Anthropic = require("@anthropic-ai/sdk");

// ── Constants ────────────────────────────────────────────────────────────────

const HEAVEN_URL = process.env.HEAVEN_URL || "https://heaven.rsp-5f3.workers.dev";
const NOIZY_API_KEY = process.env.NOIZY_API_KEY;
const MAX_CONTENT_CHARS = 50_000;

const SANITIZE_SYSTEM_PROMPT = `You are the NOIZY Content Intake Analyst.

Your role: sanitize and extract structured consent + provenance signals from raw content submitted to the NOIZY platform.

Rules:
- Strip PII beyond what is required for creator identity (name, email, consent scope).
- Flag any content that mentions voice cloning, deepfakes, synthetic media, or AI-generated audio.
- Identify consent signals: explicit consent, implied consent, revocation language, licensing terms.
- Extract: creator_name, creator_email, content_type, consent_signals[], risk_flags[], summary.
- Respond ONLY with valid JSON matching the schema below. No prose.

Output schema:
{
  "creator_name": "string | null",
  "creator_email": "string | null",
  "content_type": "voice_sample | license_request | revocation | general | unknown",
  "consent_signals": ["string"],
  "risk_flags": ["string"],
  "summary": "string (max 200 chars)",
  "requires_human_review": true | false,
  "confidence": 0.0–1.0
}`;

// ── Sanitizer ────────────────────────────────────────────────────────────────

async function sanitizeContent(rawContent, anthropic) {
  const truncated = rawContent.slice(0, MAX_CONTENT_CHARS);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SANITIZE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze and sanitize this content:\n\n${truncated}`,
      },
    ],
  });

  const raw = message.content[0]?.text || "{}";

  try {
    return JSON.parse(raw);
  } catch {
    return {
      creator_name: null,
      creator_email: null,
      content_type: "unknown",
      consent_signals: [],
      risk_flags: ["parse_error"],
      summary: "Failed to parse Claude response",
      requires_human_review: true,
      confidence: 0.0,
    };
  }
}

// ── Consent Gateway Check ────────────────────────────────────────────────────

async function checkConsentGateway(creatorEmail, toolName = "azure-ingest") {
  if (!NOIZY_API_KEY || !creatorEmail) return null;

  try {
    const res = await fetch(`${HEAVEN_URL}/consent/check-eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NOIZY-Key": NOIZY_API_KEY,
      },
      body: JSON.stringify({ creator_email: creatorEmail, tool_name: toolName }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Enrichment ───────────────────────────────────────────────────────────────

async function enrichWithClaude(sanitized, anthropic) {
  const ENRICH_PROMPT = `You are a NOIZY consent and provenance analyst.

Given this sanitized content intake record, produce an enriched action plan:
- If content_type is "voice_sample": recommend NCP token creation steps.
- If content_type is "license_request": outline the approval workflow.
- If content_type is "revocation": flag urgency and 1-hour SLA.
- Identify any NO FAKES Act (US) or EU AI Act compliance issues.
- Output structured JSON only.

Output schema:
{
  "recommended_action": "create_ncp | escalate | log_only | revocation_urgent | review",
  "compliance_flags": {
    "no_fakes_act": true | false,
    "eu_ai_act": true | false
  },
  "ncp_fields_suggested": { "scope": "string", "tools_allowed": ["string"] } | null,
  "priority": "P0" | "P1" | "P2" | "P3",
  "notes": "string"
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: ENRICH_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(sanitized, null, 2),
      },
    ],
  });

  const raw = message.content[0]?.text || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return { recommended_action: "review", priority: "P2", notes: "Parse error in enrichment" };
  }
}

// ── Main Handler ─────────────────────────────────────────────────────────────

app.http("noizyIngest", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    const startMs = Date.now();

    // Auth
    const inboundKey = request.headers.get("x-noizy-key");
    if (inboundKey !== NOIZY_API_KEY) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }

    const { content, source, metadata = {} } = body;

    if (!content || typeof content !== "string") {
      return { status: 400, body: JSON.stringify({ error: "content field required (string)" }) };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Step 1: Sanitize
    context.log(`[NOIZY-INGEST] Sanitizing from source=${source}`);
    const sanitized = await sanitizeContent(content, anthropic);

    // Step 2: Consent gateway check (non-blocking enrichment)
    const [consentStatus, enrichment] = await Promise.all([
      checkConsentGateway(sanitized.creator_email),
      enrichWithClaude(sanitized, anthropic),
    ]);

    // Step 3: Compose result
    const result = {
      intake_id: `ingest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      source: source || "unknown",
      timestamp: new Date().toISOString(),
      processing_ms: Date.now() - startMs,
      sanitized,
      enrichment,
      consent_status: consentStatus || { checked: false },
      metadata,
    };

    context.log(
      `[NOIZY-INGEST] Done: action=${enrichment.recommended_action} priority=${enrichment.priority}`
    );

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result, null, 2),
    };
  },
});
