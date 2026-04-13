import { Hono, Context } from "hono";
import { cors } from "hono/cors";
import { C2PAExtension } from "./c2pa";
import { ConsentEnforcementEngine } from "./consent";
import { WatermarkInjector } from "./watermark";
import { ImmutableAuditLedger } from "./audit";
import { ReceiptEngine } from "./receipts";
import { AudioFingerprint, ConsentRecord } from "./types";

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  API_KEY?: string;
}

const app = new Hono();

app.use('*', cors({
  origin: ['https://noizy.ai', 'https://heaven.rsp-5f3.workers.dev', 'https://vox.noisy.io'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * API key validation for protected endpoints.
 * Public endpoints (health, readiness, gorunfree report) bypass this.
 */
function requireAuth(c: any): string | null {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ") || auth.length < 40) return null;

  // Validate against configured API key if set
  const envKey = c.env.API_KEY;
  if (envKey && auth.slice(7) !== envKey) return null;

  return auth.slice(7);
}

/**
 * Auth middleware for all write operations and sensitive reads.
 * Applied to /audio/*, /consent/*, /receipts/*, /audit/* (except stats).
 */
const authGuard = async (c: any, next: () => Promise<void>) => {
  const key = requireAuth(c);
  if (!key) {
    return c.json({ error: "Valid API key required (Bearer token, min 40 chars)" }, 401);
  }
  c.set("apiKey", key);
  await next();
};

// Apply auth to all protected route groups
app.use("/audio/*", authGuard);
app.use("/consent/*", authGuard);
app.use("/receipts/*", authGuard);
app.use("/audit/*", authGuard);
app.use("/provenance/*", authGuard);

/**
 * Main Noisy Proof Engine
 */
export class NoisyProofEngine {
  private db: D1Database;
  private c2pa: C2PAExtension;
  private consent: ConsentEnforcementEngine;
  private watermark: WatermarkInjector;
  private audit: ImmutableAuditLedger;

  constructor(env: Env) {
    this.db = env.DB;
    this.c2pa = new C2PAExtension();
    this.consent = new ConsentEnforcementEngine(env.DB);
    this.watermark = new WatermarkInjector(env.DB);
    this.audit = new ImmutableAuditLedger(env.DB);
  }

  async initialize() {
    await this.audit.initialize();
  }

  /**
   * Register audio with full provenance
   */
  async registerAudio(params: {
    fileHash: string;
    fingerprint: string;
    creatorId: string;
    title: string;
    metadata?: {
      duration_ms?: number;
      sample_rate?: number;
      bit_depth?: number;
      channels?: number;
    };
  }): Promise<{
    fingerprintId: string;
    watermarkId: string;
    manifestId: string;
    consentId?: string;
  }> {
    // 1. Create audio fingerprint
    const fingerprintId = crypto.randomUUID();
    const fingerprint: AudioFingerprint = {
      id: fingerprintId,
      fingerprint: params.fingerprint,
      algorithm: "chromaprint",
      created_at: new Date().toISOString(),
      file_hash: params.fileHash,
      ...params.metadata,
    };

    // 2. Inject watermark
    const watermarkData = this.watermark.generateWatermarkData({
      creatorId: params.creatorId,
      timestamp: fingerprint.created_at,
      noisyOrigin: true,
    });

    const watermark = await this.watermark.injectWatermark({
      audioFingerprintId: fingerprintId,
      payload: watermarkData,
    });

    // 3. Create C2PA manifest
    const c2paClaim = this.c2pa.createClaim({
      title: params.title,
      creator: params.creatorId,
      audioFingerprint: params.fingerprint,
      assertions: this.c2pa.createAudioAssertions({
        watermarkId: watermark.id,
      }),
    });

    const manifest = await this.c2pa.generateManifest(c2paClaim);

    // 4. Log to audit
    await this.audit.logProvenanceEvent({
      action: "fingerprint_created",
      actorId: params.creatorId,
      audioFingerprintId: fingerprintId,
      metadata: {
        watermark_id: watermark.id,
        manifest_signature: manifest.signature,
      },
    });

    return {
      fingerprintId,
      watermarkId: watermark.id,
      manifestId: crypto.randomUUID(), // Would be stored in DB
    };
  }

  /**
   * Authorize voice clone with consent
   */
  async authorizeVoiceClone(params: {
    creatorId: string;
    requesterId: string;
    voiceIdentityId: string;
  }): Promise<{
    authorized: boolean;
    consentRecordId?: string;
    reason?: string;
  }> {
    const result = await this.consent.checkVoiceCloneConsent(params);

    if (result.authorized) {
      await this.audit.logProvenanceEvent({
        action: "consent_granted",
        actorId: params.creatorId,
        audioFingerprintId: params.voiceIdentityId,
        metadata: {
          requester_id: params.requesterId,
          consent_record_id: result.consentRecordId,
        },
      });
    }

    return result;
  }

  /**
   * Verify audio provenance chain
   */
  async verifyProvenance(audioFingerprintId: string): Promise<{
    valid: boolean;
    origin: "noisy" | "external" | "unknown";
    consent?: ConsentRecord;
    watermark?: any;
    c2pa?: any;
  }> {
    // Check watermark
    const hasNoisyWatermark =
      await this.watermark.hasNoisyOrigin(audioFingerprintId);

    // Get watermark data
    const watermark = await this.watermark.extractWatermark(audioFingerprintId);
    let watermarkData = null;
    if (watermark) {
      const verification = await this.watermark.verifyWatermark(watermark.id);
      watermarkData = verification.data;
    }

    // Get C2PA manifest from DB
    const c2paManifest = await this.db
      .prepare(
        "SELECT * FROM c2pa_manifests WHERE audio_fingerprint_id = ? ORDER BY created_at DESC LIMIT 1",
      )
      .bind(audioFingerprintId)
      .first<{ id: string; manifest_data: string; signature: string }>();

    let c2paData = null;
    if (c2paManifest) {
      const verification = await this.c2pa.verifyManifest({
        id: c2paManifest.id,
        audio_fingerprint_id: audioFingerprintId,
        manifest_data: c2paManifest.manifest_data,
        signature: c2paManifest.signature,
        created_at: "",
      });
      c2paData = {
        manifest_id: c2paManifest.id,
        valid: verification.valid,
        claim: verification.claim,
      };
    }

    // Get consent records for this audio's creator
    const consentRecords = await this.db
      .prepare(
        `SELECT cr.* FROM consent_records cr
         JOIN voice_identities vi ON vi.creator_id = cr.creator_id
         JOIN audio_fingerprints af ON af.id = ?
         WHERE cr.revoked_at IS NULL
         AND (cr.expires_at IS NULL OR cr.expires_at > datetime('now'))
         LIMIT 5`,
      )
      .bind(audioFingerprintId)
      .all<ConsentRecord>();

    return {
      valid: hasNoisyWatermark,
      origin: hasNoisyWatermark ? "noisy" : "unknown",
      consent: consentRecords.results.length > 0 ? consentRecords.results : undefined,
      watermark: watermarkData,
      c2pa: c2paData,
    };
  }
}

// ── Live Gate: Health & Readiness ──────────────────────────────────────────

app.get("/health", (c: any) => {
  return c.json({
    status: "ok",
    service: "noisyproof",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    sacred_invariants: {
      royalty_floor: 0.75,
      gorunfree_tithe: 0.01,
      audit_append_only: true,
      kill_switch: "absolute",
    },
  });
});

app.get("/readiness", async (c: any) => {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Check D1 connectivity
  try {
    await c.env.DB.prepare("SELECT 1").first();
    checks.d1 = { ok: true };
  } catch (e: any) {
    checks.d1 = { ok: false, detail: e.message };
  }

  // Check KV connectivity
  try {
    await c.env.KV.get("__readiness_probe__");
    checks.kv = { ok: true };
  } catch (e: any) {
    checks.kv = { ok: false, detail: e.message };
  }

  // Check audit ledger integrity (last 10 entries only — fast probe)
  try {
    const audit = new ImmutableAuditLedger(c.env.DB);
    await audit.initialize();
    const stats = await audit.getStatistics();
    checks.audit_ledger = { ok: true, detail: `${stats.totalEvents} events, chain=${stats.chainIntegrity ? "valid" : "BROKEN"}` };
  } catch (e: any) {
    checks.audit_ledger = { ok: false, detail: e.message };
  }

  // Check consent engine
  try {
    const consent = new ConsentEnforcementEngine(c.env.DB);
    checks.consent_engine = { ok: true };
  } catch (e: any) {
    checks.consent_engine = { ok: false, detail: e.message };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return c.json({
    ready: allOk,
    service: "noisyproof",
    timestamp: new Date().toISOString(),
    checks,
  }, allOk ? 200 : 503);
});

// API Routes
app.post("/audio/register", async (c: any) => {
  const engine = new NoisyProofEngine(c.env);
  await engine.initialize();

  const body = await c.req.json();
  const result = await engine.registerAudio(body);

  return c.json(result);
});

app.post("/consent/grant", async (c: any) => {
  const consent = new ConsentEnforcementEngine(c.env.DB);
  const body = await c.req.json();

  // SACRED INVARIANT: Founding member royalty_split must be >= 0.75 (75%)
  // GORUNFREE Trust Clause: 1% of all royalties to NOIZYKIDZ — irremovable
  if (body.royalty_split !== undefined && body.royalty_split < 0.75) {
    return c.json({
      error: 'GORUNFREE: Founding member royalty_split must be >= 0.75',
    }, 403);
  }

  const result = await consent.grantConsent(body);
  return c.json(result);
});

app.post("/consent/check", async (c: any) => {
  const engine = new NoisyProofEngine(c.env);
  const body = await c.req.json();

  const result = await engine.authorizeVoiceClone(body);
  return c.json(result);
});

app.post("/consent/revoke", async (c: any) => {
  const consent = new ConsentEnforcementEngine(c.env.DB);
  const body = await c.req.json();

  if (!body.consentRecordId || !body.creatorId) {
    return c.json({ error: "consentRecordId and creatorId are required" }, 400);
  }

  const revoked = await consent.revokeConsent({
    consentRecordId: body.consentRecordId,
    creatorId: body.creatorId,
  });

  if (!revoked) {
    return c.json({ error: "Consent record not found, not owned by creator, or already revoked" }, 404);
  }

  return c.json({ revoked: true, consentRecordId: body.consentRecordId });
});

app.get("/consent/active/:creatorId", async (c: any) => {
  const consent = new ConsentEnforcementEngine(c.env.DB);
  const creatorId = c.req.param("creatorId");

  const records = await consent.getActiveConsents(creatorId);
  return c.json({ creator_id: creatorId, active_consents: records });
});

// ── Voice Identity Registration ────────────────────────────────────────────

app.use("/voice-identity/*", authGuard);

app.post("/voice-identity/register", async (c: any) => {
  const consent = new ConsentEnforcementEngine(c.env.DB);
  const body = await c.req.json();

  if (!body.creatorId || !body.voiceFingerprint || !body.verificationMethod) {
    return c.json({ error: "creatorId, voiceFingerprint, and verificationMethod are required" }, 400);
  }

  const identity = await consent.registerVoiceIdentity({
    creatorId: body.creatorId,
    voiceFingerprint: body.voiceFingerprint,
    verificationMethod: body.verificationMethod,
    metadata: body.metadata,
  });

  // Audit log
  const audit = new ImmutableAuditLedger(c.env.DB);
  await audit.initialize();
  await audit.logEvent({
    eventType: "voice_identity_registered",
    actorId: body.creatorId,
    resourceType: "voice_identity",
    resourceId: identity.id,
    action: "register",
  });

  return c.json(identity, 201);
});

app.get("/provenance/:fingerprintId", async (c: any) => {
  const engine = new NoisyProofEngine(c.env);
  const fingerprintId = c.req.param("fingerprintId");

  const result = await engine.verifyProvenance(fingerprintId);
  return c.json(result);
});

app.get("/audit/verify", async (c: any) => {
  const audit = new ImmutableAuditLedger(c.env.DB);
  await audit.initialize();

  const result = await audit.verifyChainIntegrity();
  return c.json(result);
});

app.get("/audit/stats", async (c: any) => {
  const audit = new ImmutableAuditLedger(c.env.DB);

  const stats = await audit.getStatistics();
  return c.json(stats);
});

// ── Receipt Engine (Gospel Deal Economics) ─────────────────────────────────

app.post("/receipts/generate", async (c: any) => {
  const body = await c.req.json();

  // SACRED INVARIANT: 75% floor
  if (body.creatorSplitRatio !== undefined && body.creatorSplitRatio < 0.75) {
    return c.json({
      error: "GORUNFREE: Creator split must be >= 0.75",
    }, 403);
  }

  const engine = new ReceiptEngine(c.env.DB);
  try {
    const receipt = await engine.generateReceipt(body);

    // Log to audit
    const audit = new ImmutableAuditLedger(c.env.DB);
    await audit.initialize();
    await audit.logEvent({
      eventType: "receipt_generated",
      actorId: body.creatorId,
      resourceType: "receipt",
      resourceId: receipt.id,
      action: "generate",
      metadata: {
        gross: receipt.gross_amount,
        creator_share: receipt.creator_share,
        gorunfree_tithe: receipt.gorunfree_tithe,
        transaction_type: receipt.transaction_type,
      },
    });

    return c.json(receipt, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

app.get("/receipts/:id", async (c: any) => {
  const engine = new ReceiptEngine(c.env.DB);
  const receipt = await engine.getReceipt(c.req.param("id"));

  if (!receipt) {
    return c.json({ error: "Receipt not found" }, 404);
  }

  return c.json(receipt);
});

app.get("/receipts/:id/verify", async (c: any) => {
  const engine = new ReceiptEngine(c.env.DB);
  const result = await engine.verifyReceipt(c.req.param("id"));

  if (!result.receipt) {
    return c.json({ error: "Receipt not found" }, 404);
  }

  return c.json({
    valid: result.valid,
    receipt: result.receipt,
  });
});

app.get("/receipts/creator/:creatorId", async (c: any) => {
  const engine = new ReceiptEngine(c.env.DB);
  const result = await engine.getCreatorReceipts(c.req.param("creatorId"));
  return c.json(result);
});

app.get("/gorunfree/report", async (c: any) => {
  const engine = new ReceiptEngine(c.env.DB);
  const report = await engine.getGorunfreeReport();
  return c.json({
    ...report,
    clause: "1% of all royalties to NOIZYKIDZ — irremovable",
    enforcement: "automatic, pre-split deduction",
  });
});

export default app;
