/**
 * NOIZYVOX Registry — TypeScript client for the 75/25 voice ownership protocol
 * ---------------------------------------------------------------------------
 * Communicates with the NOIZY platform API (noizy_platform FastAPI backend)
 * to manage voice model registration, cloning, synthesis, and split tracking.
 *
 * All operations are authenticated via x-noizy-api-key.
 * The 75/25 split is immutable — locked at registration.
 */
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
// form-data is a CommonJS module — use require to avoid TS2351
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormDataCtor = require('form-data') as { new(): FormDataInstance };
interface FormDataInstance {
  append(name: string, value: unknown, options?: unknown): void;
  getHeaders(): Record<string, string>;
  pipe(dest: http.ClientRequest): void;
}

export interface VoiceModel {
  id: number;
  slug: string;
  display_name: string;
  owner_handle: string;
  status: 'pending' | 'training' | 'active' | 'suspended';
  creator_share: number;   // always 0.75
  platform_share: number;  // always 0.25
  xtts_checkpoint_path: string;
  voice_fingerprint_json: string;
  activated_at: string | null;
  created_at: string;
}

export interface SplitSummary {
  voice_model_slug: string;
  owner_handle: string;
  total_uses: number;
  total_seconds: number;
  total_credits: number;
  creator_total: number;
  platform_total: number;
  activation_status: string;
  activated_at: string | null;
}

export interface CloneResult {
  voice_model_slug: string;
  status: string;
  fingerprint: Record<string, unknown>;
  message: string;
}

export interface SynthResult {
  voice_model_slug: string;
  output_path: string;
  duration_seconds: number;
  credits_charged: number;
  creator_earned: number;
  platform_earned: number;
}

export interface XttsStatus {
  noizyvox: string;
  split: string;
  xtts: {
    available: boolean;
    device: string;
    version?: string;
    install?: string;
  };
}

export interface HVSVoiceType {
  register: string;
  character: string;
  texture: string;
  energy: string;
  expressiveness: string;
}

export interface HVSVocalHealth {
  health_score: number;
  pitch_stability: number;
  breathiness: number;
  effort_level: number;
  hnr_approx: number;
  dynamic_range: number;
  vocal_fatigue: number;
  rms_db: number;
}

export interface HVSDriftAlert {
  level: 'LOW' | 'MODERATE' | 'HIGH';
  score: number;
  message: string;
}

export interface HVSReport {
  voice_model_slug: string;
  owner_handle: string;
  version: string;
  samples_analyzed: number;
  voice_type: HVSVoiceType | null;
  vocal_health: HVSVocalHealth | null;
  emotion_distribution: Record<string, number> | null;
  dominant_emotion: string | null;
  neural_embedding_available: boolean;
  neural_embedding_dim: number;
  drift: { score: number; alert: HVSDriftAlert | null } | null;
  narrative: string | null;
  generated_at: string;
}

export interface NoizyVoxConfig {
  baseUrl: string;   // e.g. http://localhost:8090
  apiKey: string;    // x-noizy-api-key
}

export class NoizyVoxRegistry {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: NoizyVoxConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  // ─── Health / status ───────────────────────────────────────────────────────

  async getStatus(): Promise<XttsStatus> {
    return this.get<XttsStatus>('/noizyvox/status');
  }

  // ─── Voice model CRUD ─────────────────────────────────────────────────────

  async listModels(): Promise<VoiceModel[]> {
    return this.get<VoiceModel[]>('/noizyvox/models');
  }

  async getModel(slug: string): Promise<VoiceModel> {
    return this.get<VoiceModel>(`/noizyvox/models/${slug}`);
  }

  async registerModel(slug: string, displayName: string, ownerHandle: string): Promise<VoiceModel> {
    return this.post<VoiceModel>('/noizyvox/models', {
      slug,
      display_name: displayName,
      owner_handle: ownerHandle,
    });
  }

  // ─── Voice cloning ────────────────────────────────────────────────────────

  /**
   * Upload local WAV files to clone a voice model.
   * The 75/25 split is locked at this point — cannot be changed.
   */
  async cloneVoice(slug: string, wavPaths: string[], language = 'en'): Promise<CloneResult> {
    const form = new FormDataCtor();
    for (const p of wavPaths) {
      form.append('files', fs.createReadStream(p), path.basename(p));
    }
    form.append('language', language);

    return this.postForm<CloneResult>(`/noizyvox/models/${slug}/clone`, form);
  }

  // ─── Synthesis ────────────────────────────────────────────────────────────

  async synthesize(
    slug: string,
    text: string,
    usedBy = 'dreamchamber',
    language = 'en',
    speed = 1.0,
  ): Promise<SynthResult> {
    return this.post<SynthResult>(`/noizyvox/models/${slug}/synthesize`, {
      voice_model_slug: slug,
      text,
      used_by: usedBy,
      language,
      speed,
    });
  }

  // ─── Splits & usage ───────────────────────────────────────────────────────

  async getSplitSummary(slug: string): Promise<SplitSummary> {
    return this.get<SplitSummary>(`/noizyvox/models/${slug}/splits`);
  }

  async getUsageHistory(slug: string, limit = 50): Promise<unknown[]> {
    return this.get<unknown[]>(`/noizyvox/models/${slug}/usage?limit=${limit}`);
  }

  async getFingerprint(slug: string): Promise<{ voice_model_slug: string; fingerprint: Record<string, unknown> }> {
    return this.get(`/noizyvox/models/${slug}/fingerprint`);
  }

  // ─── HVS — Human Voice Signature ─────────────────────────────────────────

  async getHvs(slug: string, regenerate = false): Promise<HVSReport> {
    return this.get<HVSReport>(`/noizyvox/models/${slug}/hvs?regenerate=${regenerate}`);
  }

  async analyzeNewSamples(slug: string, wavPaths: string[]): Promise<HVSReport> {
    const form = new FormDataCtor();
    for (const p of wavPaths) {
      form.append('files', fs.createReadStream(p), path.basename(p));
    }
    return this.postForm<HVSReport>(`/noizyvox/models/${slug}/hvs/analyze`, form);
  }

  // ─── HTTP helpers ─────────────────────────────────────────────────────────

  private get<T>(urlPath: string): Promise<T> {
    return this.request<T>('GET', urlPath, undefined);
  }

  private post<T>(urlPath: string, body: unknown): Promise<T> {
    const payload = JSON.stringify(body);
    return this.request<T>('POST', urlPath, Buffer.from(payload), {
      'Content-Type': 'application/json',
    });
  }

  private postForm<T>(urlPath: string, form: FormDataInstance): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${urlPath}`);
      const transport = url.protocol === 'https:' ? https : http;

      const headers: Record<string, string> = {
        'x-noizy-api-key': this.apiKey,
        ...form.getHeaders(),
      };

      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`NOIZYVOX ${res.statusCode}: ${raw.slice(0, 300)}`));
            } else {
              try { resolve(JSON.parse(raw) as T); }
              catch { reject(new Error(`JSON parse failed: ${raw.slice(0, 200)}`)); }
            }
          });
        }
      );

      req.on('error', reject);
      form.pipe(req);
    });
  }

  private request<T>(
    method: string,
    urlPath: string,
    body: Buffer | undefined,
    extraHeaders: Record<string, string> = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${urlPath}`);
      const transport = url.protocol === 'https:' ? https : http;

      const headers: Record<string, string | number> = {
        'x-noizy-api-key': this.apiKey,
        ...extraHeaders,
      };
      if (body) {
        headers['Content-Length'] = body.length;
      }

      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method,
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`NOIZYVOX ${res.statusCode}: ${raw.slice(0, 300)}`));
            } else {
              try { resolve(JSON.parse(raw) as T); }
              catch { reject(new Error(`JSON parse failed: ${raw.slice(0, 200)}`)); }
            }
          });
        }
      );

      req.on('error', reject);
      if (body) { req.write(body); }
      req.end();
    });
  }
}
