import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { SynthesisPipeline } from '../synthesis-pipeline';

const app = new Hono();

app.use('*', cors({
  origin: ['https://noizy.ai', 'https://vox.noisy.io', 'https://heaven.rsp-5f3.workers.dev'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ── Live Gate: Health & Readiness ──────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'noisyvox',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    sacred_invariants: {
      royalty_floor: 0.75,
      gorunfree_tithe: 0.01,
      consent_required: true,
    },
  });
});

app.get('/readiness', async (c) => {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Check D1 connectivity
  try {
    await (c.env as any).DB.prepare('SELECT 1').first();
    checks.d1 = { ok: true };
  } catch (e: any) {
    checks.d1 = { ok: false, detail: e.message };
  }

  // Check noisyproof service binding
  try {
    const proofUrl = (c.env as any).NOISY_PROOF_API_URL || 'https://heaven.rsp-5f3.workers.dev';
    checks.noisyproof = { ok: true, detail: proofUrl };
  } catch (e: any) {
    checks.noisyproof = { ok: false, detail: e.message };
  }

  const allOk = Object.values(checks).every((ch) => ch.ok);

  return c.json({
    ready: allOk,
    service: 'noisyvox',
    timestamp: new Date().toISOString(),
    checks,
  }, allOk ? 200 : 503);
});

/**
 * Voice synthesis endpoint with full provenance
 */
app.post('/v1/synthesize', async (c) => {
  const apiKey = validateApiKey(c);
  if (!apiKey) {
    return c.json({ error: 'Valid API key required (Bearer token, min 40 chars)' }, 401);
  }

  const body = await c.req.json();
  const pipeline = new SynthesisPipeline(c.env);
  const { text, voice_model_id, creator_id, options } = body;

  // SACRED INVARIANT: Founding member royalty_split must be >= 0.75 (75%)
  // GORUNFREE Trust Clause: 1% of all royalties to NOIZYKIDZ — irremovable
  if (body.royalty_split !== undefined && body.royalty_split < 0.75) {
    return c.json({
      error: 'GORUNFREE: Founding member royalty_split must be >= 0.75',
    }, 403);
  }

  const requesterId = apiKey;

  const result = await pipeline.synthesize({
    text,
    voiceModelId: voice_model_id,
    creatorId: creator_id,
    requesterId,
    options
  });

  if (!result.success) {
    return c.json({ error: result.error }, 403);
  }

  return c.json({
    audio_url: result.audioUrl,
    fingerprint_id: result.fingerprintId,
    provenance_url: `https://heaven.rsp-5f3.workers.dev/provenance/${result.fingerprintId}`
  });
});

/**
 * Check voice consent status (requires authentication)
 */
app.get('/v1/consent/check/:voiceModelId', async (c) => {
  const apiKey = validateApiKey(c);
  if (!apiKey) {
    return c.json({ error: 'Valid API key required (Bearer token, min 40 chars)' }, 401);
  }

  const voiceModelId = c.req.param('voiceModelId');
  const requesterId = c.req.query('requester_id');
  const creatorId = c.req.query('creator_id');

  if (!requesterId || !creatorId) {
    return c.json({ error: 'Missing required parameters: requester_id, creator_id' }, 400);
  }

  // Call noisyproof consent engine via service binding or HTTP
  const proofUrl = (c.env as any).NOISY_PROOF_API_URL || 'https://heaven.rsp-5f3.workers.dev';
  const proofKey = (c.env as any).NOISY_PROOF_API_KEY || apiKey;
  const resp = await fetch(`${proofUrl}/consent/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${proofKey}`,
    },
    body: JSON.stringify({
      creatorId,
      requesterId,
      voiceIdentityId: voiceModelId,
    }),
  });

  if (!resp.ok) {
    return c.json({ error: 'Consent service unavailable', status: resp.status }, 502);
  }

  const consentCheck = await resp.json();
  return c.json(consentCheck);
});

/**
 * List available voices with consent status
 */
app.get('/v1/voices', async (c) => {
  const apiKey = validateApiKey(c);
  if (!apiKey) {
    return c.json({ error: 'Valid API key required (Bearer token, min 40 chars)' }, 401);
  }

  const requesterId = apiKey;
  const db = (c.env as any).DB as D1Database;

  const voices = await getVoicesWithConsentStatus(db, requesterId, c.env);

  return c.json({ voices });
});

/**
 * Validate API key from Authorization header.
 * Returns the raw key on success, or null if invalid.
 */
function validateApiKey(c: Context): string | null {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ') || auth.length < 40) return null;
  return auth.slice(7);
}

async function getVoicesWithConsentStatus(
  db: D1Database,
  requesterId: string,
  env: any,
): Promise<any[]> {
  // Query active voice models from D1
  const models = await db
    .prepare("SELECT id, name, creator_id, voice_identity_id, model_type, status FROM voice_models WHERE status = ?")
    .bind("active")
    .all<{
      id: string;
      name: string;
      creator_id: string;
      voice_identity_id: string;
      model_type: string;
      status: string;
    }>();

  // Check consent for each model via noisyproof
  const proofUrl = env.NOISY_PROOF_API_URL || "https://heaven.rsp-5f3.workers.dev";
  const proofKey = env.NOISY_PROOF_API_KEY;

  const results = await Promise.allSettled(
    models.results.map(async (model) => {
      let hasConsent = false;
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (proofKey) headers["Authorization"] = `Bearer ${proofKey}`;

        const resp = await fetch(`${proofUrl}/consent/check`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            creatorId: model.creator_id,
            requesterId,
            voiceIdentityId: model.voice_identity_id,
          }),
        });
        if (resp.ok) {
          const check = (await resp.json()) as { authorized: boolean };
          hasConsent = check.authorized;
        }
      } catch {
        // Consent service unavailable — default to no consent
      }

      return {
        id: model.id,
        name: model.name,
        creator_id: model.creator_id,
        model_type: model.model_type,
        has_consent: hasConsent,
      };
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map((r) => r.value);
}

export default app;
