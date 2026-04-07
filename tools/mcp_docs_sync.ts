/**
 * MCP SERVER: noizy-docs-sync
 * GABRIEL calls this to vacuum and organize all docs across NOIZY Empire
 *
 * Tools exposed:
 * - sync_all_docs(execute: bool, empire_root: str)
 * - search_docs(query: str, project?: str)
 * - get_catalog_stats()
 *
 * Usage from GABRIEL:
 *   > GABRIEL, sync all docs
 *   > GABRIEL, search "NOIZYVOX portal" in docs
 */

import { Tool, Server } from "@anthropic-ai/sdk/resources/messages/tools";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const HOME = os.homedir();
const ARCHIVIST_PATH = path.join(HOME, "NOIZYLAB/tools/archivist.py");
const CATALOG_PATH = path.join(HOME, "NOIZY_EMPIRE/.archivist_catalog.json");

// ─────────────────────────────────────────────────────────────────
// TOOL DEFINITIONS
// ─────────────────────────────────────────────────────────────────

const tools: Tool[] = [
  {
    name: "sync_all_docs",
    description: "Run the Archivist vacuum to pull all docs from Drive, local storage, and GitHub. Classifies and optionally routes to empire_root.",
    input_schema: {
      type: "object",
      properties: {
        execute: {
          type: "boolean",
          description: "If true, actually move files. If false, catalog only (safe dry-run).",
          default: false,
        },
        empire_root: {
          type: "string",
          description: "Root folder where sorted docs go. Defaults to ~/NOIZY_EMPIRE",
          default: path.join(HOME, "NOIZY_EMPIRE"),
        },
        force_refresh: {
          type: "boolean",
          description: "If true, re-scan everything. If false, use cached catalog.",
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: "search_docs",
    description: "Search through the doc catalog by keyword or project.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term or keyword",
        },
        project: {
          type: "string",
          description: "Optional: filter results to a specific project (e.g., 'NOIZYVOX', 'GABRIEL')",
        },
        limit: {
          type: "number",
          description: "Max results to return. Default: 20",
          default: 20,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_catalog_stats",
    description: "Get summary stats from the latest doc catalog (count by project, duplicates, unclassified, etc.)",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// ─────────────────────────────────────────────────────────────────
// IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────

async function sync_all_docs(
  execute: boolean = false,
  empire_root: string = path.join(HOME, "NOIZY_EMPIRE"),
  force_refresh: boolean = false
): Promise<object> {
  return new Promise((resolve, reject) => {
    const args = [
      ARCHIVIST_PATH,
      "--output",
      CATALOG_PATH,
      "--empire-root",
      empire_root,
    ];

    if (execute) args.push("--execute");
    if (force_refresh) args.push("--force-refresh");

    const proc = spawn("python3", args, { cwd: HOME });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      process.stdout.write(data); // echo to console
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({
          success: true,
          executed: execute,
          catalog_path: CATALOG_PATH,
          empire_root,
          output: stdout,
        });
      } else {
        reject({
          success: false,
          error: stderr || stdout,
          code,
        });
      }
    });
  });
}

async function search_docs(
  query: string,
  project?: string,
  limit: number = 20
): Promise<object> {
  if (!fs.existsSync(CATALOG_PATH)) {
    return {
      error: "Catalog not found. Run sync_all_docs first.",
      catalog_path: CATALOG_PATH,
    };
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
  const files: any[] = catalog.files || [];

  let results = files.filter((f) => {
    const query_lower = query.toLowerCase();
    const file_match =
      f.filename.toLowerCase().includes(query_lower) ||
      f.source.toLowerCase().includes(query_lower) ||
      (f.reasons && f.reasons.join(" ").toLowerCase().includes(query_lower));

    if (!project) return file_match;
    return file_match && f.project === project;
  });

  results = results.slice(0, limit);

  return {
    query,
    project_filter: project || "all",
    found: results.length,
    results: results.map((r) => ({
      filename: r.filename,
      project: r.project,
      source: r.source,
      dest: r.dest,
      confidence: r.confidence,
      reasons: r.reasons,
    })),
  };
}

async function get_catalog_stats(): Promise<object> {
  if (!fs.existsSync(CATALOG_PATH)) {
    return {
      error: "Catalog not found. Run sync_all_docs first.",
    };
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));

  return {
    generated_at: catalog.generated_at,
    empire_root: catalog.empire_root,
    stats: catalog.stats,
    project_counts: catalog.project_counts,
    total_files: catalog.files?.length || 0,
  };
}

// ─────────────────────────────────────────────────────────────────
// MCP SERVER INIT
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("[noizy-docs-sync MCP] Starting...");
  console.log(`Archivist: ${ARCHIVIST_PATH}`);
  console.log(`Catalog: ${CATALOG_PATH}`);

  // In a real MCP setup, this would initialize the protocol handler.
  // For now, this is just a demo that shows the tools are ready.

  console.log(`[noizy-docs-sync MCP] Ready. Tools registered:`);
  tools.forEach((t) => console.log(`  - ${t.name}`));

  // Example: show stats if catalog exists
  const stats = await get_catalog_stats().catch(() => null);
  if (stats && !stats.error) {
    console.log(`\n[noizy-docs-sync MCP] Current catalog stats:`);
    console.log(`  Total files: ${stats.total_files}`);
    console.log(`  Projects:`, stats.project_counts);
  }
}

main().catch(console.error);

export { sync_all_docs, search_docs, get_catalog_stats, tools };
