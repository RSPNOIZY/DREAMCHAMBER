import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CharacterProfile, Emotion } from './CharacterManager';

export interface Take {
  id: string;                   // unique: "{characterId}-{timestamp}"
  characterId: string;
  sessionId: string;
  wavPath: string;              // absolute path to WAV file
  transcript: string;           // Whisper transcription
  emotion: Emotion;             // tagged by user or Claude
  claudeScore: TakeScore | null;
  approved: boolean;
  vaultExported: boolean;
  recordedAt: string;           // ISO timestamp
  durationMs: number;
  scriptLine: string;           // what line was being performed
}

export interface TakeScore {
  overall: number;              // 0-100
  characterConsistency: number; // how well it matches the character DNA
  emotionalAccuracy: number;    // how well it hits the target emotion
  technicalQuality: number;     // silence, clipping, noise
  notes: string;                // Claude's qualitative notes
  recommendation: 'approve' | 'retry' | 'discard';
  scoredAt: string;
}

export interface Session {
  id: string;
  characterId: string;
  startedAt: string;
  endedAt: string | null;
  scriptContext: string;        // what scene/script is being performed
  takes: Take[];
}

export class TakeManager {
  private takesRoot: string;
  private sessions: Map<string, Session> = new Map();
  private currentSession: Session | null = null;

  constructor(workspaceRoot: string) {
    this.takesRoot = path.join(workspaceRoot, '.dreamchamber', 'takes');
    this.ensureDir(this.takesRoot);
    this.loadSessions();
  }

  // ─── Sessions ───────────────────────────────────────────────────────────────

  startSession(characterId: string, scriptContext = ''): Session {
    const id = `${characterId}-${Date.now()}`;
    const session: Session = {
      id,
      characterId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      scriptContext,
      takes: [],
    };

    this.sessions.set(id, session);
    this.currentSession = session;
    this.saveSession(session);
    return session;
  }

  endSession(sessionId?: string): Session | null {
    const session = sessionId
      ? this.sessions.get(sessionId)
      : this.currentSession;

    if (!session) { return null; }

    session.endedAt = new Date().toISOString();
    this.saveSession(session);

    if (this.currentSession?.id === session.id) {
      this.currentSession = null;
    }

    return session;
  }

  getCurrentSession(): Session | null { return this.currentSession; }

  // ─── Takes ──────────────────────────────────────────────────────────────────

  /**
   * Register a completed WAV recording as a take.
   * Call after AudioCapture.stop() returns a wavPath.
   */
  addTake(
    wavPath: string,
    transcript: string,
    emotion: Emotion,
    scriptLine: string,
    durationMs: number,
    session?: Session
  ): Take {
    const activeSession = session ?? this.currentSession;
    if (!activeSession) {
      throw new Error('No active session — call startSession() first');
    }

    // Copy WAV to permanent takes directory
    const destDir = path.join(
      this.takesRoot,
      activeSession.characterId,
      activeSession.id
    );
    this.ensureDir(destDir);

    const takeId = `${activeSession.characterId}-${Date.now()}`;
    const destPath = path.join(destDir, `${takeId}.wav`);
    fs.copyFileSync(wavPath, destPath);

    const take: Take = {
      id: takeId,
      characterId: activeSession.characterId,
      sessionId: activeSession.id,
      wavPath: destPath,
      transcript,
      emotion,
      claudeScore: null,
      approved: false,
      vaultExported: false,
      recordedAt: new Date().toISOString(),
      durationMs,
      scriptLine,
    };

    activeSession.takes.push(take);
    this.saveSession(activeSession);
    return take;
  }

  scoreTake(sessionId: string, takeId: string, score: TakeScore): Take {
    const session = this.sessions.get(sessionId);
    if (!session) { throw new Error(`Session ${sessionId} not found`); }

    const take = session.takes.find((t) => t.id === takeId);
    if (!take) { throw new Error(`Take ${takeId} not found`); }

    take.claudeScore = score;
    if (score.recommendation === 'approve') {
      take.approved = true;
    }

    this.saveSession(session);
    return take;
  }

  approveTake(sessionId: string, takeId: string, approved: boolean): Take {
    const session = this.sessions.get(sessionId);
    if (!session) { throw new Error(`Session ${sessionId} not found`); }

    const take = session.takes.find((t) => t.id === takeId);
    if (!take) { throw new Error(`Take ${takeId} not found`); }

    take.approved = approved;
    this.saveSession(session);
    return take;
  }

  markVaultExported(sessionId: string, takeId: string): Take {
    const session = this.sessions.get(sessionId);
    if (!session) { throw new Error(`Session ${sessionId} not found`); }
    const take = session.takes.find((t) => t.id === takeId);
    if (!take) { throw new Error(`Take ${takeId} not found`); }
    take.vaultExported = true;
    this.saveSession(session);
    return take;
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  getApprovedTakes(characterId?: string): Take[] {
    const takes: Take[] = [];
    for (const session of this.sessions.values()) {
      if (characterId && session.characterId !== characterId) { continue; }
      takes.push(...session.takes.filter((t) => t.approved));
    }
    return takes.sort((a, b) => (b.claudeScore?.overall ?? 0) - (a.claudeScore?.overall ?? 0));
  }

  getTakesForSession(sessionId: string): Take[] {
    return this.sessions.get(sessionId)?.takes ?? [];
  }

  getBestTake(sessionId: string): Take | null {
    const takes = this.getTakesForSession(sessionId);
    if (!takes.length) { return null; }
    return takes.reduce((best, t) => {
      const bestScore = best.claudeScore?.overall ?? 0;
      const tScore = t.claudeScore?.overall ?? 0;
      return tScore > bestScore ? t : best;
    });
  }

  /** SHA-256 fingerprint of the WAV file content */
  fingerprintWav(wavPath: string): string {
    const buf = fs.readFileSync(wavPath);
    return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  }

  // ─── Persistence ─────────────────────────────────────────────────────────────

  private loadSessions(): void {
    const sessionDir = path.join(this.takesRoot, '_sessions');
    if (!fs.existsSync(sessionDir)) { return; }
    const files = fs.readdirSync(sessionDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(sessionDir, file), 'utf8');
        const session = JSON.parse(raw) as Session;
        this.sessions.set(session.id, session);
      } catch { /* ignore */ }
    }
  }

  private saveSession(session: Session): void {
    const sessionDir = path.join(this.takesRoot, '_sessions');
    this.ensureDir(sessionDir);
    fs.writeFileSync(
      path.join(sessionDir, `${session.id}.json`),
      JSON.stringify(session, null, 2),
      'utf8'
    );
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
  }
}
