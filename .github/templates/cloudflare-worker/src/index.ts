/**
 * NOIZY Empire — Cloudflare Worker Template
 * Constitutional: Every request checks consent before processing.
 * GORUNFREE · Gospel Deal enforced in code.
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GABRIEL_URL: string;        // http://10.90.90.10:7777
  ENVIRONMENT: string;        // production | staging
}

// ── GORUNFREE Constitutional Constants ───────────────────────────────────────
const FOUNDING_ROYALTY_FLOOR = 0.75;
const NOIZYKIDZ_TITHE = 0.01;

// ── Consent Gate ─────────────────────────────────────────────────────────────
async function checkConsent(
  db: D1Database,
  hvs_id: string,
  use_type: string
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT id FROM consent_matrix
       WHERE hvs_id = ? AND use_type = ? AND granted = 1
         AND (expires_at IS NULL OR expires_at > datetime('now'))
       ORDER BY id DESC LIMIT 1`
    )
    .bind(hvs_id, use_type)
    .first();
  return !!row;
}

// ── Royalty Guard ─────────────────────────────────────────────────────────────
function validateRoyaltySplit(split: number): void {
  if (split < FOUNDING_ROYALTY_FLOOR) {
    throw new Error(
      `CONSTITUTIONAL VIOLATION: royalty_split ${split} below founding floor ${FOUNDING_ROYALTY_FLOOR}`
    );
  }
}

// ── Audit Logger ─────────────────────────────────────────────────────────────
async function auditLog(
  db: D1Database,
  event_type: string,
  actor: string,
  payload: unknown
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO estate_audit (hvs_id, event_type, actor, payload)
       VALUES (NULL, ?, ?, ?)`
    )
    .bind(event_type, actor, JSON.stringify(payload))
    .run();
}

// ── CORS Headers ──────────────────────────────────────────────────────────────
function corsHeaders(origin: string = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    try {
      // ── Health ────────────────────────────────────────────────────────────
      if (url.pathname === '/health') {
        return Response.json(
          { ok: true, env: env.ENVIRONMENT, gorunfree: true },
          { headers: corsHeaders(origin) }
        );
      }

      // ── Example: consent-gated endpoint ──────────────────────────────────
      if (url.pathname === '/api/voice/synthesize' && request.method === 'POST') {
        const body = await request.json() as { hvs_id: string; text: string };

        // CONSTITUTIONAL: consent check before any voice synthesis
        const hasConsent = await checkConsent(env.DB, body.hvs_id, 'voice_synthesis');
        if (!hasConsent) {
          await auditLog(env.DB, 'CONSENT_DENIED', 'worker', { hvs_id: body.hvs_id, use_type: 'voice_synthesis' });
          return Response.json(
            { error: 'Consent not granted for voice_synthesis', hvs_id: body.hvs_id },
            { status: 403, headers: corsHeaders(origin) }
          );
        }

        await auditLog(env.DB, 'VOICE_SYNTHESIS_REQUEST', body.hvs_id, { text_length: body.text.length });

        // TODO: implement synthesis logic here
        return Response.json({ ok: true, message: 'Synthesis queued' }, { headers: corsHeaders(origin) });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders(origin) });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return Response.json({ error: message }, { status: 500, headers: corsHeaders(origin) });
    }
  },
} satisfies ExportedHandler<Env>;
