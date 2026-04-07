"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const { CohereClientV2 } = require("cohere-ai");

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
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
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isAllowedSender(senderJid, allowedEntries) {
  if (allowedEntries.length === 0) return true;

  const normalizedSenderJid = normalizeJid(senderJid);
  const senderNumber = normalizeNumber(jidNumber(senderJid));

  return allowedEntries.some((entry) => {
    const normalizedEntry = normalizeJid(entry);

    if (normalizedEntry.includes("@")) {
      return normalizedEntry === normalizedSenderJid;
    }

    const entryNumber = normalizeNumber(normalizedEntry);
    return entryNumber.length > 0 && entryNumber === senderNumber;
  });
}

function containsRestrictedContent(text) {
  const bannedPatterns = [
    /hack|crack|exploit|malware/i,
    /bomb|terrorism|violence/i,
    /personal data|password|credit card/i,
  ];

  return bannedPatterns.some((pattern) => pattern.test(text));
}

function unwrapMessage(message) {
  let current = message || {};

  while (true) {
    if (current.ephemeralMessage?.message) {
      current = current.ephemeralMessage.message;
      continue;
    }
    if (current.viewOnceMessage?.message) {
      current = current.viewOnceMessage.message;
      continue;
    }
    if (current.viewOnceMessageV2?.message) {
      current = current.viewOnceMessageV2.message;
      continue;
    }
    if (current.viewOnceMessageV2Extension?.message) {
      current = current.viewOnceMessageV2Extension.message;
      continue;
    }
    break;
  }

  return current;
}

function extractMessageText(message) {
  const payload = unwrapMessage(message);

  const interactiveJson = payload.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  let interactiveText = "";
  if (interactiveJson) {
    try {
      const parsed = JSON.parse(interactiveJson);
      interactiveText = String(parsed?.id || parsed?.title || "");
    } catch {
      interactiveText = "";
    }
  }

  return (
    payload.conversation ||
    payload.extendedTextMessage?.text ||
    payload.imageMessage?.caption ||
    payload.videoMessage?.caption ||
    payload.documentMessage?.caption ||
    payload.buttonsResponseMessage?.selectedDisplayText ||
    payload.listResponseMessage?.title ||
    payload.templateButtonReplyMessage?.selectedDisplayText ||
    interactiveText ||
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
    const breakpoints = [
      candidate.lastIndexOf("\n\n"),
      candidate.lastIndexOf("\n"),
      candidate.lastIndexOf(" "),
    ];
    const bestBreakpoint = Math.max(...breakpoints);

    if (bestBreakpoint > Math.floor(maxLen * 0.6)) {
      candidate = candidate.slice(0, bestBreakpoint);
    }

    chunks.push(candidate.trim());
    remaining = remaining.slice(candidate.length).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fallback corpus so the docs tool still works without external retrieval wiring.
const BUILTIN_DOCS_CORPUS = Object.freeze([
  {
    id: "cohere-chat-ref",
    title: "Cohere API v2 - Chat",
    url: "https://docs.cohere.com/reference/chat",
    text: "Use the Chat endpoint to generate responses and optionally call tools.",
  },
  {
    id: "cohere-tool-use-overview",
    title: "Tool use (function calling) overview",
    url: "https://docs.cohere.com/v2/docs/tool-use-overview",
    text: "Tool use connects models to external tools like search engines and APIs.",
  },
  {
    id: "cohere-structured-outputs",
    title: "Structured outputs",
    url: "https://docs.cohere.com/docs/structured-outputs",
    text: "Use JSON schema to define structured inputs and outputs for tools and responses.",
  },
]);

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function truncateText(value, maxLen) {
  const text = String(value || "").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, Math.max(0, maxLen - 1)).trimEnd()}...`;
}

function normalizeDocRecord(record, index) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const title = truncateText(record.title || record.name || "", 200);
  const url = truncateText(record.url || "", 500);
  const text = truncateText(
    record.text || record.snippet || record.content || "",
    1600
  );

  if (!title && !url && !text) {
    return null;
  }

  return {
    id: truncateText(record.id || `doc:${index}`, 120),
    title: title || url || `Document ${index + 1}`,
    url,
    text,
  };
}

function loadDocsCorpus(filePath) {
  if (!filePath) {
    return BUILTIN_DOCS_CORPUS;
  }

  const resolvedPath = path.resolve(filePath);

  try {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("expected a JSON array");
    }

    const docs = parsed
      .map((record, index) => normalizeDocRecord(record, index))
      .filter(Boolean);

    if (docs.length === 0) {
      throw new Error("no valid documents found");
    }

    console.log(`Loaded ${docs.length} docs from ${resolvedPath}`);
    return docs;
  } catch (error) {
    console.error(
      `Failed to load DOCS_JSON_PATH '${resolvedPath}': ${error?.message || error}`
    );
    console.log(
      `Falling back to built-in docs corpus (${BUILTIN_DOCS_CORPUS.length} docs).`
    );
    return BUILTIN_DOCS_CORPUS;
  }
}

function tokenizeSearchTerms(value) {
  return Array.from(
    new Set(
      String(value || "")
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1)
    )
  );
}

function scoreDocument(query, queryTokens, doc) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const title = String(doc.title || "").toLowerCase();
  const url = String(doc.url || "").toLowerCase();
  const text = String(doc.text || "").toLowerCase();

  let score = 0;

  if (normalizedQuery && title.includes(normalizedQuery)) score += 18;
  if (normalizedQuery && text.includes(normalizedQuery)) score += 8;

  for (const token of queryTokens) {
    if (title.includes(token)) score += 6;
    if (url.includes(token)) score += 3;
    if (text.includes(token)) score += 2;
  }

  return score;
}

function searchDocs(corpus, query, topK = 3) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) return [];

  const queryTokens = tokenizeSearchTerms(trimmedQuery);
  const limit = clampInt(topK, 1, 10, 3);

  return corpus
    .map((doc, index) => ({
      doc,
      index,
      score: scoreDocument(trimmedQuery, queryTokens, doc),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ doc }) => ({
      id: doc.id,
      title: doc.title,
      url: doc.url,
      text: doc.text,
    }));
}

function parseToolArguments(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Tool arguments were not valid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Tool arguments must decode to a JSON object");
  }

  return parsed;
}

function extractAssistantText(message) {
  const items = Array.isArray(message?.content) ? message.content : [];

  return items
    .filter((item) => item?.type === "text" && item.text)
    .map((item) => String(item.text).trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function extractCitationSourceData(source) {
  if (!source || typeof source !== "object") return null;

  if (source.type === "document") {
    const document = source.document || null;
    return document?.data && typeof document.data === "object"
      ? document.data
      : document;
  }

  if (source.type === "tool") {
    const toolOutput = source.toolOutput || null;
    return toolOutput?.data && typeof toolOutput.data === "object"
      ? toolOutput.data
      : toolOutput;
  }

  return null;
}

function formatCitationFooter(citations) {
  const lines = [];
  const seen = new Set();

  for (const citation of citations || []) {
    for (const source of citation?.sources || []) {
      const sourceData = extractCitationSourceData(source);
      if (!sourceData || typeof sourceData !== "object") continue;

      const title = String(
        sourceData.title || sourceData.name || source.id || ""
      ).trim();
      const url = String(sourceData.url || "").trim();
      const key = `${title}|${url}`;

      if ((!title && !url) || seen.has(key)) continue;

      seen.add(key);
      lines.push(url ? `${title || source.id}: ${url}` : title || source.id);

      if (lines.length >= 5) break;
    }

    if (lines.length >= 5) break;
  }

  if (lines.length === 0) return "";

  return `Sources:\n${lines
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n")}`;
}

class SlidingWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.events = new Map();
  }

  allow(key) {
    const now = Date.now();
    const previous = this.events.get(key) || [];
    const recent = previous.filter((time) => now - time < this.windowMs);

    if (recent.length >= this.limit) {
      this.events.set(key, recent);
      return false;
    }

    recent.push(now);
    this.events.set(key, recent);
    return true;
  }
}

class ConversationStore {
  constructor(maxHistory) {
    this.maxHistory = maxHistory;
    this.conversations = new Map();
  }

  get(chatId) {
    if (!this.conversations.has(chatId)) {
      this.conversations.set(chatId, []);
    }
    return this.conversations.get(chatId);
  }

  append(chatId, message) {
    const history = this.get(chatId);
    history.push(message);
    if (history.length > this.maxHistory) {
      history.splice(0, history.length - this.maxHistory);
    }
  }

  clear(chatId) {
    this.conversations.delete(chatId);
  }
}

class CohereService {
  constructor({
    apiKey,
    model,
    systemPrompt,
    maxTokens,
    temperature,
    docsCorpus,
    docsTopK,
    maxToolRounds,
  }) {
    this.client = new CohereClientV2({ token: apiKey });
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.docsCorpus = Array.isArray(docsCorpus) ? docsCorpus : BUILTIN_DOCS_CORPUS;
    this.docsTopK = clampInt(docsTopK, 1, 10, 3);
    this.maxToolRounds = clampInt(maxToolRounds, 1, 8, 4);
    this.tools = [
      {
        type: "function",
        function: {
          name: "search_docs",
          description:
            "Search documentation and return relevant snippets as documents that can be cited in the answer.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to look up in the docs.",
              },
              top_k: {
                type: "integer",
                description: "How many documents to return.",
              },
            },
            required: ["query"],
          },
        },
      },
    ];
  }

  async chat(history) {
    const messages = [{ role: "system", content: this.systemPrompt }, ...history];

    for (let round = 0; round <= this.maxToolRounds; round += 1) {
      const response = await this.client.chat({
        model: this.model,
        messages,
        tools: this.tools,
        maxTokens: this.maxTokens,
        temperature: this.temperature,
      });

      const assistantMessage = response.message;
      const toolCalls = Array.isArray(assistantMessage?.toolCalls)
        ? assistantMessage.toolCalls
        : [];

      if (toolCalls.length === 0) {
        const text = extractAssistantText(assistantMessage);

        if (!text) {
          throw new Error("Cohere returned an empty response");
        }

        return {
          text,
          citations: assistantMessage?.citations || [],
        };
      }

      if (round === this.maxToolRounds) {
        throw new Error("Cohere exceeded the configured tool-call limit");
      }

      messages.push(assistantMessage);

      for (const toolCall of toolCalls) {
        messages.push(this.executeToolCall(toolCall));
      }
    }

    throw new Error("Cohere did not complete the tool flow");
  }

  buildToolError(toolCallId, message) {
    return {
      role: "tool",
      toolCallId,
      content: JSON.stringify({ error: message }),
    };
  }

  executeToolCall(toolCall) {
    const toolCallId = toolCall?.id;
    if (!toolCallId) {
      throw new Error("Cohere tool call was missing an id");
    }

    const toolName = toolCall?.function?.name;

    if (toolName !== "search_docs") {
      return this.buildToolError(toolCallId, `Unsupported tool '${toolName || "unknown"}'`);
    }

    let args;
    try {
      args = parseToolArguments(toolCall?.function?.arguments);
    } catch (error) {
      return this.buildToolError(toolCallId, error?.message || "Invalid tool arguments");
    }

    const query = String(args.query || "").trim();
    if (!query) {
      return this.buildToolError(toolCallId, "Missing required 'query' argument");
    }

    const results = searchDocs(this.docsCorpus, query, args.top_k ?? this.docsTopK);

    if (results.length === 0) {
      return {
        role: "tool",
        toolCallId,
        content: JSON.stringify({
          query,
          results: [],
          message: "No matching documents found.",
        }),
      };
    }

    return {
      role: "tool",
      toolCallId,
      content: results.map((doc) => ({
        type: "document",
        document: {
          id: doc.id,
          data: {
            title: doc.title,
            url: doc.url,
            text: doc.text,
          },
        },
      })),
    };
  }
}

class WhatsAppCohereBot {
  constructor(config) {
    this.config = config;
    this.sock = null;
    this.reconnectTimer = null;
    this.chatLocks = new Map();
    this.conversations = new ConversationStore(config.maxHistory);
    this.rateLimiter = new SlidingWindowLimiter(config.rateLimitCount, config.rateLimitWindowMs);
    this.cohere = new CohereService({
      apiKey: config.cohereApiKey,
      model: config.cohereModel,
      systemPrompt: config.systemPrompt,
      maxTokens: config.maxReplyTokens,
      temperature: config.temperature,
      docsCorpus: config.docsCorpus,
      docsTopK: config.docsTopK,
      maxToolRounds: config.maxToolRounds,
    });
  }

  enqueue(chatId, task) {
    const prior = this.chatLocks.get(chatId) || Promise.resolve();
    const next = prior
      .catch(() => {})
      .then(task)
      .finally(() => {
        if (this.chatLocks.get(chatId) === next) {
          this.chatLocks.delete(chatId);
        }
      });

    this.chatLocks.set(chatId, next);
    return next;
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(this.config.authStateDir);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("connection.update", (update) => this.onConnectionUpdate(update));
    this.sock.ev.on("messages.upsert", (payload) => this.onMessagesUpsert(payload));

    console.log("Cohere WhatsApp bot starting...");
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.start().catch((error) => {
        console.error("Reconnect failed:", error?.message || error);
        this.scheduleReconnect();
      });
    }, 5000);
  }

  onConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nScan this QR code with WhatsApp:");
      qrcode.generate(qr, { small: true });
      console.log("\nSettings -> Linked Devices -> Link a Device\n");
    }

    if (connection === "open") {
      console.log("Connected to WhatsApp");
      return;
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("Connection closed. Reconnecting in 5 seconds...");
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

    this.enqueue(chatId, async () => {
      await this.processMessage(msg, chatId);
    }).catch((error) => {
      console.error("Message pipeline error:", error?.message || error);
    });
  }

  async processMessage(msg, chatId) {
    const senderJid = msg.key?.participant || chatId;
    const senderKey = normalizeJid(senderJid);
    const text = extractMessageText(msg.message).trim();

    if (!text) return;

    if (!isAllowedSender(senderJid, this.config.allowedNumbers)) {
      console.log(`Unauthorized sender blocked: ${senderJid}`);
      return;
    }

    if (!this.rateLimiter.allow(senderKey)) {
      await this.sock.sendMessage(chatId, {
        text: "Too many messages. Please wait a moment.",
      });
      return;
    }

    if (containsRestrictedContent(text)) {
      await this.sock.sendMessage(chatId, {
        text: "This message contains restricted content.",
      });
      return;
    }

    if (text === "/reset" || text === "/clear") {
      this.conversations.clear(chatId);
      await this.sock.sendMessage(chatId, {
        text: "Conversation memory cleared.",
      });
      return;
    }

    this.conversations.append(chatId, { role: "user", content: text });

    try {
      await this.sock.sendPresenceUpdate("composing", chatId);

      const history = this.conversations.get(chatId);
      const reply = await this.cohere.chat(history);
      const citationFooter = formatCitationFooter(reply.citations);
      const outboundText = citationFooter
        ? `${reply.text}\n\n${citationFooter}`
        : reply.text;

      this.conversations.append(chatId, { role: "assistant", content: reply.text });

      const chunks = splitMessage(outboundText, this.config.maxWhatsAppChunkChars);
      for (const chunk of chunks) {
        await this.sock.sendMessage(chatId, { text: chunk });
        await sleep(250);
      }
    } catch (error) {
      console.error("Message handling error:", error?.message || error);
      await this.sock.sendMessage(chatId, {
        text: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      await this.sock.sendPresenceUpdate("paused", chatId).catch(() => {});
    }
  }
}

const CONFIG = {
  cohereApiKey: process.env.COHERE_API_KEY || "",
  cohereModel: process.env.COHERE_MODEL || "command-a-03-2025",
  systemPrompt:
    process.env.SYSTEM_PROMPT ||
    "You are a helpful WhatsApp assistant. Keep responses concise and friendly for mobile reading. When the user asks for documentation or sources, use the available tools and ground the answer in citations.",
  maxHistory: toInt(process.env.MAX_HISTORY, 15),
  maxReplyTokens: toInt(process.env.COHERE_MAX_TOKENS, 1000),
  temperature: toNumber(process.env.COHERE_TEMPERATURE, 0.7),
  rateLimitCount: toInt(process.env.RATE_LIMIT_COUNT, 5),
  rateLimitWindowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  docsCorpus: loadDocsCorpus(process.env.DOCS_JSON_PATH || ""),
  docsTopK: toInt(process.env.DOCS_TOP_K, 3),
  maxToolRounds: toInt(process.env.COHERE_MAX_TOOL_ROUNDS, 4),
  maxWhatsAppChunkChars: 4000,
  authStateDir: process.env.AUTH_STATE_DIR || "auth_info_cohere",
  allowedNumbers: parseAllowedNumbers(process.env.ALLOWED_NUMBERS),
};

if (!CONFIG.cohereApiKey) {
  throw new Error("Missing COHERE_API_KEY in environment");
}

// ─────────────────────────────────────────────
// FIDUCIARY ALERT BRIDGE
// Receives POST /alert from the Python Fiduciary Agent
// and delivers it as a WhatsApp message to the artist.
// ─────────────────────────────────────────────

const http = require("http");

function startFiduciaryBridge(bot, port, artistJid) {
  if (!artistJid) {
    console.log("[FIDUCIARY] FIDUCIARY_ALERT_JID not set — alert bridge disabled.");
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
        const payload = JSON.parse(body);
        const { platform, das_score, infringing_url, pack_hash, artist_id } = payload;

        const message = [
          `🚨 *FIDUCIARY ALERT — NOIZYLAB*`,
          `Artist: ${artist_id}`,
          `Platform: ${platform}`,
          `DAS Score: ${Number(das_score).toFixed(4)}`,
          `URL: ${infringing_url}`,
          `Evidence Pack: ${String(pack_hash || "").slice(0, 16)}...`,
          ``,
          `Evidence pack generated. Ready for DMCA filing.`,
        ].join("\n");

        if (bot.sock) {
          await bot.sock.sendMessage(artistJid, { text: message });
          console.log(`[FIDUCIARY] Alert delivered to ${artistJid}`);
          res.writeHead(200).end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(503).end(JSON.stringify({ error: "Socket not ready" }));
        }
      } catch (err) {
        console.error("[FIDUCIARY] Alert error:", err?.message || err);
        res.writeHead(400).end(JSON.stringify({ error: err?.message || "Bad request" }));
      }
    });
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[FIDUCIARY] Alert bridge listening on 127.0.0.1:${port}`);
  });
}

const bot = new WhatsAppCohereBot(CONFIG);
bot.start().catch((error) => {
  console.error("Fatal startup error:", error?.message || error);
  process.exitCode = 1;
});

const FIDUCIARY_PORT = toInt(process.env.FIDUCIARY_ALERT_PORT, 7331);
const FIDUCIARY_JID  = process.env.FIDUCIARY_ALERT_JID || "";
startFiduciaryBridge(bot, FIDUCIARY_PORT, FIDUCIARY_JID);
