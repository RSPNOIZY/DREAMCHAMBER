#!/usr/bin/env node
/**
 * NOIZY.AI — Full Observer Mode
 * ==============================
 * Generates a system digest that Claude can read via MCP.
 * Covers: services, GABRIEL, transcripts, voice pipeline, logs.
 * Zero external dependencies — uses sqlite3 CLI for DB queries.
 *
 * Run: node /Users/m2ultra/NOIZYLAB/tools/observer.mjs
 * Output: /Users/m2ultra/NOIZYLAB/tools/observer-digest.json
 *
 * Author: Robert Stephen Plowman — The DreamChamber
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIGEST_PATH = path.join(__dirname, 'observer-digest.json');

const NOIZYLAB = '/Users/m2ultra/NOIZYLAB';
const GABRIEL_DB = path.join(NOIZYLAB, 'gabriel.db');
const GABRIEL_LOGS = '/Users/m2ultra/NOIZYANTHROPIC/GABRIEL/logs';
const PIPELINE_STATE = path.join(NOIZYLAB, 'voice-pipeline/.pipeline-state.json');
const TRANSCRIPTS_DIR = path.join(NOIZYLAB, 'voice-pipeline/transcripts');
const LOGS_DIR = path.join(NOIZYLAB, 'logs');

function sql(query) {
  try {
    const result = execSync(
      `sqlite3 -json "${GABRIEL_DB}" "${query.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    return result ? JSON.parse(result) : [];
  } catch (e) {
    return [{ error: e.message }];
  }
}

function shellSafe(cmd, timeout = 5000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout }).trim();
  } catch {
    return '';
  }
}

// ── Service Health ─────────────────────────────────────────
function checkServices() {
  const services = {};
  const checks = [
    { name: 'voice-bridge', pattern: 'voice-bridge-server.js' },
    { name: 'gabriel-daemon', pattern: 'gabriel-daemon.js' },
    { name: 'gabriel-monitor', pattern: 'gabriel_monitor.py' },
    { name: 'voice-server', pattern: 'voice_server.py' },
    { name: 'audio-hijack', pattern: 'Audio Hijack.app' },
    { name: 'ollama', pattern: 'ollama serve' },
  ];

  for (const check of checks) {
    const result = shellSafe(`ps aux | grep "${check.pattern}" | grep -v grep | head -1`);
    if (result) {
      const parts = result.split(/\s+/);
      services[check.name] = {
        status: 'RUNNING',
        pid: parts[1],
        cpu: parts[2] + '%',
        mem: parts[3] + '%',
        started: parts[8] || 'unknown',
      };
    } else {
      services[check.name] = { status: 'DOWN' };
    }
  }

  // Voice bridge health endpoint
  const health = shellSafe('curl -s --max-time 2 http://localhost:8080/health 2>/dev/null');
  if (health) {
    try {
      services['voice-bridge-http'] = { status: 'HEALTHY', response: JSON.parse(health) };
    } catch {
      services['voice-bridge-http'] = { status: 'RESPONDED', raw: health.slice(0, 200) };
    }
  } else {
    services['voice-bridge-http'] = { status: 'UNREACHABLE' };
  }

  return services;
}

// ── Ollama Models ──────────────────────────────────────────
function getOllamaModels() {
  const result = shellSafe('ollama list 2>/dev/null');
  if (!result) return [];
  return result.split('\n').slice(1).filter(Boolean).map(line => {
    const parts = line.split(/\s+/);
    return { name: parts[0], size: (parts[2] || '') + ' ' + (parts[3] || '') };
  });
}

// ── GABRIEL DB ─────────────────────────────────────────────
function getRecentSessions(limit = 15) {
  return sql(`SELECT role, substr(content, 1, 500) as content, ts FROM session_log ORDER BY id DESC LIMIT ${limit}`).reverse();
}

function getActiveTasks() {
  return sql(`SELECT id, description, priority, status, created_at FROM tasks WHERE status != 'completed' ORDER BY created_at DESC LIMIT 20`);
}

function getRecentMemory(limit = 10) {
  return sql(`SELECT key, substr(value, 1, 300) as value, category, updated_at FROM memcell ORDER BY updated_at DESC LIMIT ${limit}`);
}

function getConsentStatus() {
  return sql(`SELECT COUNT(*) as total, SUM(granted) as granted FROM consent_matrix`);
}

function getEstateMembers() {
  return sql(`SELECT hvs_id, full_name, relationship, status FROM estate_members ORDER BY created_at`);
}

// ── GABRIEL Logs ───────────────────────────────────────────
function getGabrielLogs(lines = 30) {
  const logs = {};
  for (const file of ['gabriel.log', 'gabriel.err', 'noizyvox.log', 'noizyvox.err']) {
    const filepath = path.join(GABRIEL_LOGS, file);
    try {
      if (fs.existsSync(filepath)) {
        const stat = fs.statSync(filepath);
        if (stat.size > 0) {
          const raw = shellSafe(`tail -${lines * 2} "${filepath}"`);
          // Filter out repetitive health checks
          const filtered = raw
            .split('\n')
            .filter(l => !l.includes('GET /health') && l.trim())
            .slice(-lines);
          logs[file] = {
            lastModified: stat.mtime.toISOString(),
            sizeBytes: stat.size,
            lines: filtered,
          };
        }
      }
    } catch {
      logs[file] = { status: 'unreadable' };
    }
  }
  return logs;
}

// ── Voice Pipeline ─────────────────────────────────────────
function getPipelineState() {
  try {
    if (fs.existsSync(PIPELINE_STATE)) {
      return JSON.parse(fs.readFileSync(PIPELINE_STATE, 'utf8'));
    }
    return { status: 'no state file' };
  } catch (e) {
    return { error: e.message };
  }
}

function getLatestTranscripts(limit = 10) {
  try {
    if (!fs.existsSync(TRANSCRIPTS_DIR)) return [];
    const files = fs.readdirSync(TRANSCRIPTS_DIR)
      .filter(f => /\.(md|txt|json)$/.test(f))
      .map(f => {
        const filepath = path.join(TRANSCRIPTS_DIR, f);
        const stat = fs.statSync(filepath);
        return { name: f, sizeBytes: stat.size, modified: stat.mtime.toISOString(), filepath };
      })
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, limit);

    // Read latest transcript if small enough
    if (files.length > 0 && files[0].sizeBytes < 50000) {
      files[0].content = fs.readFileSync(files[0].filepath, 'utf8');
    }
    return files;
  } catch {
    return [];
  }
}

// ── System Logs ────────────────────────────────────────────
function getSystemLogs() {
  const logs = {};
  for (const file of ['n8n.log', 'noizylab_services.log']) {
    const filepath = path.join(LOGS_DIR, file);
    try {
      if (fs.existsSync(filepath)) {
        const stat = fs.statSync(filepath);
        const content = shellSafe(`tail -20 "${filepath}"`);
        logs[file] = {
          lastModified: stat.mtime.toISOString(),
          sizeBytes: stat.size,
          tail: content.split('\n'),
        };
      }
    } catch {
      logs[file] = { status: 'unreadable' };
    }
  }
  return logs;
}

// ── Disk & Uptime ──────────────────────────────────────────
function getSystemInfo() {
  const df = shellSafe('df -h / | tail -1');
  const parts = df.split(/\s+/);
  const uptime = shellSafe('uptime');
  return {
    disk: {
      total: parts[1] || '?',
      used: parts[2] || '?',
      available: parts[3] || '?',
      percentUsed: parts[4] || '?',
    },
    uptime: uptime.trim(),
  };
}

// ── MAIN ───────────────────────────────────────────────────
function buildDigest() {
  const now = new Date();
  const digest = {
    _meta: {
      observer: 'NOIZY Full Observer v1.0',
      machine: 'GOD (M2 Ultra)',
      timestamp: now.toISOString(),
      epochMs: now.getTime(),
    },
    services: checkServices(),
    ollamaModels: getOllamaModels(),
    gabriel: {
      recentSessions: getRecentSessions(15),
      activeTasks: getActiveTasks(),
      recentMemory: getRecentMemory(10),
      consent: getConsentStatus(),
      estateMembers: getEstateMembers(),
      logs: getGabrielLogs(20),
    },
    voicePipeline: {
      state: getPipelineState(),
      latestTranscripts: getLatestTranscripts(5),
    },
    systemLogs: getSystemLogs(),
    system: getSystemInfo(),
  };

  fs.writeFileSync(DIGEST_PATH, JSON.stringify(digest, null, 2));

  // Summary to stdout
  const svcSummary = Object.entries(digest.services)
    .map(([k, v]) => `${k}:${v.status}`)
    .join(', ');
  console.log(`[Observer] ${now.toISOString()}`);
  console.log(`[Observer] Services: ${svcSummary}`);
  console.log(`[Observer] GABRIEL sessions: ${digest.gabriel.recentSessions.length}, tasks: ${digest.gabriel.activeTasks.length}`);
  console.log(`[Observer] Transcripts: ${digest.voicePipeline.latestTranscripts.length} files`);
  console.log(`[Observer] Disk: ${digest.system.disk.used}/${digest.system.disk.total} (${digest.system.disk.percentUsed})`);
  console.log(`[Observer] Digest → ${DIGEST_PATH}`);

  return digest;
}

buildDigest();
