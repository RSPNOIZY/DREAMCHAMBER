import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Take, TakeManager } from './TakeManager';
import { CharacterProfile } from './CharacterManager';

export interface VaultMetadata {
  // Identity
  vaultId: string;              // unique fingerprint hash
  createdAt: string;

  // Creator rights — 75% Perpetual Protocol
  creator: string;              // "Robert Stephen Plowman"
  creatorOwnership: number;     // 75
  platformSplit: number;        // 25 (NOIZY platform)
  perpetualRoyalty: boolean;    // always true — LifeLUV token model
  consentLocked: boolean;       // immutable once exported

  // Asset identity
  characterId: string;
  characterName: string;
  takeId: string;
  transcript: string;
  emotion: string;
  durationMs: number;
  wavFingerprint: string;       // SHA-256 of audio content

  // Scoring
  claudeScore: number | null;
  recommendation: string | null;

  // Usage rights
  usageRights: {
    commercialUse: boolean;
    syncLicensing: boolean;
    aiTraining: boolean;        // default: false — user controls this
    derivativeWorks: boolean;
    attribution: string;        // "Voice: Robert Stephen Plowman / NOIZY"
  };

  // Session context
  sessionId: string;
  scriptLine: string;
  recordedAt: string;
}

export interface VaultExport {
  wavPath: string;       // copy in vault directory
  metaPath: string;      // JSON sidecar
  metadata: VaultMetadata;
}

export class VaultExporter {
  private vaultDir: string;

  constructor(workspaceRoot: string, vaultPath?: string) {
    // Vault NEVER lives on the M2 Ultra internal drive.
    // Must be an external drive (4TBSG Aquarium or equivalent).
    // Default: /Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/RSP_001/vault
    this.vaultDir = vaultPath
      || '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/RSP_001/vault';
    this.ensureDir(this.vaultDir);
  }

  /**
   * Export an approved take to the consent-locked vault.
   * Copies WAV + writes JSON sidecar with full metadata.
   * Returns export paths.
   */
  export(
    take: Take,
    character: CharacterProfile,
    takeManager: TakeManager,
    options: { aiTraining?: boolean; syncLicensing?: boolean } = {}
  ): VaultExport {
    if (!take.approved) {
      throw new Error(`Take ${take.id} is not approved — cannot export to vault`);
    }
    if (!fs.existsSync(take.wavPath)) {
      throw new Error(`WAV file missing: ${take.wavPath}`);
    }

    // Build metadata
    const wavFingerprint = takeManager.fingerprintWav(take.wavPath);
    const vaultId = crypto
      .createHash('sha256')
      .update(`${take.id}:${wavFingerprint}:${character.creator}`)
      .digest('hex')
      .slice(0, 24);

    const metadata: VaultMetadata = {
      vaultId,
      createdAt: new Date().toISOString(),

      creator: character.creator,
      creatorOwnership: character.ownershipPercent,       // 75
      platformSplit: 100 - character.ownershipPercent,    // 25
      perpetualRoyalty: true,
      consentLocked: true,

      characterId: character.id,
      characterName: character.name,
      takeId: take.id,
      transcript: take.transcript,
      emotion: take.emotion,
      durationMs: take.durationMs,
      wavFingerprint,

      claudeScore: take.claudeScore?.overall ?? null,
      recommendation: take.claudeScore?.recommendation ?? null,

      usageRights: {
        commercialUse: true,
        syncLicensing: options.syncLicensing ?? true,
        aiTraining: options.aiTraining ?? false,     // opt-in, not opt-out
        derivativeWorks: false,
        attribution: `Voice: ${character.creator} / NOIZY`,
      },

      sessionId: take.sessionId,
      scriptLine: take.scriptLine,
      recordedAt: take.recordedAt,
    };

    // Write to vault
    const charVaultDir = path.join(this.vaultDir, character.id);
    this.ensureDir(charVaultDir);

    const wavDest = path.join(charVaultDir, `${vaultId}.wav`);
    const metaDest = path.join(charVaultDir, `${vaultId}.json`);

    fs.copyFileSync(take.wavPath, wavDest);
    fs.writeFileSync(metaDest, JSON.stringify(metadata, null, 2), 'utf8');

    // Mark take as exported
    takeManager.markVaultExported(take.sessionId, take.id);

    return { wavPath: wavDest, metaPath: metaDest, metadata };
  }

  /**
   * Export all approved, un-exported takes for a character in one batch.
   */
  exportBatch(
    takes: Take[],
    character: CharacterProfile,
    takeManager: TakeManager,
    options: { aiTraining?: boolean; syncLicensing?: boolean } = {}
  ): VaultExport[] {
    const pending = takes.filter((t) => t.approved && !t.vaultExported);
    return pending.map((t) => this.export(t, character, takeManager, options));
  }

  /**
   * List all vault exports for a character.
   */
  listExports(characterId?: string): VaultMetadata[] {
    const results: VaultMetadata[] = [];

    const dirs = characterId
      ? [path.join(this.vaultDir, characterId)]
      : fs.readdirSync(this.vaultDir).map((d) => path.join(this.vaultDir, d));

    for (const dir of dirs) {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { continue; }
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(dir, file), 'utf8');
          results.push(JSON.parse(raw) as VaultMetadata);
        } catch { /* ignore */ }
      }
    }

    return results.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Generate a human-readable vault report for a character.
   */
  generateReport(characterId: string): string {
    const exports = this.listExports(characterId);
    if (!exports.length) { return `No vault exports for character ${characterId}.`; }

    const totalDuration = exports.reduce((sum, e) => sum + e.durationMs, 0);
    const avgScore = exports.filter((e) => e.claudeScore !== null)
      .reduce((sum, e, _, arr) => sum + (e.claudeScore ?? 0) / arr.length, 0);

    const lines = [
      `# NOIZYVOX VAULT REPORT`,
      `Character: ${exports[0]?.characterName ?? characterId}`,
      `Creator: ${exports[0]?.creator ?? 'unknown'}`,
      `Ownership: ${exports[0]?.creatorOwnership ?? 75}% creator / ${exports[0]?.platformSplit ?? 25}% NOIZY`,
      ``,
      `Total exports: ${exports.length}`,
      `Total duration: ${(totalDuration / 1000).toFixed(1)}s`,
      `Average Claude score: ${avgScore.toFixed(1)}/100`,
      `Perpetual royalty: ${exports[0]?.perpetualRoyalty ? 'YES' : 'NO'}`,
      `AI training rights: ${exports[0]?.usageRights.aiTraining ? 'GRANTED' : 'WITHHELD'}`,
      ``,
      `## Exports`,
      ...exports.map((e, i) =>
        `${i + 1}. ${e.emotion.toUpperCase()} | Score: ${e.claudeScore ?? 'N/A'} | ${(e.durationMs / 1000).toFixed(1)}s | "${e.transcript.slice(0, 60)}"`
      ),
    ];

    return lines.join('\n');
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
  }
}
