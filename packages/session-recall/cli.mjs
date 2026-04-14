#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// session-recall CLI
//
// POST-SESSION ONLY. OPERATOR-INVOKED. READ-ONLY.
//
// Usage:
//   session-recall index   <session-id>      -- index one sealed session
//   session-recall index   --all             -- index all sealed sessions
//   session-recall search  <query>           -- search indexed sessions
//   session-recall get     <session-id>      -- get one entry
//   session-recall stats                     -- index summary
//
// Options for search:
//   --model <name>    filter by model
//   --mode  local|remote
//   --limit <n>       max results (default 20)
// ═══════════════════════════════════════════════════════════════

import {
  indexSession, indexAllSessions, searchRecall,
  recallStats, getSessionEntry,
} from "./index.mjs";

const [,, command, ...args] = process.argv;

function flag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}
function hasFlag(name) { return args.includes(`--${name}`); }

function ok(msg) { console.log(`✓  ${msg}`); }
function err(msg) { console.error(`✗  ${msg}`); process.exit(1); }

console.error("⚠  session-recall: POST-SESSION ONLY. Read-only. Never inject into live sessions.\n");

switch (command) {
  case "index": {
    if (hasFlag("all")) {
      console.log("Indexing all sealed sessions...");
      const { indexed, skipped } = indexAllSessions();
      ok(`Indexed: ${indexed.length} session(s)`);
      if (indexed.length) console.log(`   ${indexed.join("\n   ")}`);
      if (skipped.length) {
        console.log(`\nSkipped: ${skipped.length}`);
        console.log(`   ${skipped.join("\n   ")}`);
      }
    } else {
      const sessionId = args.filter(a => !a.startsWith("--"))[0];
      if (!sessionId) err("Usage: session-recall index <session-id>  OR  session-recall index --all");
      const entry = indexSession(sessionId);
      ok(`Indexed: ${sessionId}`);
      ok(`Seal valid: ${entry.seal_valid}`);
      console.log(`   notes:   ${entry.notes.length}`);
      console.log(`   markers: ${entry.markers.length}`);
    }
    break;
  }

  case "search": {
    const query = args.filter(a => !a.startsWith("--"))[0];
    if (!query) err("Usage: session-recall search <query> [--model m] [--mode local|remote] [--limit n]");
    const model = flag("model");
    const mode = flag("mode");
    const limit = parseInt(flag("limit") || "20", 10);
    const results = searchRecall(query, { model, mode, limit });
    if (!results.length) {
      console.log("No sessions match that query.");
    } else {
      console.log(`\nFound ${results.length} session(s) matching "${query}":\n`);
      for (const r of results) {
        console.log(`── ${r.session_id}`);
        console.log(`   ended:   ${r.ended_at}`);
        console.log(`   model:   ${r.model}`);
        console.log(`   mode:    ${r.operator_mode}`);
        console.log(`   tools:   ${r.tool_invocations}`);
        console.log(`   seal:    ${r.seal_valid ? "✓ valid" : "⚠ INVALID"}`);
        const matchingNotes = r.notes.filter(n => n.toLowerCase().includes(query.toLowerCase()));
        if (matchingNotes.length) {
          console.log(`   notes matching query:`);
          matchingNotes.slice(0, 3).forEach(n => console.log(`     • ${n.slice(0, 120)}`));
        }
        const matchingMarkers = r.markers.filter(m => m.toLowerCase().includes(query.toLowerCase()));
        if (matchingMarkers.length) {
          console.log(`   markers: ${matchingMarkers.join(", ")}`);
        }
        console.log("");
      }
    }
    break;
  }

  case "get": {
    const sessionId = args.filter(a => !a.startsWith("--"))[0];
    if (!sessionId) err("Usage: session-recall get <session-id>");
    const entry = getSessionEntry(sessionId);
    if (!entry) {
      err(`Session not in index: ${sessionId}. Run: session-recall index ${sessionId}`);
    }
    console.log(JSON.stringify(entry, null, 2));
    break;
  }

  case "stats": {
    const stats = recallStats();
    if (!stats.total) {
      console.log("Recall index is empty. Run: session-recall index --all");
    } else {
      console.log("\nRecall Index Stats");
      console.log("─".repeat(40));
      console.log(`Total sessions:    ${stats.total}`);
      console.log(`Models:            ${stats.models.join(", ")}`);
      console.log(`Date range:        ${stats.date_range.earliest} → ${stats.date_range.latest}`);
      console.log(`Invalid seals:     ${stats.invalid_seals}${stats.invalid_seals > 0 ? " ⚠" : ""}`);
    }
    break;
  }

  default:
    console.log(`
session-recall — NOIZY cross-session recall (post-session, read-only)

Commands:
  index  <session-id>          Index one sealed session
  index  --all                 Index all sealed sessions
  search <query>               Search indexed sessions
  get    <session-id>          Get one recall entry
  stats                        Index summary

Search options:
  --model <name>               Filter by model name
  --mode  local|remote         Filter by operator mode
  --limit <n>                  Max results (default: 20)

Environment:
  NOIZY_SESSION_ROOT           Override .session/ directory

OPERATOR RULES:
  • Post-session only — never run during live creative sessions
  • Read-only — never mutates session artifacts
  • Operator-invoked — never runs automatically
  • Plan-agent first — surface recall through deliberate Plan workflows only
  • No live silent retrieval
`);
}
