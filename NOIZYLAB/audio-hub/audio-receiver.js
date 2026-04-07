/**
 * NOIZY Audio Hub — MC96 Broadcast Receiver
 *
 * Topology:
 *   Audio Hijack (Mac Studio mic) → HTTP stream (10.90.90.10:8000)
 *        ↓
 *   audio-receiver (this, port 9000)
 *        ↓ re-broadcast    ↓ transcript webhook    ↓ status
 *   VS Code / iPad      POST /transcript          GET /status
 *                            ↓
 *                       GABRIEL WebSocket (10.90.90.10:7777/voice)
 *
 * Any device on the MC96 network that has audio can call:
 *   POST http://10.90.90.10:9000/transcript  { "text": "..." }
 * and GABRIEL hears it instantly.
 */

'use strict';

const http      = require('http');
const fs        = require('fs');
const path      = require('path');
const WebSocket = require('ws');

// ── Config ────────────────────────────────────────────────────────────────────
const AUDIO_STREAM_URL = process.env.AUDIO_STREAM_URL || 'http://10.90.90.10:8000/stream';
const GABRIEL_WS_URL   = process.env.GABRIEL_WS_URL   || 'ws://10.90.90.10:7777/voice';
const RECEIVER_PORT    = parseInt(process.env.RECEIVER_PORT || '9000', 10);
const CACHE_DIR        = path.join(__dirname, 'audio-cache');
const MAX_CACHE_MB     = 50; // rolling cache cap

fs.mkdirSync(CACHE_DIR, { recursive: true });

// ── State ─────────────────────────────────────────────────────────────────────
const httpClients  = new Set();
let   audioActive  = false;
let   cacheStream  = null;
let   gabrielWs    = null;
let   reconnecting = false;
let   bytesReceived = 0;

// ── GABRIEL WebSocket ─────────────────────────────────────────────────────────
function connectGabriel() {
  if (reconnecting) return;
  reconnecting = true;

  gabrielWs = new WebSocket(GABRIEL_WS_URL);

  gabrielWs.on('open', () => {
    reconnecting = false;
    log('GABRIEL voice channel open');
    gabrielSend({ type: 'transcript', text: 'Audio Hub online. MC96 broadcast active. GORUNFREE.' });
  });

  gabrielWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'gabriel') log(`GABRIEL: ${msg.text}`);
    } catch { /* ignore */ }
  });

  gabrielWs.on('close', () => {
    reconnecting = false;
    log('GABRIEL disconnected — reconnecting in 5s');
    setTimeout(connectGabriel, 5000);
  });

  gabrielWs.on('error', (e) => {
    log(`GABRIEL error: ${e.message}`);
    reconnecting = false;
  });
}

function gabrielSend(payload) {
  if (gabrielWs?.readyState === WebSocket.OPEN) {
    gabrielWs.send(JSON.stringify(payload));
  }
}

// ── Rolling cache ─────────────────────────────────────────────────────────────
function openCacheStream() {
  const file = path.join(CACHE_DIR, `stream-${Date.now()}.mp3`);
  cacheStream = fs.createWriteStream(file, { flags: 'a' });
  log(`Cache: ${file}`);
  pruneCache();
}

function pruneCache() {
  const files = fs.readdirSync(CACHE_DIR)
    .filter(f => f.endsWith('.mp3'))
    .map(f => ({ f, t: fs.statSync(path.join(CACHE_DIR, f)).mtimeMs }))
    .sort((a, b) => a.t - b.t);

  let total = files.reduce((s, { f }) => s + fs.statSync(path.join(CACHE_DIR, f)).size, 0);
  while (total > MAX_CACHE_MB * 1024 * 1024 && files.length > 1) {
    const oldest = files.shift();
    fs.unlinkSync(path.join(CACHE_DIR, oldest.f));
    total = files.reduce((s, { f }) => s + fs.statSync(path.join(CACHE_DIR, f)).size, 0);
  }
}

// ── Audio Hijack stream connection ────────────────────────────────────────────
function connectToStream() {
  log(`Connecting to Audio Hijack stream: ${AUDIO_STREAM_URL}`);

  const req = http.get(AUDIO_STREAM_URL, (res) => {
    if (res.statusCode !== 200) {
      log(`Stream returned ${res.statusCode} — retrying in 5s`);
      setTimeout(connectToStream, 5000);
      return;
    }

    audioActive = true;
    openCacheStream();
    log(`Stream active — broadcasting to ${httpClients.size} client(s)`);
    gabrielSend({ type: 'transcript', text: 'Audio Hijack stream connected. Mic is live.' });

    res.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (cacheStream?.writable) cacheStream.write(chunk);
      for (const client of httpClients) {
        if (!client.writableEnded) client.write(chunk);
      }
    });

    res.on('end', () => {
      audioActive = false;
      cacheStream?.end();
      log('Stream ended — reconnecting in 3s');
      gabrielSend({ type: 'transcript', text: 'Audio stream ended. Reconnecting.' });
      setTimeout(connectToStream, 3000);
    });

    res.on('error', (e) => {
      audioActive = false;
      log(`Stream error: ${e.message}`);
      setTimeout(connectToStream, 5000);
    });
  });

  req.on('error', (e) => {
    log(`Connection error: ${e.message} — retrying in 5s`);
    setTimeout(connectToStream, 5000);
  });
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = req.url.split('?')[0];

  // ── GET /status ─────────────────────────────────────────────────────────
  if (url === '/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      audio_active: audioActive,
      stream_url: AUDIO_STREAM_URL,
      gabriel_connected: gabrielWs?.readyState === WebSocket.OPEN,
      http_clients: httpClients.size,
      bytes_received: bytesReceived,
      gorunfree: true,
      ts: new Date().toISOString(),
    }));
    return;
  }

  // ── GET /stream — re-broadcast audio to any HTTP consumer ───────────────
  if (url === '/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-NOIZY': 'MC96-GORUNFREE',
    });
    httpClients.add(res);
    log(`HTTP client connected (${httpClients.size} total)`);

    req.on('close', () => {
      httpClients.delete(res);
      log(`HTTP client disconnected (${httpClients.size} remaining)`);
    });
    return;
  }

  // ── POST /transcript — any device posts text → GABRIEL hears it ─────────
  // Used by Talon, Moonshine, Whisper, or manual tools
  if (url === '/transcript' && req.method === 'POST') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      try {
        const { text, source } = JSON.parse(body);
        if (!text) { res.writeHead(400); res.end(JSON.stringify({ error: 'text required' })); return; }
        log(`TRANSCRIPT [${source || 'unknown'}]: ${text}`);
        gabrielSend({ type: 'transcript', text });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, forwarded_to_gabriel: true }));
      } catch {
        res.writeHead(400); res.end(JSON.stringify({ error: 'invalid JSON' }));
      }
    });
    return;
  }

  // ── GET / — dashboard ────────────────────────────────────────────────────
  if (url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /><title>NOIZY Audio Hub</title>
  <meta http-equiv="refresh" content="3" />
  <style>
    body { background:#0a0a0a; color:#e0e0e0; font-family:'Fira Code',monospace; padding:24px; }
    h1   { color:#00ffcc; letter-spacing:.15em; margin-bottom:24px; }
    .card { background:#111; border:1px solid #222; border-radius:6px; padding:20px; margin-bottom:12px; }
    .on  { color:#00ffcc; } .off { color:#e74c3c; }
    code { color:#888; font-size:.85rem; }
    .badge { font-size:.75rem; letter-spacing:.1em; padding:3px 8px; border-radius:3px; }
  </style>
</head>
<body>
  <h1>⬛ NOIZY AUDIO HUB</h1>
  <div class="card">
    <p>Audio Stream: <span class="${audioActive ? 'on' : 'off'}">${audioActive ? '● LIVE' : '○ WAITING'}</span></p>
    <p>GABRIEL: <span class="${gabrielWs?.readyState === 1 ? 'on' : 'off'}">${gabrielWs?.readyState === 1 ? '● CONNECTED' : '○ DISCONNECTED'}</span></p>
    <p>HTTP Clients: <strong>${httpClients.size}</strong></p>
    <p>Bytes received: <code>${(bytesReceived / 1024).toFixed(1)} KB</code></p>
  </div>
  <div class="card">
    <p style="color:#555;font-size:.85rem;">ENDPOINTS</p>
    <p><code>GET  /stream      </code> — re-broadcast audio stream</p>
    <p><code>POST /transcript  </code> — { "text": "..." } → GABRIEL</p>
    <p><code>GET  /status      </code> — JSON status</p>
  </div>
  <p style="font-size:.7rem;color:#333;margin-top:24px;">GORUNFREE · MC96ECOUNIVERSE · auto-refresh 3s</p>
</body>
</html>`);
    return;
  }

  res.writeHead(404); res.end('Not found');
});

// ── Boot ──────────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

server.listen(RECEIVER_PORT, '0.0.0.0', () => {
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(`NOIZY Audio Hub — MC96 Broadcast Receiver`);
  log(`HTTP  : http://0.0.0.0:${RECEIVER_PORT}`);
  log(`Stream: ${AUDIO_STREAM_URL}`);
  log(`GABRIEL: ${GABRIEL_WS_URL}`);
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  connectGabriel();
  connectToStream();
});

process.on('SIGINT', () => {
  log('Shutting down — GORUNFREE');
  gabrielWs?.close();
  server.close(() => process.exit(0));
});
