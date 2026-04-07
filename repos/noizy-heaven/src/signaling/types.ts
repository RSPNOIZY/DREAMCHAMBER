/**
 * NOIZYSTREAM v2 — WebRTC Signaling Types
 * Constitutional real-time infrastructure for NOIZY.AI
 *
 * Every connection answers: "Who owns this stream?"
 * NCP: 75/25 Plowman Standard. Consent is law.
 *
 * Author: Robert Stephen Plowman (RSP_001)
 */

// ── Participant Roles ────────────────────────────────────────────────────────

export type ParticipantRole = 'host' | 'contributor' | 'viewer' | 'moderator';
export type ParticipantState = 'green_room' | 'live' | 'muted' | 'disconnected' | 'kicked';
export type RoomState = 'waiting' | 'live' | 'recording' | 'paused' | 'ended';

// ── Signaling Messages ───────────────────────────────────────────────────────

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  senderId: string;
  targetId?: string;          // null = broadcast
  payload: unknown;
  timestamp: number;
  ncp_consent: boolean;       // NCP: explicit consent flag on every message
}

export type SignalingMessageType =
  | 'join'                    // Request to join room
  | 'leave'                   // Disconnect
  | 'offer'                   // SDP offer
  | 'answer'                  // SDP answer
  | 'ice-candidate'           // ICE candidate exchange
  | 'green-room-enter'        // Contributor enters staging
  | 'green-room-promote'      // Host pulls contributor live
  | 'green-room-demote'       // Host sends contributor back to staging
  | 'mute'                    // Mute participant
  | 'unmute'                  // Unmute participant
  | 'screen-share-start'      // Screen share initiated
  | 'screen-share-stop'       // Screen share ended
  | 'metadata-event'          // Timestamped event injection
  | 'room-state-sync'         // Full room state broadcast
  | 'heartbeat'               // Connection keepalive
  | 'error';                  // Error response

// ── Room ─────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  title: string;
  hostId: string;
  state: RoomState;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  maxParticipants: number;
  recording: boolean;
  consentRequired: boolean;   // NCP: must consent before going live
  hvsSplit: string;           // Always "75/25"
  metadata: RoomMetadata;
}

export interface RoomMetadata {
  brand: string;              // Which NOIZY brand (NOIZYFISH, NOIZYLAB, etc.)
  streamType: string;         // 'live-session', 'podcast', 'interview', 'collab'
  tags: string[];
  description: string;
}

// ── Participant ──────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  displayName: string;
  role: ParticipantRole;
  state: ParticipantState;
  joinedAt: number;
  consentGiven: boolean;      // NCP: explicit consent
  consentTimestamp: number | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  lastHeartbeat: number;
}

// ── Metadata Events (for session recording intelligence) ─────────────────────

export interface MetadataEvent {
  id: string;
  roomId: string;
  participantId: string;
  eventType: MetadataEventType;
  timestamp: number;
  duration?: number;          // For events with duration (speaking, screen share)
  data: Record<string, unknown>;
}

export type MetadataEventType =
  | 'speaking-start'
  | 'speaking-stop'
  | 'screen-share-start'
  | 'screen-share-stop'
  | 'contributor-promoted'
  | 'contributor-demoted'
  | 'participant-joined'
  | 'participant-left'
  | 'room-state-change'
  | 'consent-granted'
  | 'consent-revoked'
  | 'highlight-marker'        // Manual highlight by host
  | 'quality-drop'
  | 'reconnect';

// ── D1 Row Types ─────────────────────────────────────────────────────────────

export interface D1RoomRow {
  id: string;
  title: string;
  host_id: string;
  state: RoomState;
  brand: string;
  stream_type: string;
  tags: string;               // JSON array
  description: string;
  max_participants: number;
  recording: boolean;
  consent_required: boolean;
  hvs_split: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface D1ParticipantRow {
  id: string;
  room_id: string;
  display_name: string;
  role: ParticipantRole;
  state: ParticipantState;
  consent_given: boolean;
  consent_timestamp: string | null;
  joined_at: string;
  left_at: string | null;
}

export interface D1MetadataEventRow {
  id: string;
  room_id: string;
  participant_id: string;
  event_type: MetadataEventType;
  timestamp: string;
  duration_ms: number | null;
  data: string;               // JSON
}
