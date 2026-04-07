import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { EventEmitter } from 'events';

// node-record-lpcm16 types
interface RecordingOptions {
  sampleRate?: number;
  channels?: number;
  audioType?: string;
  silence?: string;
  threshold?: number;
  recorder?: string;
  endOnSilence?: boolean;
  thresholdStart?: number | null;
  thresholdEnd?: number | null;
  silence_header?: string;
}

interface Recording {
  stream(): NodeJS.ReadableStream;
  stop(): void;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const record = require('node-record-lpcm16') as {
  record(options?: RecordingOptions): Recording;
};

export interface AudioCaptureEvents {
  data: (chunk: Buffer) => void;
  error: (err: Error) => void;
  end: () => void;
}

export class AudioCapture extends EventEmitter {
  private recording: Recording | null = null;
  private outputPath: string = '';
  private writeStream: fs.WriteStream | null = null;
  private sampleRate: number;
  private channels: number;
  private inputDevice: string;

  constructor(sampleRate = 48000, channels = 1, inputDevice = '') {
    super();
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.inputDevice = inputDevice;
  }

  /** Start recording. Returns path to temp WAV file. */
  start(): string {
    if (this.recording) {
      this.stop();
    }

    // Create temp WAV file
    this.outputPath = path.join(os.tmpdir(), `dreamchamber-${Date.now()}.wav`);
    this.writeStream = fs.createWriteStream(this.outputPath);

    const recordOpts: RecordingOptions = {
      sampleRate: this.sampleRate,
      channels: this.channels,
      audioType: 'wav',
      recorder: 'sox',      // SoX backend — brew install sox
      silence: '1.0',       // 1s silence detection threshold
      threshold: 0.5,
    };

    // Route to specific CoreAudio device if configured
    if (this.inputDevice) {
      (recordOpts as Record<string, unknown>).device = this.inputDevice;
    }

    this.recording = record.record(recordOpts);

    const audioStream = this.recording.stream();

    audioStream.on('data', (chunk: Buffer) => {
      this.writeStream?.write(chunk);
      this.emit('data', chunk);
    });

    audioStream.on('error', (err: Error) => {
      // Ignore "file size" SoX warnings that come through stderr
      if (err.message?.includes('file size')) { return; }
      this.emit('error', err);
    });

    audioStream.on('end', () => {
      this.writeStream?.end();
      this.emit('end');
    });

    return this.outputPath;
  }

  /** Stop recording and return the path to the completed WAV file. */
  stop(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.recording) {
        resolve(this.outputPath);
        return;
      }

      this.recording.stop();
      this.recording = null;

      if (this.writeStream) {
        this.writeStream.end(() => {
          resolve(this.outputPath);
        });
        this.writeStream = null;
      } else {
        resolve(this.outputPath);
      }
    });
  }

  /** True if actively recording. */
  get isRecording(): boolean {
    return this.recording !== null;
  }

  /** Clean up the temp WAV file after use. */
  cleanup(): void {
    if (this.outputPath && fs.existsSync(this.outputPath)) {
      try { fs.unlinkSync(this.outputPath); } catch { /* ignore */ }
      this.outputPath = '';
    }
  }

  /** Check that SoX is available on PATH. */
  static async checkSox(): Promise<boolean> {
    const { exec } = await import('child_process');
    return new Promise((resolve) => {
      exec('which sox', (err) => resolve(!err));
    });
  }
}
