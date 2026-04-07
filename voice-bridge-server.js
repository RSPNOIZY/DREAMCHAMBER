const express = require("express");
const { exec, execFile } = require("child_process");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const http = require("http");

// ── NOIZY Pipeline Config ──────────────────────────────────
const PIPELINE_DIR  = '/Users/m2ultra/NOIZYLAB/voice-pipeline';
const LOG_DIR       = '/Users/m2ultra/NOIZYLAB/logs/voice-pipeline';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
fs.mkdirSync(LOG_DIR, { recursive: true });
// ────────────────────────────────────────────────────────────

const app = express();
app.use(bodyParser.json());

// Security token
const AUTH_TOKEN =
  process.env.VOICE_AUTH_TOKEN || crypto.randomBytes(32).toString("hex");
if (!process.env.VOICE_AUTH_TOKEN) {
  console.warn(
    "[VoiceBridge] WARNING: VOICE_AUTH_TOKEN not set — using ephemeral token. Set it in .env for persistence.",
  );
}

// DreamChamber Gabriel endpoint
const DREAMCHAMBER_URL =
  process.env.DREAMCHAMBER_URL || "http://localhost:7777";

async function callGabriel(input, withVoice = true) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ input, voice: withVoice });
    const url = new URL("/api/gabriel/speak", DREAMCHAMBER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 7777,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid Gabriel response"));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => reject(new Error("Gabriel request timed out")));
    req.write(body);
    req.end();
  });
}

// Middleware for authentication
app.use((req, res, next) => {
  if (req.path === "/health") return next(); // Skip auth for health check

  const token = req.headers["authorization"];
  if (!token || token !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Voice command mapping
const VOICE_COMMANDS = {
  gabriel: {
    description:
      "Speak with GABRIEL — AI orchestration layer of the NOIZY Empire",
    needsText: true,
    handler: async (text) => {
      const result = await callGabriel(text, true);
      return result.gabriel || result.error || "Gabriel is unavailable";
    },
  },
  claude: {
    description: "Send text to Claude Max (voice pipeline)",
    needsText: true,
    handler: async (text) => callClaudeTower(text, 'max'),
  },
  "claude-max": {
    description: "Claude Max — strategy, legal, long-form",
    needsText: true,
    handler: async (text) => callClaudeTower(text, 'max'),
  },
  "claude-code": {
    description: "Claude Code — build requests, systems",
    needsText: true,
    handler: async (text) => callClaudeTower(text, 'code'),
  },
  "claude-coworker": {
    description: "Claude Coworker — crew tasks, routing",
    needsText: true,
    handler: async (text) => callClaudeTower(text, 'work'),
  },
  deploy: {
    description: "Deploy HEAVEN Cloudflare Worker",
    script: "bash /Users/m2ultra/NOIZYLAB/deploy.sh",
    notification: "HEAVEN deployment started",
  },
  dreamchamber: {
    description: "Start DreamChamber",
    script: "cd /Users/m2ultra/NOIZYLAB/dreamchamber && docker-compose up -d",
    notification: "DreamChamber starting",
  },
  compare: {
    description: "Compare across AI models",
    workflow: "/Users/m2ultra/NOIZYLAB/workflows/CompareAI.workflow",
    needsText: true,
  },
  status: {
    description: "Check system status",
    script: "docker ps && pm2 status",
    returnOutput: true,
  },
  cascade: {
    description: "Send to Cascade (you)",
    workflow: "/Users/m2ultra/NOIZYLAB/workflows/SendToCascade.workflow",
    needsText: true,
  },
};

// Conversation context storage
const conversationContext = new Map();

// Shared voice command handler (used by both /voice-command and /power-automate-webhook)
async function handleVoiceCommand(req, res) {
  const {
    command,
    text,
    userId = "default",
    source = "power-automate",
  } = req.body;

  console.log(`Voice command from ${source} (${userId}): ${command}`);

  // Store context
  const context = conversationContext.get(userId) || [];
  context.push({ command, text, timestamp: Date.now() });
  if (context.length > 10) context.shift();
  conversationContext.set(userId, context);

  // Execute command
  const cmd = VOICE_COMMANDS[command.toLowerCase()];
  if (!cmd) {
    return res.status(400).json({
      error: "Unknown command",
      availableCommands: Object.keys(VOICE_COMMANDS),
    });
  }

  try {
    let result;

    if (cmd.handler) {
      // Custom async handler (e.g. Gabriel)
      result = await cmd.handler(text);
    } else if (cmd.workflow) {
      // Execute Automator workflow
      const automatorCmd =
        cmd.needsText && text
          ? `/usr/bin/automator "${cmd.workflow}" -i "${text.replace(/"/g, '\\"')}"`
          : `/usr/bin/automator "${cmd.workflow}"`;

      result = await executeCommand(automatorCmd);
    } else if (cmd.script) {
      // Execute shell script
      result = await executeCommand(cmd.script);
    }

    // Send response
    res.json({
      status: "success",
      command,
      result: cmd.returnOutput
        ? result
        : result || cmd.notification || "Command executed",
      context: context.slice(-3), // Last 3 interactions
    });

    // Log to file
    logCommand(userId, command, text, result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      command,
      error: error.message,
    });
  }
}

// Main voice command endpoint
app.post("/voice-command", handleVoiceCommand);

// Batch command endpoint for complex workflows
app.post("/voice-workflow", async (req, res) => {
  const { workflow, parameters, userId = "default" } = req.body;

  const workflows = {
    "full-deploy": [
      { command: "dreamchamber", wait: 5000 },
      { command: "status" },
      { notify: "Deployment complete" },
    ],
    "morning-routine": [
      { command: "status" },
      { script: "cd /Users/m2ultra/NOIZYLAB && git pull" },
      { command: "dreamchamber" },
      { notify: "Morning setup complete" },
    ],
    "ai-analysis": [
      { command: "claude", text: parameters.text },
      { wait: 2000 },
      { command: "compare", text: parameters.text },
    ],
  };

  const steps = workflows[workflow];
  if (!steps) {
    return res.status(400).json({ error: "Unknown workflow" });
  }

  const results = [];
  for (const step of steps) {
    if (step.wait) {
      await new Promise((resolve) => setTimeout(resolve, step.wait));
    } else if (step.script) {
      const result = await executeCommand(step.script);
      results.push({ step: "script", result });
    } else if (step.command) {
      const cmd = VOICE_COMMANDS[step.command];
      if (cmd.workflow || cmd.script) {
        const result = await executeCommand(
          cmd.workflow
            ? `/usr/bin/automator "${cmd.workflow}" ${step.text ? `-i "${step.text}"` : ""}`
            : cmd.script,
        );
        results.push({ step: step.command, result });
      }
    } else if (step.notify) {
      results.push({ notification: step.notify });
    }
  }

  res.json({ workflow, results });
});

// Power Automate webhook endpoint — handles BOTH old format + new pipeline format
app.post("/power-automate-webhook", async (req, res) => {
  const body = req.body;

  // NEW: Pipeline response format (from teams-respond.sh)
  if (body.tower && body.response) {
    const { tower, response, prompt, source, ts } = body;
    console.log(`[Pipeline] Response from Claude ${tower} via ${source}`);
    logCommand('pipeline', `claude-${tower}`, prompt || '', response);
    return res.json({ status: 'received', tower, source, ts });
  }

  // NEW: Voice transcript direct format
  if (body.transcript || body.text) {
    const text = body.transcript || body.text;
    const tower = body.tower || detectTower(text);
    const result = await callClaudeTower(text, tower);
    return res.json({ status: 'success', tower, result });
  }

  // ORIGINAL: Power Automate value format
  const { value } = body;
  if (value && value.voice_command) {
    req.body = {
      command: value.voice_command,
      text: value.voice_text,
      userId: value.user_id || 'power-automate',
    };
    return handleVoiceCommand(req, res);
  }

  res.status(400).json({ error: 'Invalid format', accepted: ['tower+response', 'transcript', 'value.voice_command'] });
});

// Claude Direct API endpoint
app.post('/claude', async (req, res) => {
  const { text, prompt, tower = 'max', userId = 'direct' } = req.body;
  const input = text || prompt;
  if (!input) return res.status(400).json({ error: 'text or prompt required' });
  try {
    const result = await callClaudeTower(input, tower);
    logCommand(userId, `claude-${tower}`, input, result);
    res.json({ status: 'success', tower, result });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Claude Towers status
app.get('/claude-towers', (req, res) => {
  res.json({
    towers: [
      { id: 'max',  name: 'Claude Max',      model: 'claude-opus-4-5',   role: 'Strategy · Legal · Long-form' },
      { id: 'code', name: 'Claude Code',     model: 'claude-sonnet-4-5', role: 'Build · Systems · APIs' },
      { id: 'work', name: 'Claude Coworker', model: 'claude-sonnet-4-5', role: 'Crew · Tasks · Routing' },
    ],
    pipeline: PIPELINE_DIR,
    bridge: 'http://GOD.local:8080',
    apiKeyPresent: !!ANTHROPIC_KEY,
  });
});

// Status endpoint
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    availableCommands: Object.entries(VOICE_COMMANDS).map(([name, cmd]) => ({
      name,
      description: cmd.description,
      needsText: cmd.needsText || false,
    })),
    workflows: ["full-deploy", "morning-routine", "ai-analysis"],
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Helper functions
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) { console.error(`Command error: ${error}`); reject(error); }
      else resolve(stdout || stderr);
    });
  });
}

// ── Claude API Direct Call ─────────────────────────────────
async function callClaudeTower(text, tower = 'max') {
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set in environment');
  const models = { max: 'claude-opus-4-5', code: 'claude-sonnet-4-5', work: 'claude-sonnet-4-5' };
  const systems = {
    max:  'You are Claude Max, strategic lead of NOIZY.AI Dream Chamber. Robert Stephen Plowman of Ottawa, Ontario, Canada is your founder. NOIZY.AI builds a premium voice library fighting for fair compensation for AI and human voice actors. Be direct and strategic.',
    code: 'You are Claude Code for NOIZY.AI. Build requests come via voice pipeline from Robert on iPhone → M2 Ultra. Give code, commands, concrete steps. Be concise.',
    work: 'You are Claude Coworker for NOIZY.AI Dream Chamber. Coordinate crew, delegate tasks, keep things moving. Voice input from Robert via iPhone Teams.',
  };
  const body = JSON.stringify({
    model: models[tower] || models.max,
    max_tokens: 1024,
    system: systems[tower] || systems.max,
    messages: [{ role: 'user', content: text }]
  });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Claude API error ${res.status}`);
  return data.content?.[0]?.text || 'No response';
}

// ── Auto-detect tower from text content ───────────────────
function detectTower(text) {
  const t = text.toLowerCase();
  if (/build|code|deploy|script|api|worker|function|install|git/.test(t)) return 'code';
  if (/task|assign|route|crew|channel|delegate|schedule|team/.test(t)) return 'work';
  return 'max';
}

function logCommand(userId, command, text, result) {
  const logDir = "/Users/m2ultra/NOIZYLAB/logs/voice-commands";
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const log = {
    timestamp: new Date().toISOString(),
    userId,
    command,
    text,
    result: result ? result.substring(0, 200) : null,
  };

  const logFile = path.join(
    logDir,
    `${new Date().toISOString().split("T")[0]}.json`,
  );
  let logs = [];

  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, "utf8"));
  }

  logs.push(log);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// ══════════════════════════════════════════════════════════════════
// WEBHOOK LAYER — inbound events from GitHub, Stripe, n8n, Zapier
// All write to GABRIEL memcell + ledger + optionally speak alert
// ══════════════════════════════════════════════════════════════════

const GABRIEL_URL = process.env.DREAMCHAMBER_URL || 'http://localhost:7777';

async function pushToGabriel(key, value) {
  try {
    await fetch(`${GABRIEL_URL}/memcell/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch (_) {}
}

// POST /webhook/github — GitHub push/PR/release events
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'] || 'unknown';
  const delivery = req.headers['x-github-delivery'] || 'unknown';
  const payload = req.body;

  const summary = {
    push: () => `${payload.pusher?.name} pushed ${payload.commits?.length || 0} commit(s) to ${payload.ref?.replace('refs/heads/','')}`,
    pull_request: () => `PR #${payload.number} ${payload.action}: ${payload.pull_request?.title}`,
    release: () => `Release ${payload.action}: ${payload.release?.tag_name}`,
    workflow_run: () => `Workflow "${payload.workflow_run?.name}" ${payload.action}`,
    issues: () => `Issue #${payload.issue?.number} ${payload.action}: ${payload.issue?.title}`,
  }[event]?.() || `GitHub event: ${event}`;

  console.log(`[GitHub Webhook] ${event} | ${summary}`);

  await pushToGabriel(`webhook:github:${delivery}`, {
    event, summary, repo: payload.repository?.full_name,
    ts: new Date().toISOString()
  });

  logCommand('github-webhook', event, summary, 'received');
  res.json({ received: true, event, summary });
});

// POST /webhook/stripe — Stripe payment/subscription events
app.post('/webhook/stripe', async (req, res) => {
  const eventType = req.body.type || 'unknown';
  const data = req.body.data?.object || {};

  const summaries = {
    'payment_intent.succeeded': `Payment received: $${((data.amount || 0) / 100).toFixed(2)}`,
    'invoice.paid':             `Invoice paid: $${((data.amount_paid || 0) / 100).toFixed(2)}`,
    'customer.subscription.created': `New subscription: ${data.plan?.nickname || data.id}`,
    'customer.subscription.deleted': `Subscription cancelled: ${data.id}`,
    'checkout.session.completed':    `Checkout complete: $${((data.amount_total || 0) / 100).toFixed(2)}`,
  };
  const summary = summaries[eventType] || `Stripe event: ${eventType}`;

  console.log(`[Stripe Webhook] ${eventType} | ${summary}`);
  await pushToGabriel(`webhook:stripe:${req.body.id || 'evt'}`, {
    event: eventType, summary, livemode: req.body.livemode,
    ts: new Date().toISOString()
  });

  res.json({ received: true, event: eventType, summary });
});

// POST /webhook/n8n — n8n workflow events → GOD
app.post('/webhook/n8n', async (req, res) => {
  const { workflow, event, data, session_id } = req.body;
  const summary = `n8n: ${workflow || 'unknown'} → ${event || 'trigger'}`;

  console.log(`[n8n Webhook] ${summary}`);
  await pushToGabriel(`webhook:n8n:${session_id || Date.now()}`, {
    workflow, event, data, summary, ts: new Date().toISOString()
  });

  // Route to GABRIEL command if it's a voice/command event
  if (event === 'voice.command' && data?.text) {
    const tower = detectTower(data.text);
    try {
      const result = await callClaudeTower(data.text, tower);
      return res.json({ received: true, summary, response: result, tower });
    } catch (e) {
      return res.json({ received: true, summary, error: e.message });
    }
  }

  res.json({ received: true, summary, workflow, event });
});

// POST /webhook/zapier — Zapier zap events
app.post('/webhook/zapier', async (req, res) => {
  const { zap_name, event, data } = req.body;
  const summary = `Zapier: ${zap_name || 'unknown'} → ${event || 'trigger'}`;

  console.log(`[Zapier Webhook] ${summary}`);
  await pushToGabriel(`webhook:zapier:${Date.now()}`, {
    zap_name, event, data, summary, ts: new Date().toISOString()
  });

  res.json({ received: true, summary });
});

// POST /webhook/heaven — Heaven worker → GOD local bridge
// Receives events dispatched from the edge (consent, ledger, voice)
app.post('/webhook/heaven', async (req, res) => {
  const { source, event: eventType, summary, ...rest } = req.body;
  const key = `webhook:heaven:${source}:${Date.now()}`;

  console.log(`[Heaven Webhook] ${source}/${eventType}: ${summary}`);
  await pushToGabriel(key, { source, event: eventType, summary, ...rest, ts: new Date().toISOString() });

  // Speak critical consent events
  if (source === 'consent' && (eventType === 'consent.revoke' || eventType === 'never_clause.triggered')) {
    try {
      execFile('/usr/bin/say', ['-v', 'Daniel', `Consent alert: ${summary}`]);
    } catch (_) {}
  }

  res.json({ received: true, source, event: eventType });
});

// GET /webhooks — webhook status endpoint
app.get('/webhooks', (req, res) => {
  res.json({
    status: 'operational',
    endpoints: [
      'POST /webhook/github',
      'POST /webhook/stripe',
      'POST /webhook/n8n',
      'POST /webhook/zapier',
      'POST /webhook/heaven',
      'POST /power-automate-webhook',
      'POST /voice-command',
    ],
    gabriel: GABRIEL_URL,
    ts: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Voice Bridge Server running on http://GOD.local:${PORT}`);
  console.log(
    `Auth Token: ${AUTH_TOKEN.substring(0, 8)}... (set VOICE_AUTH_TOKEN env var to pin this)`,
  );
  console.log("Ready to receive voice commands from Power Automate");
});
