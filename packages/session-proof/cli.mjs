#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// session-proof CLI
//
// Usage:
//   session-proof init   <session-id> [--model <m>] [--mode local|remote]
//   session-proof note   <session-id> <"note text">
//   session-proof marker <session-id> <"label">
//   session-proof seal   <session-id> [--invocations <n>]
//   session-proof verify <session-id>
//   session-proof export <session-id> [--invocations <n>]
//   session-proof new                  -- generate a session ID and init
// ═══════════════════════════════════════════════════════════════

import {
  initSession,
  appendNote,
  appendMarker,
  sealSession,
  verifySession,
  exportSession,
} from "./index.mjs";
import { randomUUID } from "node:crypto";

const [, , command, ...args] = process.argv;

function flag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

function ok(msg) {
  console.log(`✓  ${msg}`);
}
function err(msg) {
  console.error(`✗  ${msg}`);
  process.exit(1);
}

switch (command) {
  case "new": {
    const sessionId = `session-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
    const model = flag("model") || "unknown";
    const mode = flag("mode") || "local";
    const result = initSession(sessionId, { model, mode });
    ok(`New session initialized`);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case "init": {
    const sessionId = args[0];
    if (!sessionId) err("Usage: session-proof init <session-id>");
    const model = flag("model") || "unknown";
    const mode = flag("mode") || "local";
    const mcpServers = flag("mcp") ? flag("mcp").split(",") : [];
    const result = initSession(sessionId, { model, mode, mcpServers });
    ok(`Session initialized: ${sessionId}`);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case "note": {
    const [sessionId, ...rest] = args;
    const content = rest.filter((a) => !a.startsWith("--")).join(" ");
    if (!sessionId || !content) err("Usage: session-proof note <session-id> <text>");
    appendNote(sessionId, content);
    ok(`Note appended to ${sessionId}`);
    break;
  }

  case "marker": {
    const [sessionId, ...rest] = args;
    const label = rest.filter((a) => !a.startsWith("--")).join(" ");
    if (!sessionId || !label) err("Usage: session-proof marker <session-id> <label>");
    appendMarker(sessionId, label);
    ok(`Marker appended to ${sessionId}`);
    break;
  }

  case "seal": {
    const sessionId = args[0];
    if (!sessionId) err("Usage: session-proof seal <session-id>");
    const toolInvocations = parseInt(flag("invocations") || "0", 10);
    const result = sealSession(sessionId, { toolInvocations });
    ok(`Session sealed: ${sessionId}`);
    ok(`SHA-256: ${result.hash}`);
    console.log(`  manifest: ${result.manifestPath}`);
    console.log(`  seal:     ${result.sealPath}`);
    break;
  }

  case "verify": {
    const sessionId = args[0];
    if (!sessionId) err("Usage: session-proof verify <session-id>");
    const result = verifySession(sessionId);
    if (result.valid) {
      ok(`Seal verified: ${sessionId}`);
      ok(`SHA-256 match: ${result.actual}`);
    } else {
      console.error(`✗  TAMPER DETECTED: ${sessionId}`);
      console.error(`   expected: ${result.expected}`);
      console.error(`   actual:   ${result.actual}`);
      process.exit(2);
    }
    break;
  }

  case "export": {
    const sessionId = args[0];
    if (!sessionId) err("Usage: session-proof export <session-id>");
    const toolInvocations = parseInt(flag("invocations") || "0", 10);
    const result = exportSession(sessionId, { toolInvocations });
    if (result.valid) {
      ok(`Session exported and sealed: ${sessionId}`);
      ok(`SHA-256: ${result.hash}`);
      console.log(JSON.stringify(result.manifest, null, 2));
    } else {
      err(`Export completed but seal verification failed for ${sessionId}`);
    }
    break;
  }

  default:
    console.log(`
session-proof — NOIZY tamper-evident session export

Commands:
  new                               Generate session ID + initialize
  init   <id> [--model m] [--mode local|remote] [--mcp server1,server2]
  note   <id> <"text">             Append a note
  marker <id> <"label">            Append a temporal marker
  seal   <id> [--invocations n]    Write manifest.json + seal.sha256
  verify <id>                      Verify seal integrity
  export <id> [--invocations n]    Seal + verify in one step

Environment:
  NOIZY_SESSION_ROOT  Override .session/ directory (default: cwd/.session/)

Integrity model:
  seal.sha256 = SHA-256(canonicalize(manifest.json))
  Tamper-evident provenance. Not a legal certification.
`);
}
