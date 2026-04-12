/**
 * NOIZY Agent Container — Generic template
 * Each agent runs this with different AGENT_NAME / AGENT_ROLE env vars.
 * Exposes /health and /dispatch.
 */

const http = require("node:http");

const PORT = parseInt(process.env.PORT || "7001", 10);
const AGENT_NAME = process.env.AGENT_NAME || "unknown";
const AGENT_ROLE = process.env.AGENT_ROLE || "generic";

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/health" && req.method === "GET") {
    return json(res, {
      status: "healthy",
      agent: AGENT_NAME,
      role: AGENT_ROLE,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  if (url.pathname === "/dispatch" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return json(res, { error: "Invalid JSON" }, 400);
    }

    // Route intent to handler — extend per agent
    const result = await handleIntent(payload);
    return json(res, result);
  }

  json(res, { error: "Not found" }, 404);
});

async function handleIntent({ actor, device, intent, context }) {
  // Default handler — override per agent specialization
  switch (intent) {
    case "status":
      return {
        ok: true,
        agent: AGENT_NAME,
        role: AGENT_ROLE,
        message: `${AGENT_NAME} operational`,
        actor,
        device,
        context,
        timestamp: new Date().toISOString(),
      };

    case "ping":
      return {
        ok: true,
        agent: AGENT_NAME,
        pong: true,
        timestamp: new Date().toISOString(),
      };

    default:
      return {
        ok: true,
        agent: AGENT_NAME,
        intent,
        message: `${AGENT_NAME} received intent: ${intent}`,
        actor,
        timestamp: new Date().toISOString(),
      };
  }
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[agent-${AGENT_NAME}] listening on :${PORT} (${AGENT_ROLE})`);
});
