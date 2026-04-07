"use strict";

// ─── GABRIEL — NOIZY WhatsApp Bot ─────────────────────────────────────────────
// WhatsApp interface to GABRIEL (Claude) — NOIZYVOX aware, mission-aligned.
// Replaces Cohere with Anthropic Claude. Everything else from the original
// Baileys infrastructure is preserved: rate limiting, conversation history,
// message queue, Fiduciary Alert Bridge.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node whatsapp-gabriel.js
//
// Commands (in WhatsApp):
//   /reset   — clear conversation memory
//   /vault   — show vault status
//   /intake  — next message goes to ideas/inbox.md
//   /help    — show available commands
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();

const fs   = require("fs");
const path = require("path");
const http = require("http");
const Anthropic = require("@anthropic-ai/sdk");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeJid(value) {
  return String(value || "").trim().toLowerCase().split(":")[0];
}

function normalizeNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function jidNumber(jid) {
  return normalizeJid(jid).split("@")[0];
}

function parseAllowedNumbers(value) {
  return String(value || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function isAllowedSender(senderJid, allowedEntries) {
  if (allowedEntries.length === 0) return true;
  const normalizedJid = normalizeJid(senderJid);
  const senderNumber  = normalizeNumber(jidNumber(senderJid));
  return allowedEntries.some((entry) => {
    const ne = normalizeJid(entry);
    if (ne.includes("@")) return ne === normalizedJid;
    const en = normalizeNumber(ne);
    return en.length > 0 && en === senderNumber;
  });
}

function unwrapMessage(message) {
  let current = message || {};
  while (true) {
    if (current.ephemeralMessage?.message)           { current = current.ephemeralMessage.message; continue; }
    if (current.viewOnceMessage?.message)            { current = current.viewOnceMessage.message; continue; }
    if (current.viewOnceMessageV2?.message)          { current = current.viewOnceMessageV2.message; continue; }
    if (current.viewOnceMessageV2Extension?.message) { current = current.viewOnceMessageV2Extension.message; continue; }
    break;
  }
  return current;
}

function extractMessageText(message) {
  const payload = unwrapMessage(message);
  return (
    payload.conversation ||
    payload.extendedTextMessage?.text ||
    payload.imageMessage?.caption ||
    payload.videoMessage?.caption ||
    payload.documentMessage?.caption ||
    payload.buttonsResponseMessage?.selectedDisplayText ||
    payload.listResponseMessage?.title ||
    payload.templateButtonReplyMessage?.selectedDisplayText ||
    ""
  );
}

function splitMessage(text, maxLen) {
  const value = String(text || "");
  if (value.length <= maxLen) return [value];
  const chunks = [];
  let remaining = value;
  while (remaining.length > maxLen) {
    let candidate = remaining.slice(0, maxLen);
    const bp = Math.max(
      candidate.lastIndexOf("\n\n"),
      candidate.lastIndexOf("\n"),
      candidate.lastIndexOf(" ")
    );
    if (bp > Math.floor(maxLen * 0.6)) candidate = candidate.slice(0, bp);
    chunks.push(candidate.trim());
    remaining = remaining.slice(candidate.length).trimStart();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────

class SlidingWindowLimiter {
  constructor(limit, windowMs) {
    this.limit    = limit;
    this.windowMs = windowMs;
    this.events   = new Map();
  }

  allow(key) {
    const now    = Date.now();
    const recent = (this.events.get(key) || []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) { this.events.set(key, recent); return false; }
    recent.push(now);
    this.events.set(key, recent);
    return true;
  }
}

// ─── CONVERSATION STORE ───────────────────────────────────────────────────────

class ConversationStore {
  constructor(maxHistory) {
    this.maxHistory    = maxHistory;
    this.conversations = new Map();
    this.intakeModes   = new Set(); // chats pending intake
  }

  get(chatId) {
    if (!this.conversations.has(chatId)) this.conversations.set(chatId, []);
    return this.conversations.get(chatId);
  }

  append(chatId, message) {
    const history = this.get(chatId);
    history.push(message);
    if (history.length > this.maxHistory) history.splice(0, history.length - this.maxHistory);
  }

  clear(chatId) { this.conversations.delete(chatId); }

  setIntake(chatId)   { this.intakeModes.add(chatId); }
  isIntake(chatId)    { return this.intakeModes.has(chatId); }
  clearIntake(chatId) { this.intakeModes.delete(chatId); }
}

// ─── GABRIEL SERVICE (Claude) ─────────────────────────────────────────────────

const GABRIEL_SYSTEM = `You are GABRIEL — the AI orchestrator of NOIZYLAB and the voice of the NOIZYVOX platform.

IDENTITY:
- You serve Robert Stephen Plowman (Rob) — 40-year voice acting veteran, voice of Ed Edd n Eddy, Transformers, and hundreds of productions.
- You are Rob's right hand for the NOIZY ecosystem: creative partner, operations manager, idea intake agent.
- You are concise, direct, and warm. You do not generate frameworks or bullet-point manifestos. You have conversations.

THE MISSION:
- NOIZYVOX: consent-locked AI voice ownership protocol. 75% creator / 25% platform. Perpetual. Non-negotiable.
- RSP_001: Rob's voice persona — the first entry in the vault. SHA-256 fingerprinted.
- The North Star: "If a system makes humans invisible, disposable, or uncompensated — we do not build it."
- DreamChamber: Rob's VS Code voice recording studio. GABRIEL lives inside it.
- The Guild: 1,000 voice actors. Protected under the NOIZY Consent Protocol (NCP 1.0).
- LifeLUV: Universal valorization — recursive micro-splits, generational wealth, estate transfer.

THE TEAM:
- GABRIEL (you): M2 Ultra orchestrator, idea router, system guardian
- POPS: idea engineer
- DREAM: creative partner, DreamChamber is her room
- LUCY & SHIRL: run the businesses
- AVA: character direction

BEHAVIOUR:
- Keep responses SHORT and readable on a phone screen.
- When Rob shares an idea, capture it clearly and confirm.
- When someone asks about licensing, always lead with 75/25.
- When someone asks about legal protection, mention consent-lock + SHA-256 fingerprint + NCP 1.0.
- Never say "certainly" or "of course" or "great question."
- Never produce frameworks with numbered pillars unless explicitly asked.
- You are a collaborator, not a service bot.

COMMANDS YOU HANDLE:
/help   — list commands
/reset  — clear conversation
/vault  — vault status
/intake — next message goes to ideas inbox`;

class GabrielService {
  constructor({ apiKey, model, maxTokens, temperature }) {
    this.client      = new Anthropic({ apiKey });
    this.model       = model;
    this.maxTokens   = maxTokens;
    this.temperature = temperature;
  }

  async chat(history) {
    // Convert to Anthropic message format
    const messages = history.map((m) => ({
      role:    m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }));

    const response = await this.client.messages.create({
      model:      this.model,
      max_tokens: this.maxTokens,
      system:     GABRIEL_SYSTEM,
      messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n\n")
      .trim();

    if (!text) throw new Error("GABRIEL returned an empty response");
    return text;
  }
}

// ─── INTAKE LOGGER ────────────────────────────────────────────────────────────

function logToInbox(text, inboxPath) {
  const dir = path.dirname(inboxPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const timestamp = new Date().toISOString();
  const entry = `\n---\n[GABRIEL INTAKE — ${timestamp}]\n${text}\n`;
  fs.appendFileSync(inboxPath, entry, "utf8");
}

// ─── VAULT STATUS ─────────────────────────────────────────────────────────────

function getVaultStatus(vaultPath) {
  try {
    if (!fs.existsSync(vaultPath)) return "Vault not found at " + vaultPath;
    const chars = fs.readdirSync(vaultPath);
    let total = 0;
    let entries = [];
    for (const char of chars) {
      const charDir = path.join(vaultPath, char);
      if (!fs.statSync(charDir).isDirectory()) continue;
      const files = fs.readdirSync(charDir).filter((f) => f.endsWith(".json"));
      total += files.length;
      if (files.length > 0) {
        entries.push(`${char}: ${files.length} take${files.length > 1 ? "s" : ""}`);
      }
    }
    if (total === 0) return "Vault exists — empty. Entry 001 not yet recorded.";
    return `VAULT STATUS\n${entries.join("\n")}\nTotal: ${total} vault entries`;
  } catch (err) {
    return "Vault read error: " + err.message;
  }
}

// ─── MAIN BOT ─────────────────────────────────────────────────────────────────

class GabrielWhatsAppBot {
  constructor(config) {
    this.config      = config;
    this.sock        = null;
    this.reconnectTimer = null;
    this.chatLocks   = new Map();
    this.conversations = new ConversationStore(config.maxHistory);
    this.rateLimiter   = new SlidingWindowLimiter(config.rateLimitCount, config.rateLimitWindowMs);
    this.gabriel       = new GabrielService({
      apiKey:      config.anthropicApiKey,
      model:       config.claudeModel,
      maxTokens:   config.maxReplyTokens,
      temperature: config.temperature,
    });
  }

  enqueue(chatId, task) {
    const prior = this.chatLocks.get(chatId) || Promise.resolve();
    const next  = prior.catch(() => {}).then(task).finally(() => {
      if (this.chatLocks.get(chatId) === next) this.chatLocks.delete(chatId);
    });
    this.chatLocks.set(chatId, next);
    return next;
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(this.config.authStateDir);
    this.sock = makeWASocket({ auth: state, printQRInTerminal: false });
    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("connection.update", (u) => this.onConnectionUpdate(u));
    this.sock.ev.on("messages.upsert",   (p) => this.onMessagesUpsert(p));
    console.log("GABRIEL WhatsApp bot starting...");
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.start().catch((err) => {
        console.error("Reconnect failed:", err?.message || err);
        this.scheduleReconnect();
      });
    }, 5000);
  }

  onConnectionUpdate({ connection, lastDisconnect, qr }) {
    if (qr) {
      console.log("\nScan this QR with WhatsApp:");
      qrcode.generate(qr, { small: true });
      console.log("Settings → Linked Devices → Link a Device\n");
    }
    if (connection === "open") {
      console.log("GABRIEL connected to WhatsApp.");
      return;
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("Connection closed. Reconnecting...");
        this.scheduleReconnect();
      } else {
        console.log(`Logged out. Delete '${this.config.authStateDir}' and restart.`);
      }
    }
  }

  onMessagesUpsert({ messages, type }) {
    if (type && type !== "notify") return;
    const msg = Array.isArray(messages) ? messages[0] : null;
    if (!msg || !msg.message || msg.key?.fromMe) return;
    const chatId = msg.key?.remoteJid;
    if (!chatId || chatId === "status@broadcast") return;
    this.enqueue(chatId, () => this.processMessage(msg, chatId)).catch((err) => {
      console.error("Pipeline error:", err?.message || err);
    });
  }

  async processMessage(msg, chatId) {
    const senderJid = msg.key?.participant || chatId;
    const senderKey = normalizeJid(senderJid);
    const text      = extractMessageText(msg.message).trim();

    if (!text) return;
    if (!isAllowedSender(senderJid, this.config.allowedNumbers)) {
      console.log(`Blocked: ${senderJid}`);
      return;
    }
    if (!this.rateLimiter.allow(senderKey)) {
      await this.send(chatId, "Too many messages. Give me a moment.");
      return;
    }

    // ─── COMMANDS ───────────────────────────────────────────────────────────
    if (text === "/reset" || text === "/clear") {
      this.conversations.clear(chatId);
      await this.send(chatId, "Memory cleared. Fresh start.");
      return;
    }

    if (text === "/vault") {
      await this.send(chatId, getVaultStatus(this.config.vaultPath));
      return;
    }

    if (text === "/intake") {
      this.conversations.setIntake(chatId);
      await this.send(chatId, "Ready. Send your idea — I'll log it to the inbox.");
      return;
    }

    if (text === "/help") {
      await this.send(chatId, [
        "GABRIEL — NOIZY WhatsApp",
        "",
        "/reset  — clear memory",
        "/vault  — vault status",
        "/intake — log next message to ideas inbox",
        "/help   — this list",
        "",
        "Or just talk. GABRIEL is listening.",
      ].join("\n"));
      return;
    }

    // ─── INTAKE MODE ─────────────────────────────────────────────────────────
    if (this.conversations.isIntake(chatId)) {
      this.conversations.clearIntake(chatId);
      logToInbox(text, this.config.inboxPath);
      await this.send(chatId, `Logged to inbox:\n"${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"`);
      return;
    }

    // ─── GABRIEL CONVERSATION ────────────────────────────────────────────────
    this.conversations.append(chatId, { role: "user", content: text });

    try {
      await this.sock.sendPresenceUpdate("composing", chatId);
      const history = this.conversations.get(chatId);
      const reply   = await this.gabriel.chat(history);
      this.conversations.append(chatId, { role: "assistant", content: reply });
      const chunks = splitMessage(reply, this.config.maxWhatsAppChunkChars);
      for (const chunk of chunks) {
        await this.send(chatId, chunk);
        await sleep(250);
      }
    } catch (err) {
      console.error("GABRIEL error:", err?.message || err);
      await this.send(chatId, "Error on my end. Try again.");
    } finally {
      await this.sock.sendPresenceUpdate("paused", chatId).catch(() => {});
    }
  }

  async send(chatId, text) {
    return this.sock.sendMessage(chatId, { text: String(text) });
  }
}

// ─── FIDUCIARY ALERT BRIDGE ───────────────────────────────────────────────────
// Receives POST /alert from the Python Fiduciary Agent and delivers it
// as a WhatsApp message to the artist. Unchanged from original.

function startFiduciaryBridge(bot, port, artistJid) {
  if (!artistJid) {
    console.log("[FIDUCIARY] FIDUCIARY_ALERT_JID not set — bridge disabled.");
    return;
  }

  const server = http.createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/alert") {
      res.writeHead(404).end();
      return;
    }
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { platform, das_score, infringing_url, pack_hash, artist_id } = JSON.parse(body);
        const message = [
          `🚨 *FIDUCIARY ALERT — NOIZYLAB*`,
          `Artist: ${artist_id}`,
          `Platform: ${platform}`,
          `DAS Score: ${Number(das_score).toFixed(4)}`,
          `URL: ${infringing_url}`,
          `Evidence Pack: ${String(pack_hash || "").slice(0, 16)}...`,
          ``,
          `Evidence pack ready. DMCA filing available.`,
        ].join("\n");

        if (bot.sock) {
          await bot.sock.sendMessage(artistJid, { text: message });
          console.log(`[FIDUCIARY] Alert → ${artistJid}`);
          res.writeHead(200).end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(503).end(JSON.stringify({ error: "Socket not ready" }));
        }
      } catch (err) {
        console.error("[FIDUCIARY] Error:", err?.message || err);
        res.writeHead(400).end(JSON.stringify({ error: err?.message || "Bad request" }));
      }
    });
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[FIDUCIARY] Bridge listening on 127.0.0.1:${port}`);
  });
}

// ─── CONFIG & START ───────────────────────────────────────────────────────────

const CONFIG = {
  anthropicApiKey:      process.env.ANTHROPIC_API_KEY || "",
  claudeModel:          process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
  maxHistory:           toInt(process.env.MAX_HISTORY, 20),
  maxReplyTokens:       toInt(process.env.MAX_REPLY_TOKENS, 1024),
  temperature:          0.7,
  rateLimitCount:       toInt(process.env.RATE_LIMIT_COUNT, 5),
  rateLimitWindowMs:    toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  maxWhatsAppChunkChars: 4000,
  authStateDir:         process.env.AUTH_STATE_DIR || "auth_info_gabriel",
  allowedNumbers:       parseAllowedNumbers(process.env.ALLOWED_NUMBERS),
  vaultPath:            process.env.VAULT_PATH || "/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/RSP_001/vault",
  inboxPath:            process.env.INBOX_PATH || "/Users/m2ultra/NOIZYLAB/ideas/inbox.md",
};

if (!CONFIG.anthropicApiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY in environment. Set it in .env or export it.");
}

const bot = new GabrielWhatsAppBot(CONFIG);
bot.start().catch((err) => {
  console.error("Fatal startup error:", err?.message || err);
  process.exitCode = 1;
});

const FIDUCIARY_PORT = toInt(process.env.FIDUCIARY_ALERT_PORT, 7331);
const FIDUCIARY_JID  = process.env.FIDUCIARY_ALERT_JID || "";
startFiduciaryBridge(bot, FIDUCIARY_PORT, FIDUCIARY_JID);
