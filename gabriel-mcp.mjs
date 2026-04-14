#!/usr/bin/env node
/**
 * gabriel-mcp.mjs
 * GABRIEL — Session-aware durable memory MCP server for NOIZY/OpenCode.
 *
 * Exposes:
 *   Tools:     gabriel_note, gabriel_marker, gabriel_export
 *   Resources: notes://<session_id>  (browsable by OpenCode)
 *
 * Deploy path: /Users/m2ultra/NOIZYLAB/gabriel-mcp.mjs
 * Config:      GABRIEL_ROOT env var (default: ~/NOIZYLAB/gabriel)
 *
 * Install deps once:
 *   npm install @modelcontextprotocol/sdk zod
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

// ─── Storage root ─────────────────────────────────────────────────────────────
const ROOT =
  process.env.GABRIEL_ROOT ?? path.join(process.env.HOME ?? "/tmp", "NOIZYLAB", "gabriel");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sessionDir(session_id) {
  const d = path.join(ROOT, session_id);
  ensureDir(d);
  return d;
}

function appendNDJSON(file, record) {
  fs.appendFileSync(file, JSON.stringify({ ...record, t: Date.now() }) + "\n");
}

function readNDJSON(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ─── MCP Server ───────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "gabriel",
  version: "1.0.0",
  description: "GABRIEL — NOIZY session memory: notes, markers, and session export.",
});

// ── Tool: gabriel_note ────────────────────────────────────────────────────────
// Append a freeform note to this session's log.
server.tool(
  "gabriel_note",
  "Append a freeform note to the GABRIEL session log.",
  {
    session_id: z.string().min(6).describe("OpenCode session ID (min 6 chars)."),
    text: z.string().min(1).describe("Note text to persist."),
    tags: z.array(z.string()).optional().describe("Optional topic tags."),
  },
  async ({ session_id, text, tags }) => {
    const dir = sessionDir(session_id);
    appendNDJSON(path.join(dir, "notes.ndjson"), { text, tags: tags ?? [] });
    return {
      content: [
        {
          type: "text",
          text: `✅ GABRIEL logged note for session ${session_id}${
            tags?.length ? ` [${tags.join(", ")}]` : ""
          }`,
        },
      ],
    };
  },
);

// ── Tool: gabriel_marker ──────────────────────────────────────────────────────
// Drop a named marker — Cmd+T analogue for session replay.
server.tool(
  "gabriel_marker",
  "Drop a named session marker (Cmd+T analogue) in the GABRIEL log.",
  {
    session_id: z.string().min(6).describe("OpenCode session ID."),
    label: z.string().min(1).max(96).describe("Short marker label (≤96 chars)."),
    timecode: z
      .string()
      .optional()
      .describe("Optional timecode string (e.g. '00:04:22' or ISO timestamp)."),
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Any extra key/value metadata to attach."),
  },
  async ({ session_id, label, timecode, metadata }) => {
    const dir = sessionDir(session_id);
    appendNDJSON(path.join(dir, "markers.ndjson"), {
      label,
      timecode: timecode ?? null,
      metadata: metadata ?? {},
    });
    return {
      content: [
        {
          type: "text",
          text: `🎙️ Marker "${label}" saved for session ${session_id}${
            timecode ? ` @ ${timecode}` : ""
          }`,
        },
      ],
    };
  },
);

// ── Tool: gabriel_export ──────────────────────────────────────────────────────
// Dump the full session ledger as structured JSON (notes + markers).
server.tool(
  "gabriel_export",
  "Export the full GABRIEL session ledger (notes + markers) as structured JSON.",
  {
    session_id: z.string().min(6).describe("OpenCode session ID to export."),
  },
  async ({ session_id }) => {
    const dir = path.join(ROOT, session_id);
    if (!fs.existsSync(dir)) {
      return {
        content: [
          {
            type: "text",
            text: `⚠️ No GABRIEL data found for session ${session_id}.`,
          },
        ],
      };
    }
    const notes = readNDJSON(path.join(dir, "notes.ndjson"));
    const markers = readNDJSON(path.join(dir, "markers.ndjson"));
    const payload = {
      session_id,
      exported_at: new Date().toISOString(),
      note_count: notes.length,
      marker_count: markers.length,
      notes,
      markers,
    };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
);

// ── Resources: session notes ──────────────────────────────────────────────────
// Expose session notes as browsable MCP resources so OpenCode can surface
// them as additional context. URI scheme: notes://<session_id>
//
// List resource: enumerate all known sessions.
server.resource(
  "gabriel-sessions",
  new ResourceTemplate("notes://{session_id}", { list: undefined }),
  async (uri, { session_id }) => {
    const dir = path.join(ROOT, session_id);
    if (!fs.existsSync(dir)) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/plain",
            text: `No GABRIEL data for session ${session_id}.`,
          },
        ],
      };
    }
    const notes = readNDJSON(path.join(dir, "notes.ndjson"));
    const markers = readNDJSON(path.join(dir, "markers.ndjson"));
    const text = [
      `# GABRIEL Session: ${session_id}`,
      `Notes: ${notes.length}  |  Markers: ${markers.length}`,
      "",
      "## Notes",
      ...notes.map(
        (n, i) =>
          `[${i + 1}] ${new Date(n.t).toISOString()}${
            n.tags?.length ? ` [${n.tags.join(", ")}]` : ""
          }\n    ${n.text}`,
      ),
      "",
      "## Markers",
      ...markers.map(
        (m, i) =>
          `[${i + 1}] ${new Date(m.t).toISOString()} — ${m.label}${
            m.timecode ? ` @ ${m.timecode}` : ""
          }`,
      ),
    ].join("\n");

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text,
        },
      ],
    };
  },
);

// ─── Connect and start ────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
