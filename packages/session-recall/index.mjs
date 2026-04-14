// ═══════════════════════════════════════════════════════════════
// @noizy/session-recall — index.mjs
//
// Cross-session recall: post-session, read-only, operator-invoked.
//
// OPERATOR RULES (non-negotiable):
//   ✗  NEVER inject recalled content into live creative sessions
//   ✗  NEVER run recall automatically in the background
//   ✓  Recall ONLY post-session, via explicit operator command
//   ✓  Index ONLY text-safe fields from sealed manifests
//   ✓  Expose retrieval only through deliberate Plan-agent workflows
//
// Index structure:
//   .session/recall-index.json  — lightweight inverted index over sealed sessions
//
// Indexed fields (text-safe only):
//   session_id, model, operator_mode, active_mcp_servers,
//   started_at, ended_at, tool_invocations
//   notes content (text only, no metadata)
//   marker labels (text only)
//
// Search: simple substring + field match (no external deps)
// External vector/semantic search is a future opt-in, never default.
// ═══════════════════════════════════════════════════════════════

import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const SESSION_DIR_ROOT = resolve(
  process.env.NOIZY_SESSION_ROOT || join(process.cwd(), ".session"),
);
export const INDEX_PATH = join(SESSION_DIR_ROOT, "recall-index.json");

// ── Types (JSDoc) ────────────────────────────────────────────
/**
 * @typedef {Object} RecallEntry
 * @property {string} session_id
 * @property {string} started_at
 * @property {string} ended_at
 * @property {string} model
 * @property {string} operator_mode
 * @property {string[]} active_mcp_servers
 * @property {number} tool_invocations
 * @property {string[]} notes          — text content only
 * @property {string[]} markers        — label text only
 * @property {boolean} seal_valid      — was seal verified at index time?
 * @property {string} indexed_at
 */

// ── Helpers ──────────────────────────────────────────────────
function readNdjson(filePath) {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function verifySessionSeal(sessionId) {
  // Inline verify — no circular dep on session-proof package
  const dir = join(SESSION_DIR_ROOT, sessionId);
  const manifestPath = join(dir, "manifest.json");
  const sealPath = join(dir, "seal.sha256");
  if (!existsSync(manifestPath) || !existsSync(sealPath)) return false;
  try {
    const { createHash } = await_import_crypto();
    const manifest = readFileSync(manifestPath, "utf8");
    const manifestObj = JSON.parse(manifest);
    const canonical = JSON.stringify(manifestObj, Object.keys(manifestObj).sort());
    const actual = createHash("sha256").update(canonical, "utf8").digest("hex");
    const sealLine = readFileSync(sealPath, "utf8").trim();
    const expected = sealLine.split(/\s+/)[0];
    return actual === expected;
  } catch {
    return false;
  }
}

// Lazy sync crypto import workaround for top-level
function await_import_crypto() {
  return require_crypto_builtin();
}

// Pure sync crypto via createRequire
import { createRequire } from "node:module";
const _require = createRequire(import.meta.url);
function require_crypto_builtin() {
  return _require("node:crypto");
}

function loadIndex() {
  if (!existsSync(INDEX_PATH)) return [];
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveIndex(entries) {
  writeFileSync(INDEX_PATH, JSON.stringify(entries, null, 2));
}

// ── Core API ─────────────────────────────────────────────────

/**
 * Index a single sealed session into the recall index.
 * Only indexes text-safe fields. Verifies seal before indexing.
 *
 * @param {string} sessionId
 * @returns {RecallEntry}
 */
export function indexSession(sessionId) {
  const dir = join(SESSION_DIR_ROOT, sessionId);
  const manifestPath = join(dir, "manifest.json");

  if (!existsSync(manifestPath)) {
    throw new Error(`No manifest.json for session: ${sessionId}. Must be sealed first.`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const sealValid = verifySessionSeal(sessionId);

  // Extract text-safe fields from notes (skip _type=session_start)
  const notes = readNdjson(join(dir, "notes.ndjson"))
    .filter((r) => r._type === "note" && typeof r.content === "string")
    .map((r) => r.content);

  // Extract marker labels only
  const markers = readNdjson(join(dir, "markers.ndjson"))
    .filter((r) => r._type === "marker" && typeof r.label === "string")
    .map((r) => r.label);

  const entry = {
    session_id: manifest.session_id,
    started_at: manifest.started_at,
    ended_at: manifest.ended_at,
    model: manifest.model,
    operator_mode: manifest.operator_mode,
    active_mcp_servers: manifest.active_mcp_servers || [],
    tool_invocations: manifest.tool_invocations || 0,
    notes,
    markers,
    seal_valid: sealValid,
    indexed_at: new Date().toISOString(),
  };

  // Upsert into index
  const index = loadIndex();
  const existing = index.findIndex((e) => e.session_id === sessionId);
  if (existing >= 0) {
    index[existing] = entry;
  } else {
    index.push(entry);
  }
  saveIndex(index);

  return entry;
}

/**
 * Index ALL sealed sessions in SESSION_DIR_ROOT.
 * Skips sessions without manifest.json (not yet sealed).
 *
 * @returns {{ indexed: string[], skipped: string[] }}
 */
export function indexAllSessions() {
  const dirs = readdirSync(SESSION_DIR_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const indexed = [];
  const skipped = [];

  for (const sessionId of dirs) {
    const manifestPath = join(SESSION_DIR_ROOT, sessionId, "manifest.json");
    if (existsSync(manifestPath)) {
      try {
        indexSession(sessionId);
        indexed.push(sessionId);
      } catch (e) {
        skipped.push(`${sessionId} (error: ${e.message})`);
      }
    } else {
      skipped.push(`${sessionId} (not sealed)`);
    }
  }

  return { indexed, skipped };
}

/**
 * Search the recall index.
 * Post-session only. Returns matching entries, never mutates live session.
 *
 * @param {string} query — substring to match against notes, markers, session_id
 * @param {{ model?: string, mode?: string, limit?: number }} [opts]
 * @returns {RecallEntry[]}
 */
export function searchRecall(query, opts = {}) {
  const { model, mode, limit = 20 } = opts;
  const index = loadIndex();
  const q = query.toLowerCase();

  return index
    .filter((entry) => {
      if (model && entry.model !== model) return false;
      if (mode && entry.operator_mode !== mode) return false;

      // Match against session_id, notes, markers, mcp servers
      const corpus = [
        entry.session_id,
        ...entry.notes,
        ...entry.markers,
        ...entry.active_mcp_servers,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(q);
    })
    .sort((a, b) => new Date(b.ended_at) - new Date(a.ended_at))
    .slice(0, limit);
}

/**
 * Get a summary of the recall index.
 *
 * @returns {{ total: number, models: string[], date_range: { earliest: string, latest: string }, invalid_seals: number }}
 */
export function recallStats() {
  const index = loadIndex();
  if (!index.length) return { total: 0, models: [], date_range: null, invalid_seals: 0 };

  const models = [...new Set(index.map((e) => e.model))];
  const dates = index.map((e) => e.ended_at).sort();
  const invalid_seals = index.filter((e) => !e.seal_valid).length;

  return {
    total: index.length,
    models,
    date_range: { earliest: dates[0], latest: dates[dates.length - 1] },
    invalid_seals,
  };
}

/**
 * Get a single session's recall entry by ID.
 *
 * @param {string} sessionId
 * @returns {RecallEntry|null}
 */
export function getSessionEntry(sessionId) {
  const index = loadIndex();
  return index.find((e) => e.session_id === sessionId) || null;
}
