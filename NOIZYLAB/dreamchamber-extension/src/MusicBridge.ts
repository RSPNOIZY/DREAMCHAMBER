import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { Emotion } from './CharacterManager';

export interface MusicBridgeConfig {
  musicgenUrl?: string;      // default: http://localhost:7860
  aceStepUrl?: string;       // default: http://localhost:7861
  mmAudioUrl?: string;       // default: http://localhost:7862
  outputDir?: string;        // where to save generated beds
}

export interface MusicBed {
  filePath: string;          // local path to generated WAV/MP3
  prompt: string;            // the prompt used to generate it
  durationSecs: number;
  emotion: Emotion;
  generatedAt: string;
  engine: 'musicgen' | 'ace-step' | 'mmaudio';
}

export interface SyncParams {
  voiceRhythmBpm?: number;       // extracted from voice takes
  keyMomentTimestamps?: number[]; // where to hit musically
  mood: Emotion;
  intensity: number;              // 0-1
}

// Maps emotions to MusicGen style prompts (your 40-year taste DNA)
const EMOTION_TO_MUSIC_PROMPT: Record<Emotion, string> = {
  neutral:    'ambient cinematic underscore, subtle, neutral, warm pads, no melody',
  angry:      'intense dramatic orchestral, brass hits, driving percussion, tension building',
  warm:       'acoustic guitar, warm strings, intimate, gentle, emotionally resonant',
  commanding: 'epic orchestral, bold brass, march rhythm, powerful, confident',
  vulnerable: 'solo piano, sparse, fragile, quiet strings, emotional, tender',
  playful:    'light acoustic, pizzicato strings, upbeat, bouncy, whimsical',
  menacing:   'dark drone, low brass, dissonant strings, ominous, building dread',
  tender:     'soft piano, acoustic guitar, warm cello, intimate, gentle warmth',
  desperate:  'urgent strings, building tension, emotional climax, fast tempo',
  resolute:   'determined orchestral, steady rhythm, brass resolve, triumphant but grounded',
};

export class MusicBridge {
  private config: Required<MusicBridgeConfig>;

  constructor(config: MusicBridgeConfig = {}) {
    this.config = {
      musicgenUrl: config.musicgenUrl || 'http://localhost:7860',
      aceStepUrl: config.aceStepUrl || 'http://localhost:7861',
      mmAudioUrl: config.mmAudioUrl || 'http://localhost:7862',
      outputDir: config.outputDir || path.join(os.homedir(), '.dreamchamber', 'music'),
    };
    this.ensureDir(this.config.outputDir);
  }

  // ─── MusicGen ────────────────────────────────────────────────────────────────

  /**
   * Generate a mood-matched underscore bed via MusicGen.
   * Expects a MusicGen Gradio API endpoint.
   */
  async generateBed(
    emotion: Emotion,
    durationSecs = 30,
    customPrompt?: string
  ): Promise<MusicBed> {
    const prompt = customPrompt || EMOTION_TO_MUSIC_PROMPT[emotion];

    // MusicGen Gradio API call
    const payload = JSON.stringify({
      fn_index: 0,
      data: [
        prompt,
        'melody',        // model
        durationSecs,
        null,            // melody input (none)
        3.0,             // guidance scale
        250,             // top_k
        0.0,             // top_p
        42,              // seed
        false,           // multi-band diffusion
      ],
    });

    const rawResult = await this.httpPost(
      `${this.config.musicgenUrl}/api/predict`,
      Buffer.from(payload),
      { 'Content-Type': 'application/json' }
    );

    const result = JSON.parse(rawResult) as {
      data?: Array<{ name?: string; url?: string; data?: string }>;
      error?: string;
    };

    if (result.error) {
      throw new Error(`MusicGen error: ${result.error}`);
    }

    const audioData = result.data?.[0];
    if (!audioData) { throw new Error('MusicGen returned no audio data'); }

    // Download or decode audio
    const outPath = path.join(
      this.config.outputDir,
      `bed-${emotion}-${Date.now()}.wav`
    );

    if (audioData.url) {
      const audioBuffer = await this.httpGet(audioData.url);
      fs.writeFileSync(outPath, audioBuffer);
    } else if (audioData.data) {
      // base64 encoded
      const buf = Buffer.from(audioData.data.split(',').pop() || '', 'base64');
      fs.writeFileSync(outPath, buf);
    } else {
      throw new Error('MusicGen: no URL or data in response');
    }

    return {
      filePath: outPath,
      prompt,
      durationSecs,
      emotion,
      generatedAt: new Date().toISOString(),
      engine: 'musicgen',
    };
  }

  // ─── ACE-Step sync ───────────────────────────────────────────────────────────

  /**
   * Sync a music bed to voice rhythm via ACE-Step.
   * ACE-Step adjusts tempo/feel to match voice cadence.
   */
  async syncToVoice(
    bedPath: string,
    syncParams: SyncParams
  ): Promise<string> {
    const payload = JSON.stringify({
      audio_path: bedPath,
      target_bpm: syncParams.voiceRhythmBpm ?? 120,
      key_moments: syncParams.keyMomentTimestamps ?? [],
      mood: syncParams.mood,
      intensity: syncParams.intensity,
    });

    const rawResult = await this.httpPost(
      `${this.config.aceStepUrl}/sync`,
      Buffer.from(payload),
      { 'Content-Type': 'application/json' }
    );

    const result = JSON.parse(rawResult) as { output_path?: string; error?: string };
    if (result.error) { throw new Error(`ACE-Step error: ${result.error}`); }

    return result.output_path || bedPath;
  }

  // ─── MMAudio (video alignment) ───────────────────────────────────────────────

  /**
   * Align soundscape to video via MMAudio.
   * Returns path to audio file synced to video timestamps.
   */
  async alignToVideo(
    videoPath: string,
    emotion: Emotion,
    prompt?: string
  ): Promise<string> {
    const audioPrompt = prompt || EMOTION_TO_MUSIC_PROMPT[emotion];

    const payload = JSON.stringify({
      video_path: videoPath,
      prompt: audioPrompt,
      duration: -1,    // match video duration
      cfg_strength: 4.5,
      seed: 42,
    });

    const rawResult = await this.httpPost(
      `${this.config.mmAudioUrl}/generate`,
      Buffer.from(payload),
      { 'Content-Type': 'application/json' }
    );

    const result = JSON.parse(rawResult) as { output_path?: string; error?: string };
    if (result.error) { throw new Error(`MMAudio error: ${result.error}`); }

    return result.output_path || '';
  }

  // ─── Prompt helpers ──────────────────────────────────────────────────────────

  /** Get the music prompt for an emotion. */
  getPromptForEmotion(emotion: Emotion): string {
    return EMOTION_TO_MUSIC_PROMPT[emotion];
  }

  /** List generated beds for an emotion. */
  listBeds(emotion?: Emotion): string[] {
    const files = fs.readdirSync(this.config.outputDir);
    return files
      .filter((f) => f.endsWith('.wav') || f.endsWith('.mp3'))
      .filter((f) => !emotion || f.includes(emotion))
      .map((f) => path.join(this.config.outputDir, f));
  }

  // ─── HTTP helpers ─────────────────────────────────────────────────────────────

  private httpPost(url: string, body: Buffer, headers: Record<string, string>): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const transport = parsed.protocol === 'https:' ? https : http;

      const req = transport.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: { ...headers, 'Content-Length': body.length.toString() },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            } else {
              resolve(raw);
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private httpGet(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const transport = parsed.protocol === 'https:' ? https : http;

      transport.get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
  }
}
