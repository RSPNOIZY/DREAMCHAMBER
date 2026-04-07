/**
 * TTSClient — Text-to-Speech bridge
 * Routes to: Kokoro-82M (default) | Dia-1.6B | macOS system TTS
 * Local server runs at dreamchamber.ttsPort (default 8098)
 */
import * as vscode from 'vscode';
import * as http from 'http';
import * as child_process from 'child_process';

export type TTSBackend = 'kokoro' | 'dia' | 'system';

export class TTSClient {
  private port: number;
  private backend: TTSBackend;
  private serverAvailable: boolean | null = null;
  private currentProc: child_process.ChildProcess | null = null;

  constructor() {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    this.port = cfg.get<number>('ttsPort') ?? 8098;
    this.backend = cfg.get<TTSBackend>('ttsBackend') ?? 'kokoro';
  }

  async isServerAlive(): Promise<boolean> {
    if (this.backend === 'system') return true;
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${this.port}/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
  }

  async speak(text: string, voice?: string): Promise<void> {
    if (!text.trim()) return;

    // System TTS — always available, no server needed
    if (this.backend === 'system') {
      return this.speakSystem(text);
    }

    if (this.serverAvailable === null) {
      this.serverAvailable = await this.isServerAlive();
    }

    if (!this.serverAvailable) {
      // Fall back to system TTS silently
      return this.speakSystem(text);
    }

    await this.postToServer('/synthesize', {
      text,
      voice: voice ?? 'af_heart',
      backend: this.backend,
      play: true, // server plays audio directly
    });
  }

  stopSpeaking(): void {
    if (this.currentProc) {
      try { this.currentProc.kill(); } catch { /* ignore */ }
      this.currentProc = null;
    }
    // Also signal the HTTP server to stop
    if (this.serverAvailable) {
      const req = require('http').request({
        hostname: 'localhost', port: this.port, path: '/stop', method: 'POST',
        headers: { 'Content-Length': 0 },
      });
      req.on('error', () => {});
      req.end();
    }
  }

  // ─── macOS system fallback ─────────────────────────────────────────────────
  private speakSystem(text: string): Promise<void> {
    return new Promise((resolve) => {
      // Use macOS 'say' command — instant, no dependencies
      const proc = child_process.spawn('say', [text]);
      this.currentProc = proc;
      proc.on('close', () => { this.currentProc = null; resolve(); });
      proc.on('error', () => { this.currentProc = null; resolve(); }); // fail silently
    });
  }

  // ─── HTTP POST ─────────────────────────────────────────────────────────────
  private async postToServer(endpoint: string, body: object): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: 'localhost',
        port: this.port,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res) => {
        res.resume(); // drain
        res.on('end', () => resolve());
      });
      req.on('error', () => resolve()); // fail silently — TTS is non-critical
      req.setTimeout(15000, () => { req.destroy(); resolve(); });
      req.write(payload);
      req.end();
    });
  }

  refreshConfig(): void {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    this.port = cfg.get<number>('ttsPort') ?? 8098;
    this.backend = cfg.get<TTSBackend>('ttsBackend') ?? 'kokoro';
    this.serverAvailable = null;
  }
}
