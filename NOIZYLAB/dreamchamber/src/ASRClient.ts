/**
 * ASRClient — Speech-to-Text bridge
 * Routes to: Moonshine (default) | Whisper | Web Speech API fallback
 * Local server runs at dreamchamber.asrPort (default 8099)
 */
import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';

export type ASRBackend = 'moonshine' | 'whisper' | 'webspeech';

export interface TranscriptResult {
  text: string;
  confidence: number;
  backend: ASRBackend;
  latencyMs: number;
}

export class ASRClient {
  private port: number;
  private backend: ASRBackend;
  private serverAvailable: boolean | null = null;

  constructor() {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    this.port = cfg.get<number>('asrPort') ?? 8099;
    this.backend = cfg.get<ASRBackend>('asrBackend') ?? 'moonshine';
  }

  // ─── Health Check ──────────────────────────────────────────────────────────
  async isServerAlive(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${this.port}/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
  }

  // ─── Transcribe audio buffer ───────────────────────────────────────────────
  async transcribe(audioBuffer: Buffer, sampleRate = 16000): Promise<TranscriptResult> {
    const start = Date.now();

    if (this.serverAvailable === null) {
      this.serverAvailable = await this.isServerAlive();
    }

    if (!this.serverAvailable) {
      vscode.window.showWarningMessage(
        `DreamChamber: ASR server not running on port ${this.port}. ` +
        `Run task "DreamChamber: Start ASR Server" first.`
      );
      throw new Error('ASR server unavailable');
    }

    // Write to temp WAV file for the server
    const tmpFile = path.join(os.tmpdir(), `dc_asr_${crypto.randomBytes(4).toString('hex')}.raw`);
    fs.writeFileSync(tmpFile, audioBuffer);

    try {
      const result = await this.postToServer('/transcribe', {
        file: tmpFile,
        sample_rate: sampleRate,
        backend: this.backend,
      });
      return {
        text: (result.text as string) ?? '',
        confidence: (result.confidence as number) ?? 1.0,
        backend: this.backend,
        latencyMs: Date.now() - start,
      };
    } finally {
      fs.unlink(tmpFile, () => {});
    }
  }

  // ─── HTTP POST to local server ────────────────────────────────────────────
  private async postToServer(endpoint: string, body: object): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const options: http.RequestOptions = {
        hostname: 'localhost',
        port: this.port,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error(`Bad JSON from ASR: ${data}`)); }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('ASR timeout')); });
      req.write(payload);
      req.end();
    });
  }

  refreshConfig(): void {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    this.port = cfg.get<number>('asrPort') ?? 8099;
    this.backend = cfg.get<ASRBackend>('asrBackend') ?? 'moonshine';
    this.serverAvailable = null; // re-check on next call
  }
}
