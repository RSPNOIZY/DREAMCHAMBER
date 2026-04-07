/**
 * NOIZYSTREAM v2 — Signaling Router
 * Routes HTTP/WebSocket requests to SignalingRoom Durable Objects
 *
 * All routes are prefixed with /stream/
 * Gabriel logs every room creation. NCP: 75/25.
 *
 * Author: Robert Stephen Plowman (RSP_001)
 */

interface Env {
  DB_MEMORY: D1Database;
  SIGNALING_ROOMS: DurableObjectNamespace;
  NOIZY_KEY: string;
}

// ── CORS ─────────────────────────────────────────────────────────────────────

const STREAM_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Noizy-Key, Upgrade',
  'Access-Control-Max-Age': '86400',
};

function cors(): Response {
  return new Response(null, { headers: STREAM_CORS });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...STREAM_CORS },
  });
}

// ── Auth ─────────────────────────────────────────────────────────────────────

function authenticated(request: Request, env: Env): boolean {
  const key = request.headers.get('X-Noizy-Key');
  return !!key && key === env.NOIZY_KEY;
}

// ── Router ───────────────────────────────────────────────────────────────────

export async function handleStreamRoute(
  request: Request,
  env: Env,
  path: string,
): Promise<Response | null> {

  if (request.method === 'OPTIONS') return cors();

  // ── POST /stream/room — Create a new room ──────────────────────────────
  if (path === '/stream/room' && request.method === 'POST') {
    if (!authenticated(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json() as { roomId?: string; title: string; hostId: string };
    const roomId = body.roomId ?? crypto.randomUUID();

    // Get or create the Durable Object for this room
    const doId = env.SIGNALING_ROOMS.idFromName(roomId);
    const stub = env.SIGNALING_ROOMS.get(doId);

    // Forward the create request to the Durable Object
    const doUrl = new URL('https://internal/create');
    const doRequest = new Request(doUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, roomId }),
    });

    const response = await stub.fetch(doRequest);
    const result = await response.json();

    // Log to Gabriel
    try {
      await env.DB_MEMORY.prepare(
        `INSERT INTO gabriel_log (id, event_type, actor_id, target_id, payload, logged_at)
         VALUES (?, 'STREAM_ROOM_CREATED', ?, ?, ?, datetime('now'))`
      ).bind(
        crypto.randomUUID(),
        body.hostId,
        roomId,
        JSON.stringify({ title: body.title, roomId }),
      ).run();
    } catch {
      // Don't block room creation on logging failure
    }

    return json({ ok: true, roomId, ...result as object });
  }

  // ── GET /stream/room/:roomId — Room info ───────────────────────────────
  const roomInfoMatch = path.match(/^\/stream\/room\/([a-zA-Z0-9-]+)$/);
  if (roomInfoMatch && request.method === 'GET') {
    const roomId = roomInfoMatch[1];
    const doId = env.SIGNALING_ROOMS.idFromName(roomId);
    const stub = env.SIGNALING_ROOMS.get(doId);

    const doUrl = new URL('https://internal/info');
    return stub.fetch(new Request(doUrl.toString()));
  }

  // ── GET /stream/room/:roomId/metadata — Export metadata events ─────────
  const metadataMatch = path.match(/^\/stream\/room\/([a-zA-Z0-9-]+)\/metadata$/);
  if (metadataMatch && request.method === 'GET') {
    if (!authenticated(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const roomId = metadataMatch[1];
    const doId = env.SIGNALING_ROOMS.idFromName(roomId);
    const stub = env.SIGNALING_ROOMS.get(doId);

    const doUrl = new URL('https://internal/metadata');
    return stub.fetch(new Request(doUrl.toString()));
  }

  // ── GET /stream/room/:roomId/highlights — AI-generated highlights ──────
  const highlightsMatch = path.match(/^\/stream\/room\/([a-zA-Z0-9-]+)\/highlights$/);
  if (highlightsMatch && request.method === 'GET') {
    if (!authenticated(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const roomId = highlightsMatch[1];

    // Query D1 for metadata events, compute highlights
    const events = await env.DB_MEMORY.prepare(
      `SELECT * FROM stream_metadata_events
       WHERE room_id = ?
       ORDER BY timestamp ASC`
    ).bind(roomId).all();

    // Compute intelligent highlights
    const highlights = computeHighlights(events.results as MetadataRow[]);

    return json({ roomId, highlights, totalEvents: events.results.length });
  }

  // ── WebSocket /stream/ws/:roomId — Signaling connection ────────────────
  const wsMatch = path.match(/^\/stream\/ws\/([a-zA-Z0-9-]+)$/);
  if (wsMatch) {
    const roomId = wsMatch[1];
    const doId = env.SIGNALING_ROOMS.idFromName(roomId);
    const stub = env.SIGNALING_ROOMS.get(doId);

    // Forward the WebSocket upgrade request to the Durable Object
    const url = new URL(request.url);
    const doUrl = new URL(`https://internal/ws?${url.searchParams.toString()}`);
    return stub.fetch(new Request(doUrl.toString(), {
      headers: request.headers,
    }));
  }

  // ── GET /stream/rooms — List active rooms ──────────────────────────────
  if (path === '/stream/rooms' && request.method === 'GET') {
    if (!authenticated(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const rooms = await env.DB_MEMORY.prepare(
      `SELECT * FROM stream_rooms
       WHERE state != 'ended'
       ORDER BY created_at DESC
       LIMIT 50`
    ).all();

    return json({ rooms: rooms.results });
  }

  // No match
  return null;
}

// ── Highlight Computation ────────────────────────────────────────────────────

interface MetadataRow {
  id: string;
  room_id: string;
  participant_id: string;
  event_type: string;
  timestamp: string;
  duration_ms: number | null;
  data: string;
}

interface Highlight {
  timestamp: string;
  type: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  participantId: string;
}

function computeHighlights(events: MetadataRow[]): Highlight[] {
  const highlights: Highlight[] = [];

  for (const event of events) {
    const data = JSON.parse(event.data || '{}');

    switch (event.event_type) {
      case 'contributor-promoted':
        highlights.push({
          timestamp: event.timestamp,
          type: 'guest-live',
          description: `${data.displayName ?? 'Contributor'} went live`,
          importance: 'high',
          participantId: event.participant_id,
        });
        break;

      case 'highlight-marker':
        highlights.push({
          timestamp: event.timestamp,
          type: 'manual-highlight',
          description: data.note ?? 'Host marked highlight',
          importance: 'high',
          participantId: event.participant_id,
        });
        break;

      case 'screen-share-start':
        highlights.push({
          timestamp: event.timestamp,
          type: 'screen-share',
          description: `${data.displayName ?? 'Participant'} started screen share`,
          importance: 'medium',
          participantId: event.participant_id,
        });
        break;

      case 'consent-granted':
        highlights.push({
          timestamp: event.timestamp,
          type: 'consent',
          description: `${data.displayName ?? 'Participant'} granted NCP consent`,
          importance: 'medium',
          participantId: event.participant_id,
        });
        break;

      case 'quality-drop':
        highlights.push({
          timestamp: event.timestamp,
          type: 'quality-issue',
          description: `Connection quality dropped`,
          importance: 'low',
          participantId: event.participant_id,
        });
        break;

      case 'room-state-change':
        if (data.state === 'live') {
          highlights.push({
            timestamp: event.timestamp,
            type: 'stream-start',
            description: 'Stream went live',
            importance: 'high',
            participantId: event.participant_id,
          });
        }
        break;
    }
  }

  return highlights.sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });
}
