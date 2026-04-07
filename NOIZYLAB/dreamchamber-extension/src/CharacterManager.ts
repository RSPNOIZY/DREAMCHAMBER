import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export type Emotion =
  | 'neutral' | 'angry' | 'warm' | 'commanding' | 'vulnerable'
  | 'playful' | 'menacing' | 'tender' | 'desperate' | 'resolute';

export interface VoiceFingerprint {
  hash: string;              // SHA-256 of acoustic feature vector description
  pitchRange: string;        // e.g. "baritone 90-180Hz"
  toneDescriptors: string[]; // e.g. ["gravelly", "warm", "resonant"]
  capturedAt: string;        // ISO timestamp
}

export interface CharacterProfile {
  id: string;                    // slug: "detective-morrison"
  name: string;                  // "Detective Morrison"
  brief: string;                 // full character description
  emotionalRange: Emotion[];     // emotions this character expresses
  voiceFingerprint: VoiceFingerprint | null;
  createdAt: string;
  updatedAt: string;
  creator: string;               // "Robert Stephen Plowman"
  ownershipPercent: number;      // 75 (LifeLUV default)
  scriptExcerpts: string[];      // sample lines for reference
  claudeDirectorNotes: string;   // Claude's evolving notes on this character
}

export class CharacterManager {
  private profilesDir: string;
  private profiles: Map<string, CharacterProfile> = new Map();

  constructor(workspaceRoot: string) {
    this.profilesDir = path.join(workspaceRoot, '.dreamchamber', 'characters');
    this.ensureDir(this.profilesDir);
    this.loadAll();
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  create(
    name: string,
    brief: string,
    emotionalRange: Emotion[] = ['neutral'],
    creator = 'Robert Stephen Plowman'
  ): CharacterProfile {
    const id = this.slugify(name);
    if (this.profiles.has(id)) {
      throw new Error(`Character "${name}" already exists`);
    }

    const now = new Date().toISOString();
    const profile: CharacterProfile = {
      id,
      name,
      brief,
      emotionalRange,
      voiceFingerprint: null,
      createdAt: now,
      updatedAt: now,
      creator,
      ownershipPercent: 75,
      scriptExcerpts: [],
      claudeDirectorNotes: '',
    };

    this.profiles.set(id, profile);
    this.save(profile);
    return profile;
  }

  get(id: string): CharacterProfile | undefined {
    return this.profiles.get(id);
  }

  getAll(): CharacterProfile[] {
    return [...this.profiles.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  update(id: string, patch: Partial<CharacterProfile>): CharacterProfile {
    const existing = this.profiles.get(id);
    if (!existing) { throw new Error(`Character "${id}" not found`); }

    const updated = {
      ...existing,
      ...patch,
      id,                              // never mutate id
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(id, updated);
    this.save(updated);
    return updated;
  }

  delete(id: string): void {
    const filePath = this.profilePath(id);
    this.profiles.delete(id);
    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
  }

  // ─── Voice Fingerprint ───────────────────────────────────────────────────────

  /**
   * Build a voice fingerprint from Claude's acoustic analysis text.
   * Call this after Claude has analyzed a reference take.
   */
  setVoiceFingerprint(
    id: string,
    pitchRange: string,
    toneDescriptors: string[]
  ): CharacterProfile {
    const payload = JSON.stringify({ pitchRange, toneDescriptors });
    const hash = crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);

    const fingerprint: VoiceFingerprint = {
      hash,
      pitchRange,
      toneDescriptors,
      capturedAt: new Date().toISOString(),
    };

    return this.update(id, { voiceFingerprint: fingerprint });
  }

  // ─── Script excerpts ────────────────────────────────────────────────────────

  addScriptExcerpt(id: string, line: string): CharacterProfile {
    const profile = this.profiles.get(id);
    if (!profile) { throw new Error(`Character "${id}" not found`); }

    const excerpts = [...profile.scriptExcerpts, line].slice(-20); // keep last 20
    return this.update(id, { scriptExcerpts: excerpts });
  }

  updateDirectorNotes(id: string, notes: string): CharacterProfile {
    return this.update(id, { claudeDirectorNotes: notes });
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  private loadAll(): void {
    if (!fs.existsSync(this.profilesDir)) { return; }
    const files = fs.readdirSync(this.profilesDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(this.profilesDir, file), 'utf8');
        const profile = JSON.parse(raw) as CharacterProfile;
        this.profiles.set(profile.id, profile);
      } catch { /* ignore malformed files */ }
    }
  }

  private save(profile: CharacterProfile): void {
    this.ensureDir(this.profilesDir);
    fs.writeFileSync(
      this.profilePath(profile.id),
      JSON.stringify(profile, null, 2),
      'utf8'
    );
  }

  private profilePath(id: string): string {
    return path.join(this.profilesDir, `${id}.json`);
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
  }

  // ─── Quick picker for VSCode ────────────────────────────────────────────────

  async pickCharacter(): Promise<CharacterProfile | undefined> {
    const all = this.getAll();
    if (!all.length) {
      vscode.window.showWarningMessage('No characters yet — create one with "character new [name]"');
      return undefined;
    }

    const items = all.map((c) => ({
      label: c.name,
      description: c.voiceFingerprint ? `DNA: ${c.voiceFingerprint.hash}` : 'no fingerprint',
      detail: c.brief.slice(0, 80),
      character: c,
    }));

    const pick = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select character',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    return pick?.character;
  }
}
