/**
 * NOIZY Central Gateway — Port 9696
 * Aggregates agent health. Routes dispatch requests to the mesh.
 * Heaven Worker forwards here via CF Access Service Token headers.
 */

const http = require("node:http");
const os = require("node:os");
const { execSync } = require("node:child_process");
const { dashboardHTML } = require("./dashboard.js");

const PORT = parseInt(process.env.PORT || "9696", 10);

// Agent registry — populated from env vars
const AGENTS = {};
for (const [key, val] of Object.entries(process.env)) {
  const m = key.match(/^AGENT_(\w+)_URL$/);
  if (m) AGENTS[m[1].toLowerCase()] = val;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function fetchJson(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const r = await fetch(url, { ...opts, signal: controller.signal });
    const body = await r.json();
    return { ok: r.ok, status: r.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: { error: err.message } };
  } finally {
    clearTimeout(timeout);
  }
}

// ── System telemetry ────────────────────────────────────────────────────────

function getSystemInfo() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  // Disk free (macOS df)
  let diskFreeGB = 0;
  try {
    const df = execSync("df -g / 2>/dev/null | tail -1", { encoding: "utf8" });
    diskFreeGB = parseInt(df.trim().split(/\s+/)[3]) || 0;
  } catch {}

  // Logic Pro running?
  let logicRunning = false;
  try {
    execSync("pgrep -f 'Logic Pro'", { encoding: "utf8" });
    logicRunning = true;
  } catch {}

  return {
    cpu_count: cpus.length,
    cpu_model: cpus[0]?.model || "unknown",
    memory_total_gb: Math.round(totalMem / 1073741824),
    memory_free_gb: Math.round(freeMem / 1073741824),
    memory_used_pct: Math.round(((totalMem - freeMem) / totalMem) * 100),
    disk_free_gb: diskFreeGB,
    logic_pro: logicRunning,
    uptime_hours: Math.round(os.uptime() / 3600),
    hostname: os.hostname(),
  };
}

// ── Health — aggregate all agents + system ──────────────────────────────────

async function handleHealth(res) {
  const checks = await Promise.all(
    Object.entries(AGENTS).map(async ([name, url]) => {
      const result = await fetchJson(`${url}/health`);
      return {
        agent: name,
        url,
        status: result.ok ? "healthy" : "unhealthy",
        detail: result.body,
      };
    })
  );

  const allHealthy = checks.every((c) => c.status === "healthy");
  json(res, {
    status: allHealthy ? "healthy" : "degraded",
    service: "central-gateway",
    timestamp: new Date().toISOString(),
    system: getSystemInfo(),
    agents: checks,
  });
}

// ── Dispatch — route to target agent ─────────────────────────────────────────

async function handleDispatch(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json(res, { error: "Invalid JSON" }, 400);
  }

  const { actor, device, intent, target, context } = payload;
  if (!actor || !target) {
    return json(res, { error: "actor and target required" }, 400);
  }

  const agentUrl = AGENTS[target.toLowerCase()];
  if (!agentUrl) {
    return json(
      res,
      {
        error: `Unknown agent: ${target}`,
        available: Object.keys(AGENTS),
      },
      404
    );
  }

  const result = await fetchJson(`${agentUrl}/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor, device, intent, context }),
  });

  json(res, {
    ok: result.ok,
    source: "central-gateway",
    target,
    agent_response: result.body,
    timestamp: new Date().toISOString(),
  });
}

// ── Individual agent health ──────────────────────────────────────────────────

async function handleAgentHealth(res, agentName) {
  const agentUrl = AGENTS[agentName.toLowerCase()];
  if (!agentUrl) {
    return json(res, { error: `Unknown agent: ${agentName}` }, 404);
  }
  const result = await fetchJson(`${agentUrl}/health`);
  json(res, {
    agent: agentName,
    status: result.ok ? "healthy" : "unhealthy",
    detail: result.body,
  });
}

// ── Router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  try {
    if (path === "/dashboard" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return res.end(dashboardHTML);
    }

    if (path === "/health" && req.method === "GET") {
      return await handleHealth(res);
    }

    if (path === "/dispatch" && req.method === "POST") {
      return await handleDispatch(req, res);
    }

    // /agent/:name/health
    const agentMatch = path.match(/^\/agent\/(\w+)\/health$/);
    if (agentMatch && req.method === "GET") {
      return await handleAgentHealth(res, agentMatch[1]);
    }

    json(res, { error: "Not found" }, 404);
  } catch (err) {
    json(res, { error: "Internal error", detail: err.message }, 500);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[central-gateway] listening on :${PORT}`);
  console.log(
    `[central-gateway] agents: ${Object.keys(AGENTS).join(", ") || "none"}`
  );
});
