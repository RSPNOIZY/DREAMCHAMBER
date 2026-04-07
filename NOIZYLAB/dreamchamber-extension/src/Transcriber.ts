import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type TranscriptionEngine = 'whisper-api' | 'whisper-local' | 'moonshine';

export interface TranscriberConfig {
  engine: TranscriptionEngine;
  openaiApiKey?: string;       // falls back to OPENAI_API_KEY env var
  moonshineUrl?: string;       // default: http://localhost:8765
  whisperModel?: string;       // for local CLI: tiny/base/small/medium/large
  language?: string;           // ISO 639-1, e.g. 'en'
}

export class Transcriber {
  private config: Required<TranscriberConfig>;

  constructor(config: TranscriberConfig) {
    this.config = {
      engine: config.engine,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY || '',
      moonshineUrl: config.moonshineUrl || 'http://localhost:8765',
      whisperModel: config.whisperModel || 'base',
      language: config.language || 'en',
    };
  }

  async transcribe(wavPath: string): Promise<string> {
    switch (this.config.engine) {
      case 'whisper-api':
        return this.whisperApi(wavPath);
      case 'whisper-local':
        return this.whisperLocal(wavPath);
      case 'moonshine':
        return this.moonshine(wavPath);
    }
  }

  // ─── OpenAI Whisper API ─────────────────────────────────────────────────────

  private async whisperApi(wavPath: string): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('Whisper API: no OpenAI API key (set OPENAI_API_KEY or dreamchamber.openaiApiKey)');
    }

    const audioBuffer = fs.readFileSync(wavPath);
    const filename = path.basename(wavPath);

    // Build multipart/form-data manually (avoids needing form-data package in webview)
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const CRLF = '\r\n';

    const header =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
      `Content-Type: audio/wav${CRLF}${CRLF}`;

    const modelPart =
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="model"${CRLF}${CRLF}` +
      `whisper-1`;

    const langPart =
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="language"${CRLF}${CRLF}` +
      `${this.config.language}`;

    const footer = `${CRLF}--${boundary}--${CRLF}`;

    const body = Buffer.concat([
      Buffer.from(header),
      audioBuffer,
      Buffer.from(modelPart + langPart + footer),
    ]);

    const result = await this.httpPost(
      'https://api.openai.com/v1/audio/transcriptions',
      body,
      {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      }
    );

    const parsed = JSON.parse(result) as { text?: string; error?: { message: string } };
    if (parsed.error) { throw new Error(`Whisper API: ${parsed.error.message}`); }
    return (parsed.text || '').trim();
  }

  // ─── Local Whisper CLI ──────────────────────────────────────────────────────

  private async whisperLocal(wavPath: string): Promise<string> {
    const outDir = path.dirname(wavPath);
    const base = path.basename(wavPath, '.wav');

    try {
      await execAsync(
        `whisper "${wavPath}" --model ${this.config.whisperModel} ` +
        `--language ${this.config.language} --output_format txt ` +
        `--output_dir "${outDir}" --fp16 False`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`whisper CLI failed: ${msg}`);
    }

    const txtPath = path.join(outDir, `${base}.txt`);
    if (!fs.existsSync(txtPath)) {
      throw new Error('whisper CLI: output txt file not found');
    }
    const text = fs.readFileSync(txtPath, 'utf8').trim();
    try { fs.unlinkSync(txtPath); } catch { /* ignore */ }
    return text;
  }

  // ─── Moonshine HTTP ─────────────────────────────────────────────────────────

  private async moonshine(wavPath: string): Promise<string> {
    const audioBuffer = fs.readFileSync(wavPath);
    const url = `${this.config.moonshineUrl}/transcribe`;

    const result = await this.httpPost(
      url,
      audioBuffer,
      {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
      }
    );

    const parsed = JSON.parse(result) as { text?: string; transcript?: string; error?: string };
    if (parsed.error) { throw new Error(`Moonshine: ${parsed.error}`); }
    return (parsed.text || parsed.transcript || '').trim();
  }

  // ─── HTTP helper ────────────────────────────────────────────────────────────

  private httpPost(
    url: string,
    body: Buffer,
    headers: Record<string, string>
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const transport = parsed.protocol === 'https:' ? https : http;

      const req = transport.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
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
}
