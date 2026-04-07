import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

export type TtsEngine = 'say' | 'kokoro' | 'xtts' | 'disabled';

export interface VoiceSynthConfig {
  engine: TtsEngine;
  sayVoice?: string;       // macOS say voice, default: 'Samantha'
  kokoroUrl?: string;      // default: http://localhost:8880
  kokoroVoice?: string;    // default: 'af_heart'
  noizyVoxUrl?: string;    // NOIZY platform API, default: http://localhost:8090
  noizyVoxKey?: string;    // x-noizy-api-key header value
  xttsVoiceSlug?: string;  // registered NOIZYVOX voice model slug
  xttsLanguage?: string;   // default: 'en'
  xttsSpeed?: number;      // 0.5–2.0, default: 1.0
}

export class VoiceSynth {
  private config: Required<VoiceSynthConfig>;
  private speaking = false;
  private currentProcess: ReturnType<typeof spawn> | null = null;

  constructor(config: VoiceSynthConfig) {
    this.config = {
      engine: config.engine,
      sayVoice: config.sayVoice || 'Samantha',
      kokoroUrl: config.kokoroUrl || 'http://localhost:8880',
      kokoroVoice: config.kokoroVoice || 'af_heart',
      noizyVoxUrl: config.noizyVoxUrl || 'http://localhost:8090',
      noizyVoxKey: config.noizyVoxKey || '',
      xttsVoiceSlug: config.xttsVoiceSlug || '',
      xttsLanguage: config.xttsLanguage || 'en',
      xttsSpeed: config.xttsSpeed ?? 1.0,
    };
  }

  get isSpeaking(): boolean {
    return this.speaking;
  }

  /** Speak text. Interrupts any current speech. */
  async speak(text: string): Promise<void> {
    this.stop();

    if (this.config.engine === 'disabled' || !text.trim()) {
      return;
    }

    this.speaking = true;

    try {
      if (this.config.engine === 'say') {
        await this.speakViaSay(text);
      } else if (this.config.engine === 'kokoro') {
        await this.speakViaKokoro(text);
      } else if (this.config.engine === 'xtts') {
        await this.speakViaXtts(text);
      }
    } finally {
      this.speaking = false;
      this.currentProcess = null;
    }
  }

  /** Stop any current speech immediately. */
  stop(): void {
    if (this.currentProcess) {
      try { this.currentProcess.kill('SIGTERM'); } catch { /* ignore */ }
      this.currentProcess = null;
    }
    this.speaking = false;

    // Kill any lingering say/afplay processes
    exec('pkill -f "^say " 2>/dev/null; pkill -f "^afplay " 2>/dev/null', () => {});
  }

  // ─── macOS say ─────────────────────────────────────────────────────────────

  private speakViaSay(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Escape single quotes in text
      const safe = text.replace(/'/g, "'\\''");
      const proc = spawn('say', ['-v', this.config.sayVoice, safe]);
      this.currentProcess = proc;

      proc.on('close', (code) => {
        if (code === 0 || code === null) { resolve(); }
        else { reject(new Error(`say exited with code ${code}`)); }
      });

      proc.on('error', reject);
    });
  }

  // ─── Kokoro TTS ────────────────────────────────────────────────────────────

  private async speakViaKokoro(text: string): Promise<void> {
    // Request audio from Kokoro OpenAI-compatible TTS endpoint
    const payload = JSON.stringify({
      model: 'kokoro',
      voice: this.config.kokoroVoice,
      input: text,
      response_format: 'wav',
    });

    const audioBuffer = await this.kokoroRequest(payload);

    // Write to temp WAV and play with afplay
    const tmpPath = path.join(os.tmpdir(), `dreamchamber-tts-${Date.now()}.wav`);
    fs.writeFileSync(tmpPath, audioBuffer);

    await this.afplay(tmpPath);

    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }

  private kokoroRequest(payload: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.config.kokoroUrl}/v1/audio/speech`);
      const transport = url.protocol === 'https:' ? https : http;

      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Kokoro HTTP ${res.statusCode}`));
            } else {
              resolve(Buffer.concat(chunks));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  private afplay(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('afplay', [filePath]);
      this.currentProcess = proc;
      proc.on('close', (code) => {
        if (code === 0 || code === null) { resolve(); }
        else { reject(new Error(`afplay exited with code ${code}`)); }
      });
      proc.on('error', reject);
    });
  }

  // ─── NOIZYVOX XTTS ────────────────────────────────────────────────────────

  /**
   * Synthesize speech via NOIZYVOX /noizyvox/models/{slug}/synthesize endpoint.
   * Uses a creator-registered XTTS voice model — 75/25 split auto-logged.
   */
  private async speakViaXtts(text: string): Promise<void> {
    if (!this.config.xttsVoiceSlug) {
      throw new Error('XTTS engine selected but no voice slug configured (dreamchamber.xttsVoiceSlug)');
    }

    const tmpPath = path.join(os.tmpdir(), `dreamchamber-xtts-${Date.now()}.wav`);

    const payload = JSON.stringify({
      voice_model_slug: this.config.xttsVoiceSlug,
      text,
      used_by: 'dreamchamber',
      output_path: tmpPath,
      language: this.config.xttsLanguage,
      speed: this.config.xttsSpeed,
    });

    const url = new URL(`${this.config.noizyVoxUrl}/noizyvox/models/${this.config.xttsVoiceSlug}/synthesize`);
    const transport = url.protocol === 'https:' ? https : http;

    await new Promise<void>((resolve, reject) => {
      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'x-noizy-api-key': this.config.noizyVoxKey,
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`NOIZYVOX XTTS HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString().slice(0, 200)}`));
            } else {
              resolve();
            }
          });
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    await this.afplay(tmpPath);
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}
