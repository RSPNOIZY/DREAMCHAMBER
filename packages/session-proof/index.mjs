// ═══════════════════════════════════════════════════════════════
// @noizy/session-proof — index.mjs
//
// Exports: buildManifest, sealSession, verifySession, exportSession
//
// Session structure produced:
//   .session/<SESSION_ID>/
//     notes.ndjson       — operator notes, one JSON object per line
//     markers.ndjson     — temporal markers, one JSON object per line
//     manifest.json      — proof envelope (see MANIFEST_VERSION)
//     seal.sha256        — SHA-256 hash of manifest.json
//
// Integrity model:
//   seal.sha256 = SHA-256(manifest.json canonical string)
//   verifySession() recomputes and compares — tamper-evident, not a legal cert
//
// No external dependencies. Node built-ins only (crypto, fs, path).
// ═══════════════════════════════════════════════════════════════

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const MANIFEST_VERSION = "1.0";
export const SESSION_DIR_ROOT = resolve(
  process.env.NOIZY_SESSION_ROOT || join(process.cwd(), ".session"),
);

// ── Types (JSDoc) ────────────────────────────────────────────
/**
 * @typedef {Object} SessionManifest
 * @property {string} manifest_version
 * @property {string} session_id
 * @property {string} started_at        — ISO 8601
 * @property {string|null} ended_at     — ISO 8601 or null if still open
 * @property {string} model             — e.g. "claude-opus-4-5"
 * @property {string[]} active_mcp_servers
 * @property {number} tool_invocations
 * @property {"local"|"remote"} operator_mode
 * @property {string} export_version    — semver of this package
 * @property {Object} files             — {notes, markers} line counts
 * @property {string} integrity         — "sha256"
 */

// ── Helpers ──────────────────────────────────────────────────
function sha256(str) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

function canonicalize(obj) {
  // Deterministic JSON for hashing — sorted keys, no extra whitespace
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function countLines(filePath) {
  if (!existsSync(filePath)) return 0;
  const content = readFileSync(filePath, "utf8").trim();
  if (!content) return 0;
  return content.split("\n").length;
}

function sessionDir(sessionId) {
  return join(SESSION_DIR_ROOT, sessionId);
}

// ── Core API ─────────────────────────────────────────────────

/**
 * Initialize a new session directory.
 * Creates .session/<id>/ with empty notes.ndjson and markers.ndjson.
 *
 * @param {string} sessionId
 * @param {{ model?: string, mcpServers?: string[], mode?: "local"|"remote" }} opts
 * @returns {{ sessionId: string, dir: string, startedAt: string }}
 */
export function initSession(sessionId, opts = {}) {
  const dir = sessionDir(sessionId);
  mkdirSync(dir, { recursive: true });

  const startedAt = new Date().toISOString();

  // Write empty NDJSON files with header comment (not valid JSON — operators read these)
  if (!existsSync(join(dir, "notes.ndjson"))) {
    writeFileSync(
      join(dir, "notes.ndjson"),
      `{"_type":"session_start","session_id":"${sessionId}","started_at":"${startedAt}"}\n`,
    );
  }
  if (!existsSync(join(dir, "markers.ndjson"))) {
    writeFileSync(
      join(dir, "markers.ndjson"),
      `{"_type":"session_start","session_id":"${sessionId}","started_at":"${startedAt}"}\n`,
    );
  }

  // Persist metadata for later sealing
  const meta = {
    session_id: sessionId,
    started_at: startedAt,
    model: opts.model || "unknown",
    active_mcp_servers: opts.mcpServers || [],
    operator_mode: opts.mode || "local",
  };
  writeFileSync(join(dir, ".meta.json"), JSON.stringify(meta, null, 2));

  return { sessionId, dir, startedAt };
}

/**
 * Append a note to notes.ndjson.
 *
 * @param {string} sessionId
 * @param {string} content
 * @param {Object} [extra] — additional fields to include in the note record
 */
export function appendNote(sessionId, content, extra = {}) {
  const dir = sessionDir(sessionId);
  const record = {
    _type: "note",
    session_id: sessionId,
    ts: new Date().toISOString(),
    content,
    ...extra,
  };
  appendFileSync(join(dir, "notes.ndjson"), JSON.stringify(record) + "\n");
}

/**
 * Append a marker to markers.ndjson.
 *
 * @param {string} sessionId
 * @param {string} label
 * @param {Object} [extra]
 */
export function appendMarker(sessionId, label, extra = {}) {
  const dir = sessionDir(sessionId);
  const record = {
    _type: "marker",
    session_id: sessionId,
    ts: new Date().toISOString(),
    label,
    ...extra,
  };
  appendFileSync(join(dir, "markers.ndjson"), JSON.stringify(record) + "\n");
}

/**
 * Build the manifest.json proof envelope for a session.
 * Does NOT write to disk. Returns the manifest object.
 *
 * @param {string} sessionId
 * @param {{ toolInvocations?: number, endedAt?: string }} [opts]
 * @returns {SessionManifest}
 */
export function buildManifest(sessionId, opts = {}) {
  const dir = sessionDir(sessionId);
  const metaPath = join(dir, ".meta.json");

  if (!existsSync(metaPath)) {
    throw new Error(`Session not initialized: ${sessionId}. Run initSession() first.`);
  }

  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const notesCount = countLines(join(dir, "notes.ndjson"));
  const markersCount = countLines(join(dir, "markers.ndjson"));

  const manifest = {
    manifest_version: MANIFEST_VERSION,
    session_id: meta.session_id,
    started_at: meta.started_at,
    ended_at: opts.endedAt || new Date().toISOString(),
    model: meta.model,
    active_mcp_servers: meta.active_mcp_servers,
    tool_invocations: opts.toolInvocations ?? 0,
    operator_mode: meta.operator_mode,
    export_version: "1.0.0",
    files: {
      notes_lines: notesCount,
      markers_lines: markersCount,
    },
    integrity: "sha256",
  };

  return manifest;
}

/**
 * Seal a session: write manifest.json and seal.sha256.
 * SHA-256 is computed over the canonical (sorted-key) JSON of manifest.json.
 *
 * @param {string} sessionId
 * @param {{ toolInvocations?: number, endedAt?: string }} [opts]
 * @returns {{ manifestPath: string, sealPath: string, hash: string }}
 */
export function sealSession(sessionId, opts = {}) {
  const dir = sessionDir(sessionId);
  const manifest = buildManifest(sessionId, opts);
  const canonical = canonicalize(manifest);
  const hash = sha256(canonical);

  const manifestPath = join(dir, "manifest.json");
  const sealPath = join(dir, "seal.sha256");

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  writeFileSync(sealPath, `${hash}  manifest.json\n`);

  return { manifestPath, sealPath, hash };
}

/**
 * Verify a sealed session.
 * Recomputes SHA-256 of manifest.json and compares to seal.sha256.
 *
 * @param {string} sessionId
 * @returns {{ valid: boolean, expected: string, actual: string, manifest: SessionManifest }}
 */
export function verifySession(sessionId) {
  const dir = sessionDir(sessionId);
  const manifestPath = join(dir, "manifest.json");
  const sealPath = join(dir, "seal.sha256");

  if (!existsSync(manifestPath))
    throw new Error(`manifest.json not found for session: ${sessionId}`);
  if (!existsSync(sealPath)) throw new Error(`seal.sha256 not found for session: ${sessionId}`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const canonical = canonicalize(manifest);
  const actual = sha256(canonical);

  // seal.sha256 format: "<hash>  manifest.json"
  const sealLine = readFileSync(sealPath, "utf8").trim();
  const expected = sealLine.split(/\s+/)[0];

  return {
    valid: actual === expected,
    expected,
    actual,
    manifest,
  };
}

/**
 * Full export: seal + return summary.
 * This is the single call for "end of session" operator workflow.
 *
 * @param {string} sessionId
 * @param {{ toolInvocations?: number }} [opts]
 * @returns {{ sessionId, dir, hash, manifest, valid }}
 */
export function exportSession(sessionId, opts = {}) {
  const { hash, manifestPath, sealPath } = sealSession(sessionId, opts);
  const verification = verifySession(sessionId);

  return {
    sessionId,
    dir: sessionDir(sessionId),
    hash,
    manifestPath,
    sealPath,
    manifest: verification.manifest,
    valid: verification.valid,
  };
}
