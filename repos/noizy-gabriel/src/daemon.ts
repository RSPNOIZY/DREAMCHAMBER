/**
 * GABRIEL V3 — Daemon Core
 * The orchestration brain of the NOIZY Empire
 *
 * Runs at localhost:7777 on GOD.local (M2 Ultra)
 * Routes commands between RSP, Claude, Lucy, and all Workers
 * Maintains memcells, learning log, and session state
 *
 * NCP: 75/25 Plowman Standard. Consent is law.
 * Author: Robert Stephen Plowman (RSP_001)
 */

import { serve } from 'bun';
import { Database } from 'bun:sqlite';

// ── Types ────────────────────────────────────────────────────────────────────

interface GabrielConfig {
  port: number;
  dbPath: string;
  model: string;
  voice: string;
  anthropicKey: string;
  heavenUrl: string;
  gorunfree: boolean;
}

interface Memcell {
  id: number;
  cell_type: string;
  cell_key: string;
  cell_value: string;
  priority: number;
  created_at: string;
  updated_at: string;
  mutation_count: number;
  tags: string;
}

interface TaskEntry {
  id: string;
  command: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  result?: string;
  created_at: string;
  completed_at?: string;
}

// ── Configuration ────────────────────────────────────────────────────────────

const config: GabrielConfig = {
  port: 7777,
  dbPath: process.env.GABRIEL_DB_PATH ?? '/Users/m2ultra/NOIZYLAB/gabriel.db',
  model: process.env.GABRIEL_MODEL ?? 'claude-opus-4-6',
  voice: process.env.GABRIEL_VOICE ?? 'Daniel',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  heavenUrl: process.env.HEAVEN_URL ?? 'https://noizy.ai',
  gorunfree: true,
};

// ── Database ─────────────────────────────────────────────────────────────────

const db = new Database(config.dbPath, { create: true });

// Ensure core tables exist
db.run(`CREATE TABLE IF NOT EXISTS memcells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cell_type TEXT NOT NULL,
  cell_key TEXT NOT NULL UNIQUE,
  cell_value TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  mutation_count INTEGER DEFAULT 0,
  tags TEXT DEFAULT ''
)`);

db.run(`CREATE TABLE IF NOT EXISTS learning_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  lesson TEXT NOT NULL,
  source TEXT DEFAULT 'observation',
  confidence REAL DEFAULT 0.8,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  command TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
)`);

db.run(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  turn_count INTEGER DEFAULT 0,
  summary TEXT
)`);

// ── Prepared Statements ──────────────────────────────────────────────────────

const stmts = {
  getMemcell: db.prepare('SELECT * FROM memcells WHERE cell_key = ?'),
  setMemcell: db.prepare(`
    INSERT INTO memcells (cell_type, cell_key, cell_value, priority, tags)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(cell_key) DO UPDATE SET
      cell_value = excluded.cell_value,
      priority = excluded.priority,
      tags = excluded.tags,
      mutation_count = mutation_count + 1,
      updated_at = CURRENT_TIMESTAMP
  `),
  listMemcells: db.prepare('SELECT * FROM memcells ORDER BY priority DESC, updated_at DESC LIMIT ?'),
  searchMemcells: db.prepare('SELECT * FROM memcells WHERE cell_key LIKE ? OR cell_value LIKE ? ORDER BY priority DESC LIMIT 50'),
  countMemcells: db.prepare('SELECT COUNT(*) as count FROM memcells'),
  addLearning: db.prepare('INSERT INTO learning_log (category, lesson, source, confidence) VALUES (?, ?, ?, ?)'),
  countLearnings: db.prepare('SELECT COUNT(*) as count FROM learning_log'),
  createTask: db.prepare('INSERT INTO tasks (id, command, status) VALUES (?, ?, ?)'),
  updateTask: db.prepare('UPDATE tasks SET status = ?, result = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?'),
  listTasks: db.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?'),
};

// ── State ────────────────────────────────────────────────────────────────────

const startTime = Date.now();
let sessionTurns = 0;
const pendingTasks: Map<string, TaskEntry> = new Map();

// ── Route Handlers ───────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function uptimeSeconds(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {

    // ── Health & Status ────────────────────────────────────────────────────

    if (path === '/' || path === '/health') {
      return jsonResponse({
        ok: true,
        daemon: 'GABRIEL',
        version: '3.0.0',
        model: config.model,
        voice: config.voice,
        db: true,
        anthropic: !!config.anthropicKey,
        uptime: uptimeSeconds(),
        ts: new Date().toISOString(),
        gorunfree: config.gorunfree,
      });
    }

    if (path === '/status') {
      const memcellCount = (stmts.countMemcells.get() as { count: number }).count;
      const learningCount = (stmts.countLearnings.get() as { count: number }).count;

      return jsonResponse({
        daemon: 'GABRIEL v3.0 · NOIZY EMPIRE',
        model: config.model,
        voice: config.voice,
        session_turns: sessionTurns,
        pending_tasks: pendingTasks.size,
        memory_cells: memcellCount,
        learning_count: learningCount,
        db_path: config.dbPath,
        uptime_seconds: uptimeSeconds(),
        gorunfree: config.gorunfree,
        heaven_connected: config.heavenUrl,
        hvs_split: '75/25',
      });
    }

    // ── Routes Index ───────────────────────────────────────────────────────

    if (path === '/routes') {
      return jsonResponse({
        routes: [
          'GET  /           — Health check',
          'GET  /health     — Detailed health',
          'GET  /status     — Full status with metrics',
          'GET  /session    — Current session info',
          'POST /command    — Execute a command',
          'POST /speak      — Text-to-speech',
          'POST /brief      — Generate morning brief',
          'GET  /memcell    — List all memcells',
          'GET  /memcell/:key — Get specific memcell',
          'POST /memcell/:key — Set memcell',
          'POST /learn      — Record a learning',
          'POST /task       — Create a task',
          'GET  /tasks      — List tasks',
          'GET  /search?q=  — Search memcells',
          '── VOICE ──',
          'GET  /voice/status — Voice pipeline status',
          'POST /voice/transcribe — Transcribe audio',
        ],
      });
    }

    // ── Session ────────────────────────────────────────────────────────────

    if (path === '/session') {
      return jsonResponse({
        session_turns: sessionTurns,
        uptime: uptimeSeconds(),
        started_at: new Date(startTime).toISOString(),
        model: config.model,
      });
    }

    // ── Command Execution ──────────────────────────────────────────────────

    if (path === '/command' && method === 'POST') {
      const body = await request.json() as { command: string; context?: string };
      if (!body.command) return jsonResponse({ error: 'command required' }, 400);

      sessionTurns++;

      // If Anthropic key is available, route through Claude
      if (config.anthropicKey) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': config.anthropicKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: config.model,
              max_tokens: 4096,
              system: `You are GABRIEL, the orchestration engine of the NOIZY Empire. You serve Robert Stephen Plowman (RSP_001). NCP: 75/25 Plowman Standard. Consent is law. Be concise, precise, and action-oriented.`,
              messages: [{ role: 'user', content: body.command }],
            }),
          });

          const result = await response.json() as { content?: Array<{ text: string }> };
          const text = result.content?.[0]?.text ?? 'No response';

          // Learn from the interaction
          stmts.addLearning.run('command', `Command: ${body.command.substring(0, 100)}`, 'interaction', 0.7);

          return jsonResponse({
            ok: true,
            response: text,
            model: config.model,
            turn: sessionTurns,
          });
        } catch (err) {
          return jsonResponse({
            ok: false,
            error: 'Anthropic API call failed',
            detail: err instanceof Error ? err.message : 'Unknown error',
            fallback: 'GABRIEL is running but cannot reach Claude. Check ANTHROPIC_API_KEY.',
          }, 502);
        }
      }

      return jsonResponse({
        ok: false,
        error: 'No ANTHROPIC_API_KEY configured',
        command: body.command,
        suggestion: 'Set ANTHROPIC_API_KEY in environment to enable AI commands',
      }, 503);
    }

    // ── Memcells ───────────────────────────────────────────────────────────

    if (path === '/memcell' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') ?? '50');
      const cells = stmts.listMemcells.all(limit);
      return jsonResponse({ count: cells.length, cells });
    }

    if (path.startsWith('/memcell/') && method === 'GET') {
      const key = decodeURIComponent(path.replace('/memcell/', ''));
      const cell = stmts.getMemcell.get(key);
      if (!cell) return jsonResponse({ error: 'Memcell not found' }, 404);
      return jsonResponse(cell);
    }

    if (path.startsWith('/memcell/') && method === 'POST') {
      const key = decodeURIComponent(path.replace('/memcell/', ''));
      const body = await request.json() as {
        type?: string;
        value: string;
        priority?: number;
        tags?: string;
      };
      if (!body.value) return jsonResponse({ error: 'value required' }, 400);

      stmts.setMemcell.run(
        body.type ?? 'general',
        key,
        body.value,
        body.priority ?? 5,
        body.tags ?? '',
      );

      return jsonResponse({ ok: true, key, stored: true });
    }

    // ── Search ─────────────────────────────────────────────────────────────

    if (path === '/search' && method === 'GET') {
      const q = url.searchParams.get('q');
      if (!q) return jsonResponse({ error: 'q parameter required' }, 400);

      const pattern = `%${q}%`;
      const results = stmts.searchMemcells.all(pattern, pattern);
      return jsonResponse({ query: q, count: results.length, results });
    }

    // ── Learning ───────────────────────────────────────────────────────────

    if (path === '/learn' && method === 'POST') {
      const body = await request.json() as {
        category: string;
        lesson: string;
        source?: string;
        confidence?: number;
      };
      if (!body.category || !body.lesson) {
        return jsonResponse({ error: 'category and lesson required' }, 400);
      }

      stmts.addLearning.run(
        body.category,
        body.lesson,
        body.source ?? 'manual',
        body.confidence ?? 0.8,
      );

      const count = (stmts.countLearnings.get() as { count: number }).count;
      return jsonResponse({ ok: true, learning_count: count });
    }

    // ── Tasks ──────────────────────────────────────────────────────────────

    if (path === '/task' && method === 'POST') {
      const body = await request.json() as { command: string };
      if (!body.command) return jsonResponse({ error: 'command required' }, 400);

      const id = crypto.randomUUID();
      stmts.createTask.run(id, body.command, 'pending');
      pendingTasks.set(id, {
        id,
        command: body.command,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      return jsonResponse({ ok: true, task_id: id, status: 'pending' });
    }

    if (path === '/tasks' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') ?? '20');
      const tasks = stmts.listTasks.all(limit);
      return jsonResponse({ count: tasks.length, tasks });
    }

    // ── Morning Brief ──────────────────────────────────────────────────────

    if (path === '/brief' && method === 'POST') {
      const memcellCount = (stmts.countMemcells.get() as { count: number }).count;
      const learningCount = (stmts.countLearnings.get() as { count: number }).count;

      const brief = {
        date: new Date().toISOString().split('T')[0],
        greeting: `Good morning, Robert. GABRIEL V3 online. ${memcellCount} memcells active, ${learningCount} learnings accumulated.`,
        system_status: {
          gabriel: 'ONLINE',
          heaven: config.heavenUrl,
          model: config.model,
          uptime_hours: Math.floor(uptimeSeconds() / 3600),
        },
        priorities: [
          'Review overnight memcell updates',
          'Check HEAVEN Worker deployment status',
          'Review pending tasks',
        ],
        hvs: '75/25 — The Plowman Standard holds.',
        sign_off: 'GORUNFREE. The empire stands.',
      };

      return jsonResponse(brief);
    }

    // ── Voice Pipeline Status ──────────────────────────────────────────────

    if (path === '/voice/status' && method === 'GET') {
      return jsonResponse({
        pipeline: 'ready',
        tts_engine: 'macOS say',
        voice: config.voice,
        stt_engine: 'whisper (pending)',
        xtts_v2: 'cleared',
        consent_required: true,
      });
    }

    // ── TTS (Text to Speech via macOS say) ─────────────────────────────────

    if (path === '/speak' && method === 'POST') {
      const body = await request.json() as { text: string; voice?: string };
      if (!body.text) return jsonResponse({ error: 'text required' }, 400);

      const voice = body.voice ?? config.voice;

      try {
        const proc = Bun.spawn(['say', '-v', voice, body.text]);
        await proc.exited;

        return jsonResponse({
          ok: true,
          spoke: body.text.substring(0, 100),
          voice,
        });
      } catch (err) {
        return jsonResponse({
          error: 'TTS failed',
          detail: err instanceof Error ? err.message : 'Unknown',
        }, 500);
      }
    }

    // ── 404 ────────────────────────────────────────────────────────────────

    return jsonResponse({
      error: 'not found',
      available: 'GET /routes for all endpoints',
    }, 404);

  } catch (err) {
    return jsonResponse({
      error: 'Internal server error',
      detail: err instanceof Error ? err.message : 'Unknown',
    }, 500);
  }
}

// ── Server ───────────────────────────────────────────────────────────────────

console.log(`
╔═══════════════════════════════════════════════════╗
║  GABRIEL V3 — NOIZY Empire Orchestration Engine   ║
║  Port: ${config.port}                                    ║
║  Model: ${config.model.padEnd(38)}║
║  Voice: ${config.voice.padEnd(38)}║
║  DB: ${config.dbPath.substring(0, 41).padEnd(41)}║
║  HVS: 75/25 Plowman Standard                     ║
║  GORUNFREE                                        ║
╚═══════════════════════════════════════════════════╝
`);

serve({
  port: config.port,
  fetch: handleRequest,
});
