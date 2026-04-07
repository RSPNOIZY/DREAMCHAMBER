/**
 * NOIZYSTREAM v2 — Durable Object: SignalingRoom
 * Edge-native WebRTC signaling with room state management
 *
 * Each room is a Durable Object instance — globally unique, strongly consistent,
 * colocated with the host for minimum latency. WebSocket connections are
 * multiplexed through this single coordination point.
 *
 * Gabriel watches every transition. NCP: 75/25.
 *
 * Author: Robert Stephen Plowman (RSP_001)
 */

import type {
  SignalingMessage,
  SignalingMessageType,
  Participant,
  ParticipantRole,
  ParticipantState,
  Room,
  RoomState,
  MetadataEvent,
  MetadataEventType,
} from './types';

// ── Durable Object: SignalingRoom ────────────────────────────────────────────

export class SignalingRoom implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  // In-memory room state (rebuilt from storage on wake)
  private room: Room | null = null;
  private participants: Map<string, Participant> = new Map();
  private connections: Map<string, WebSocket> = new Map();  // participantId → WebSocket
  private metadataBuffer: MetadataEvent[] = [];
  private heartbeatInterval: number | null = null;

  // Constants
  private static readonly HEARTBEAT_INTERVAL_MS = 10_000;
  private static readonly HEARTBEAT_TIMEOUT_MS = 30_000;
  private static readonly MAX_METADATA_BUFFER = 100;
  private static readonly HVS_SPLIT = '75/25';

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    // Restore room state from durable storage on wake
    this.state.blockConcurrencyWhile(async () => {
      this.room = await this.state.storage.get<Room>('room') ?? null;
      const savedParticipants = await this.state.storage.get<[string, Participant][]>('participants');
      if (savedParticipants) {
        this.participants = new Map(savedParticipants);
      }
    });
  }

  // ── WebSocket Handler ──────────────────────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // REST endpoint: create/configure room
    if (url.pathname === '/create' && request.method === 'POST') {
      return this.handleCreateRoom(request);
    }

    // REST endpoint: room info
    if (url.pathname === '/info' && request.method === 'GET') {
      return this.handleRoomInfo();
    }

    // REST endpoint: metadata export
    if (url.pathname === '/metadata' && request.method === 'GET') {
      return this.handleMetadataExport();
    }

    // WebSocket upgrade: the signaling plane
    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  // ── Room Lifecycle ─────────────────────────────────────────────────────────

  private async handleCreateRoom(request: Request): Promise<Response> {
    const body = await request.json() as {
      title: string;
      hostId: string;
      brand?: string;
      streamType?: string;
      tags?: string[];
      description?: string;
      maxParticipants?: number;
      recording?: boolean;
    };

    if (!body.title || !body.hostId) {
      return this.jsonResponse({ error: 'title and hostId required' }, 400);
    }

    const now = Date.now();
    this.room = {
      id: this.state.id.toString(),
      title: body.title,
      hostId: body.hostId,
      state: 'waiting',
      createdAt: now,
      startedAt: null,
      endedAt: null,
      maxParticipants: body.maxParticipants ?? 10,
      recording: body.recording ?? true,
      consentRequired: true,  // NCP: always
      hvsSplit: SignalingRoom.HVS_SPLIT,
      metadata: {
        brand: body.brand ?? 'NOIZY.AI',
        streamType: body.streamType ?? 'live-session',
        tags: body.tags ?? [],
        description: body.description ?? '',
      },
    };

    await this.persistRoomState();
    this.emitMetadataEvent(body.hostId, 'room-state-change', { state: 'waiting', action: 'created' });

    return this.jsonResponse({ ok: true, room: this.room });
  }

  private handleRoomInfo(): Response {
    if (!this.room) {
      return this.jsonResponse({ error: 'Room not initialized' }, 404);
    }
    return this.jsonResponse({
      room: this.room,
      participants: Array.from(this.participants.values()),
      connectionCount: this.connections.size,
    });
  }

  private handleMetadataExport(): Response {
    return this.jsonResponse({
      roomId: this.room?.id,
      events: this.metadataBuffer,
      count: this.metadataBuffer.length,
    });
  }

  // ── WebSocket Connection ───────────────────────────────────────────────────

  private async handleWebSocket(request: Request): Promise<Response> {
    if (!this.room) {
      return this.jsonResponse({ error: 'Room not initialized. Create room first.' }, 400);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId');
    const displayName = url.searchParams.get('displayName') ?? 'Anonymous';
    const role = (url.searchParams.get('role') ?? 'viewer') as ParticipantRole;

    if (!participantId) {
      return this.jsonResponse({ error: 'participantId required' }, 400);
    }

    // Enforce max participants
    if (this.participants.size >= this.room.maxParticipants && !this.participants.has(participantId)) {
      return this.jsonResponse({ error: 'Room is full' }, 403);
    }

    this.state.acceptWebSocket(server);

    const now = Date.now();
    const isHost = participantId === this.room.hostId;

    // Create or update participant
    const participant: Participant = {
      id: participantId,
      displayName,
      role: isHost ? 'host' : role,
      state: role === 'contributor' ? 'green_room' : (isHost ? 'live' : 'disconnected'),
      joinedAt: now,
      consentGiven: false,
      consentTimestamp: null,
      audioEnabled: false,
      videoEnabled: false,
      screenSharing: false,
      connectionQuality: 'unknown',
      lastHeartbeat: now,
    };

    this.participants.set(participantId, participant);
    this.connections.set(participantId, server);

    // Attach participant ID to WebSocket for message routing
    server.serializeAttachment({ participantId });

    // Send room state sync to the new connection
    this.sendTo(participantId, {
      type: 'room-state-sync',
      roomId: this.room.id,
      senderId: 'system',
      payload: {
        room: this.room,
        participants: Array.from(this.participants.values()),
        you: participant,
      },
      timestamp: now,
      ncp_consent: true,
    });

    // Broadcast join to everyone else
    this.broadcast({
      type: 'join',
      roomId: this.room.id,
      senderId: participantId,
      payload: { participant },
      timestamp: now,
      ncp_consent: true,
    }, participantId);

    this.emitMetadataEvent(participantId, 'participant-joined', {
      displayName,
      role: participant.role,
      state: participant.state,
    });

    await this.persistRoomState();

    // Start heartbeat checker if not running
    if (!this.heartbeatInterval) {
      this.startHeartbeatChecker();
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  // ── WebSocket Message Handler (Durable Object API) ─────────────────────────

  async webSocketMessage(ws: WebSocket, rawMessage: string | ArrayBuffer): Promise<void> {
    if (typeof rawMessage !== 'string') return;

    let msg: SignalingMessage;
    try {
      msg = JSON.parse(rawMessage) as SignalingMessage;
    } catch {
      this.sendError(ws, 'Invalid JSON');
      return;
    }

    const attachment = ws.deserializeAttachment() as { participantId: string } | null;
    if (!attachment?.participantId) {
      this.sendError(ws, 'No participant identity');
      return;
    }

    const senderId = attachment.participantId;
    const participant = this.participants.get(senderId);
    if (!participant) {
      this.sendError(ws, 'Unknown participant');
      return;
    }

    // Update heartbeat
    participant.lastHeartbeat = Date.now();

    switch (msg.type) {

      // ── SDP Negotiation ──────────────────────────────────────────────────
      case 'offer':
      case 'answer':
      case 'ice-candidate': {
        if (!msg.targetId) {
          this.sendError(ws, `${msg.type} requires targetId`);
          return;
        }
        // Forward directly to target — peer-to-peer signaling
        this.sendTo(msg.targetId, {
          ...msg,
          senderId,
          timestamp: Date.now(),
        });
        break;
      }

      // ── Green Room: Host Controls ────────────────────────────────────────
      case 'green-room-promote': {
        if (!this.isHost(senderId)) {
          this.sendError(ws, 'Only the host can promote contributors');
          return;
        }
        const targetId = msg.targetId;
        if (!targetId) {
          this.sendError(ws, 'targetId required');
          return;
        }
        const target = this.participants.get(targetId);
        if (!target) {
          this.sendError(ws, 'Target participant not found');
          return;
        }

        // NCP: consent check before going live
        if (this.room?.consentRequired && !target.consentGiven) {
          this.sendError(ws, 'Contributor has not given NCP consent. Cannot promote.');
          return;
        }

        target.state = 'live';
        target.audioEnabled = true;
        target.videoEnabled = true;
        this.participants.set(targetId, target);

        // Notify the promoted contributor
        this.sendTo(targetId, {
          type: 'green-room-promote',
          roomId: this.room!.id,
          senderId,
          targetId,
          payload: { message: 'You are now LIVE', participant: target },
          timestamp: Date.now(),
          ncp_consent: true,
        });

        // Broadcast state change
        this.broadcastRoomState();
        this.emitMetadataEvent(targetId, 'contributor-promoted', {
          promotedBy: senderId,
          displayName: target.displayName,
        });

        // If room was waiting, transition to live
        if (this.room && this.room.state === 'waiting') {
          this.room.state = 'live';
          this.room.startedAt = Date.now();
          await this.persistRoomState();
          this.emitMetadataEvent(senderId, 'room-state-change', { state: 'live' });
        }

        await this.persistRoomState();
        break;
      }

      case 'green-room-demote': {
        if (!this.isHost(senderId)) {
          this.sendError(ws, 'Only the host can demote contributors');
          return;
        }
        const demoteTarget = msg.targetId ? this.participants.get(msg.targetId) : null;
        if (!demoteTarget || !msg.targetId) {
          this.sendError(ws, 'Target participant not found');
          return;
        }

        demoteTarget.state = 'green_room';
        demoteTarget.audioEnabled = false;
        demoteTarget.videoEnabled = false;
        this.participants.set(msg.targetId, demoteTarget);

        this.sendTo(msg.targetId, {
          type: 'green-room-demote',
          roomId: this.room!.id,
          senderId,
          targetId: msg.targetId,
          payload: { message: 'Moved to Green Room' },
          timestamp: Date.now(),
          ncp_consent: true,
        });

        this.broadcastRoomState();
        this.emitMetadataEvent(msg.targetId, 'contributor-demoted', {
          demotedBy: senderId,
          displayName: demoteTarget.displayName,
        });
        await this.persistRoomState();
        break;
      }

      // ── Consent (NCP) ────────────────────────────────────────────────────
      case 'metadata-event': {
        const eventData = msg.payload as { eventType?: string; consentGiven?: boolean };

        // Handle consent grant via metadata event
        if (eventData.consentGiven !== undefined) {
          participant.consentGiven = eventData.consentGiven;
          participant.consentTimestamp = eventData.consentGiven ? Date.now() : null;
          this.participants.set(senderId, participant);

          this.emitMetadataEvent(senderId,
            eventData.consentGiven ? 'consent-granted' : 'consent-revoked',
            { displayName: participant.displayName }
          );

          // Notify host
          if (this.room) {
            this.sendTo(this.room.hostId, {
              type: 'metadata-event',
              roomId: this.room.id,
              senderId,
              payload: {
                eventType: eventData.consentGiven ? 'consent-granted' : 'consent-revoked',
                participant: { id: senderId, displayName: participant.displayName },
              },
              timestamp: Date.now(),
              ncp_consent: true,
            });
          }
          await this.persistRoomState();
          break;
        }

        // Generic metadata event (speaking, highlight, etc.)
        const metaType = eventData.eventType as MetadataEventType | undefined;
        if (metaType) {
          this.emitMetadataEvent(senderId, metaType, msg.payload as Record<string, unknown>);
        }
        break;
      }

      // ── Mute/Unmute ──────────────────────────────────────────────────────
      case 'mute':
      case 'unmute': {
        const muteTargetId = msg.targetId ?? senderId;
        // Only host can mute others, anyone can mute themselves
        if (muteTargetId !== senderId && !this.isHost(senderId)) {
          this.sendError(ws, 'Only the host can mute other participants');
          return;
        }
        const muteTarget = this.participants.get(muteTargetId);
        if (muteTarget) {
          muteTarget.audioEnabled = msg.type === 'unmute';
          this.participants.set(muteTargetId, muteTarget);
          this.broadcastRoomState();
          await this.persistRoomState();
        }
        break;
      }

      // ── Screen Share ─────────────────────────────────────────────────────
      case 'screen-share-start':
      case 'screen-share-stop': {
        participant.screenSharing = msg.type === 'screen-share-start';
        this.participants.set(senderId, participant);
        this.broadcastRoomState();
        this.emitMetadataEvent(senderId,
          msg.type === 'screen-share-start' ? 'screen-share-start' : 'screen-share-stop',
          { displayName: participant.displayName }
        );
        await this.persistRoomState();
        break;
      }

      // ── Heartbeat ────────────────────────────────────────────────────────
      case 'heartbeat': {
        participant.lastHeartbeat = Date.now();
        const quality = msg.payload as { connectionQuality?: string } | undefined;
        if (quality?.connectionQuality) {
          participant.connectionQuality = quality.connectionQuality as Participant['connectionQuality'];
        }
        this.participants.set(senderId, participant);
        // Respond with ack
        this.sendTo(senderId, {
          type: 'heartbeat',
          roomId: this.room?.id ?? '',
          senderId: 'system',
          payload: { ack: true, serverTime: Date.now() },
          timestamp: Date.now(),
          ncp_consent: true,
        });
        break;
      }

      // ── Leave ────────────────────────────────────────────────────────────
      case 'leave': {
        await this.removeParticipant(senderId);
        break;
      }

      default: {
        this.sendError(ws, `Unknown message type: ${msg.type}`);
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    const attachment = ws.deserializeAttachment() as { participantId: string } | null;
    if (attachment?.participantId) {
      await this.removeParticipant(attachment.participantId);
    }
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    const attachment = ws.deserializeAttachment() as { participantId: string } | null;
    if (attachment?.participantId) {
      const participant = this.participants.get(attachment.participantId);
      if (participant) {
        this.emitMetadataEvent(attachment.participantId, 'quality-drop', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  // ── Internal Helpers ───────────────────────────────────────────────────────

  private isHost(participantId: string): boolean {
    return this.room?.hostId === participantId;
  }

  private sendTo(participantId: string, message: SignalingMessage): void {
    const ws = this.connections.get(participantId);
    if (ws) {
      try {
        ws.send(JSON.stringify(message));
      } catch {
        // Connection dead — will be cleaned up by heartbeat
        this.connections.delete(participantId);
      }
    }
  }

  private broadcast(message: SignalingMessage, excludeId?: string): void {
    for (const [id, ws] of this.connections) {
      if (id !== excludeId) {
        try {
          ws.send(JSON.stringify(message));
        } catch {
          this.connections.delete(id);
        }
      }
    }
  }

  private broadcastRoomState(): void {
    if (!this.room) return;
    this.broadcast({
      type: 'room-state-sync',
      roomId: this.room.id,
      senderId: 'system',
      payload: {
        room: this.room,
        participants: Array.from(this.participants.values()),
      },
      timestamp: Date.now(),
      ncp_consent: true,
    });
  }

  private sendError(ws: WebSocket, message: string): void {
    try {
      ws.send(JSON.stringify({
        type: 'error',
        roomId: this.room?.id ?? '',
        senderId: 'system',
        payload: { error: message },
        timestamp: Date.now(),
        ncp_consent: true,
      }));
    } catch {
      // Connection already dead
    }
  }

  private async removeParticipant(participantId: string): Promise<void> {
    const participant = this.participants.get(participantId);
    if (!participant) return;

    participant.state = 'disconnected';
    this.connections.delete(participantId);
    this.participants.delete(participantId);

    this.broadcast({
      type: 'leave',
      roomId: this.room?.id ?? '',
      senderId: participantId,
      payload: { displayName: participant.displayName },
      timestamp: Date.now(),
      ncp_consent: true,
    });

    this.emitMetadataEvent(participantId, 'participant-left', {
      displayName: participant.displayName,
      role: participant.role,
      duration: Date.now() - participant.joinedAt,
    });

    // If host leaves, end the room
    if (this.isHost(participantId) && this.room) {
      this.room.state = 'ended';
      this.room.endedAt = Date.now();
      this.broadcastRoomState();
      this.emitMetadataEvent(participantId, 'room-state-change', { state: 'ended' });
      await this.flushMetadata();
    }

    // If no one left, clean up
    if (this.participants.size === 0 && this.room) {
      this.room.state = 'ended';
      this.room.endedAt = this.room.endedAt ?? Date.now();
      await this.flushMetadata();
    }

    await this.persistRoomState();
  }

  // ── Metadata Intelligence ──────────────────────────────────────────────────

  private emitMetadataEvent(
    participantId: string,
    eventType: MetadataEventType,
    data: Record<string, unknown>
  ): void {
    const event: MetadataEvent = {
      id: crypto.randomUUID(),
      roomId: this.room?.id ?? '',
      participantId,
      eventType,
      timestamp: Date.now(),
      data,
    };

    this.metadataBuffer.push(event);

    // Auto-flush when buffer is full
    if (this.metadataBuffer.length >= SignalingRoom.MAX_METADATA_BUFFER) {
      this.flushMetadata().catch(() => {});
    }
  }

  private async flushMetadata(): Promise<void> {
    if (this.metadataBuffer.length === 0) return;

    const events = [...this.metadataBuffer];
    this.metadataBuffer = [];

    // Persist to D1 asynchronously via waitUntil
    try {
      const db = this.env.DB_MEMORY;
      const batch = events.map(e =>
        db.prepare(
          `INSERT INTO stream_metadata_events (id, room_id, participant_id, event_type, timestamp, duration_ms, data)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          e.id,
          e.roomId,
          e.participantId,
          e.eventType,
          new Date(e.timestamp).toISOString(),
          e.duration ?? null,
          JSON.stringify(e.data),
        )
      );
      await db.batch(batch);
    } catch {
      // Re-add events that failed to flush
      this.metadataBuffer.unshift(...events);
    }
  }

  // ── Heartbeat Checker ──────────────────────────────────────────────────────

  private startHeartbeatChecker(): void {
    this.state.storage.setAlarm(Date.now() + SignalingRoom.HEARTBEAT_INTERVAL_MS);
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    const stale: string[] = [];

    for (const [id, participant] of this.participants) {
      if (now - participant.lastHeartbeat > SignalingRoom.HEARTBEAT_TIMEOUT_MS) {
        stale.push(id);
      }
    }

    for (const id of stale) {
      await this.removeParticipant(id);
    }

    // Continue heartbeat checking if room is still active
    if (this.participants.size > 0 && this.room?.state !== 'ended') {
      this.state.storage.setAlarm(Date.now() + SignalingRoom.HEARTBEAT_INTERVAL_MS);
    } else {
      // Flush remaining metadata on room end
      await this.flushMetadata();
    }
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  private async persistRoomState(): Promise<void> {
    if (this.room) {
      await this.state.storage.put('room', this.room);
    }
    await this.state.storage.put('participants', Array.from(this.participants.entries()));
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  private jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// ── Env Interface Extension ──────────────────────────────────────────────────

interface Env {
  DB_MEMORY: D1Database;
  SIGNALING_ROOMS: DurableObjectNamespace;
}
