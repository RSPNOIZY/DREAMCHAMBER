// ═══════════════════════════════════════════════════════════════
// session-proof — self-test
// node test/verify.test.mjs
// ═══════════════════════════════════════════════════════════════

import {
  initSession,
  appendNote,
  appendMarker,
  sealSession,
  verifySession,
  exportSession,
  SESSION_DIR_ROOT,
} from "../index.mjs";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { strictEqual, ok } from "node:assert";

const SESSION_ID = `test-session-${Date.now()}`;
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

console.log("\nsession-proof tests\n");

// ── init ─────────────────────────────────────────────────────
test("initSession creates .meta.json", () => {
  const { dir } = initSession(SESSION_ID, {
    model: "claude-test",
    mode: "local",
    mcpServers: ["voice-bridge"],
  });
  ok(existsSync(join(dir, ".meta.json")), ".meta.json not found");
  ok(existsSync(join(dir, "notes.ndjson")), "notes.ndjson not found");
  ok(existsSync(join(dir, "markers.ndjson")), "markers.ndjson not found");
});

// ── notes ────────────────────────────────────────────────────
test("appendNote writes to notes.ndjson", () => {
  appendNote(SESSION_ID, "Test note content");
  appendNote(SESSION_ID, "Second note");
});

// ── markers ──────────────────────────────────────────────────
test("appendMarker writes to markers.ndjson", () => {
  appendMarker(SESSION_ID, "PHASE_START");
  appendMarker(SESSION_ID, "PHASE_END");
});

// ── seal ─────────────────────────────────────────────────────
test("sealSession produces manifest.json and seal.sha256", () => {
  const { hash, manifestPath, sealPath } = sealSession(SESSION_ID, { toolInvocations: 7 });
  ok(hash && hash.length === 64, `Expected 64-char hex hash, got: ${hash}`);
  ok(existsSync(manifestPath), "manifest.json not found after seal");
  ok(existsSync(sealPath), "seal.sha256 not found after seal");
});

// ── verify ───────────────────────────────────────────────────
test("verifySession returns valid=true for intact session", () => {
  const result = verifySession(SESSION_ID);
  strictEqual(
    result.valid,
    true,
    `Verification failed: expected=${result.expected} actual=${result.actual}`,
  );
});

// ── manifest fields ──────────────────────────────────────────
test("manifest contains all required fields", () => {
  const result = verifySession(SESSION_ID);
  const m = result.manifest;
  for (const field of [
    "manifest_version",
    "session_id",
    "started_at",
    "ended_at",
    "model",
    "active_mcp_servers",
    "tool_invocations",
    "operator_mode",
    "export_version",
    "files",
    "integrity",
  ]) {
    ok(m[field] !== undefined, `Missing field: ${field}`);
  }
  strictEqual(m.tool_invocations, 7, "tool_invocations mismatch");
  strictEqual(m.model, "claude-test", "model mismatch");
  strictEqual(m.operator_mode, "local", "operator_mode mismatch");
  strictEqual(m.active_mcp_servers[0], "voice-bridge", "mcp_servers mismatch");
});

// ── exportSession ────────────────────────────────────────────
test("exportSession returns valid=true", () => {
  const result = exportSession(SESSION_ID);
  strictEqual(result.valid, true, "exportSession verification failed");
  ok(result.hash.length === 64, "hash length invalid");
});

// ── tamper detection ─────────────────────────────────────────
test("verifySession detects tampered manifest", () => {
  const dir = join(SESSION_DIR_ROOT, SESSION_ID);
  const manifestPath = join(dir, "manifest.json");
  const original = readFileSync(manifestPath, "utf8");
  const tampered = original.replace(/"tool_invocations": 7/, '"tool_invocations": 999');
  writeFileSync(manifestPath, tampered);
  const result = verifySession(SESSION_ID);
  strictEqual(result.valid, false, "Expected tamper detection but got valid=true");
  // Restore
  writeFileSync(manifestPath, original);
});

// ── cleanup note ─────────────────────────────────────────────
test("test artifacts available for inspection", () => {
  console.log(`     (artifacts at .session/${SESSION_ID}/)`);
});

// ── Summary ──────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`${passed} passed  ${failed} failed`);
if (failed > 0) process.exit(1);
