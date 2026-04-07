/**
 * AudioBridge — Native mic capture via node-record-lpcm16
 * Captures PCM audio, buffers it, fires onAudioReady when a segment is complete.
 * Falls back to Web Speech API signal if node-record is unavailable.
 */
import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// Dynamic import — node-record-lpcm16 may not be available everywhere
let recorder: typeof import("node-record-lpcm16") | null = null;
try {
  recorder = require("node-record-lpcm16");
} catch {
  /* fallback to webspeech */
}

export type AudioBackend = "node-record" | "webspeech";

export interface AudioBridgeConfig {
  sampleRate?: number; // default: 16000 (optimal for Moonshine/Whisper)
  channels?: number; // default: 1 (mono)
  silenceThreshold?: number; // dB, default: -40
  silenceDuration?: number; // ms of silence before segment ends, default: 1200
  device?: string; // audio input device name
}

// 30 seconds of 16kHz 16-bit mono = ~960 KB — flush before this to cap memory
const MAX_BUFFER_BYTES = 960_000;

export class AudioBridge {
  private recording = false;
  private backend: AudioBackend = "webspeech";
  private recordingProcess: ReturnType<
    typeof import("node-record-lpcm16").record
  > | null = null;
  private chunks: Buffer[] = [];
  private chunksBytes = 0;
  private silenceTimer: NodeJS.Timeout | null = null;
  private config: Required<AudioBridgeConfig>;

  private onAudioReady: (buffer: Buffer, sampleRate: number) => void = () => {};
  private onRecordingStateChange: (recording: boolean) => void = () => {};

  constructor(config: AudioBridgeConfig = {}) {
    this.config = {
      sampleRate: config.sampleRate ?? 16000,
      channels: config.channels ?? 1,
      silenceThreshold: config.silenceThreshold ?? -40,
      silenceDuration: config.silenceDuration ?? 1200,
      device: config.device ?? "",
    };
    this.backend = recorder ? "node-record" : "webspeech";
  }

  get currentBackend(): AudioBackend {
    return this.backend;
  }
  get isRecording(): boolean {
    return this.recording;
  }

  onAudio(cb: (buffer: Buffer, sampleRate: number) => void): void {
    this.onAudioReady = cb;
  }

  onStateChange(cb: (recording: boolean) => void): void {
    this.onRecordingStateChange = cb;
  }

  // ─── Start recording ───────────────────────────────────────────────────────
  start(): void {
    if (this.recording) return;

    if (!recorder) {
      // Signal to webview to use Web Speech API
      this.recording = true;
      this.onRecordingStateChange(true);
      vscode.window.setStatusBarMessage(
        "DreamChamber: Using Web Speech API (node-record-lpcm16 not installed)",
        4000,
      );
      return;
    }

    this.chunks = [];
    this.recording = true;

    try {
      const recordOptions: Record<string, unknown> = {
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        audioType: "raw",
        encoding: "signed-integer",
        bits: 16,
        silence: "1.0",
        threshold: 0,
      };
      if (this.config.device) recordOptions.device = this.config.device;

      this.recordingProcess = recorder.record(recordOptions);

      this.recordingProcess.stream().on("data", (chunk: Buffer) => {
        this.chunks.push(chunk);
        this.chunksBytes += chunk.length;
        this.resetSilenceTimer();

        // Safety cap — flush if buffer exceeds limit to prevent memory leak
        if (this.chunksBytes >= MAX_BUFFER_BYTES) {
          this.flushAudio();
        }
      });

      this.recordingProcess.stream().on("error", (err: Error) => {
        vscode.window.showWarningMessage(`DreamChamber mic: ${err.message}`);
        this.stop();
      });

      this.onRecordingStateChange(true);
    } catch (err) {
      this.recording = false;
      vscode.window.showErrorMessage(
        `DreamChamber: Could not start recording. Is SoX installed? (brew install sox)`,
      );
    }
  }

  // ─── Stop recording ────────────────────────────────────────────────────────
  stop(): void {
    if (!this.recording) return;
    this.recording = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.recordingProcess) {
      try {
        this.recordingProcess.stop();
      } catch {
        /* ignore */
      }
      this.recordingProcess = null;
    }

    this.onRecordingStateChange(false);
    this.flushAudio();
  }

  toggle(): void {
    if (this.recording) this.stop();
    else this.start();
  }

  // ─── Silence detection → auto-segment ─────────────────────────────────────
  private resetSilenceTimer(): void {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      // Silence detected — flush current segment without stopping recording
      this.flushAudio();
    }, this.config.silenceDuration);
  }

  private flushAudio(): void {
    if (this.chunks.length === 0) return;
    const buffer = Buffer.concat(this.chunks);
    this.chunks = [];
    this.chunksBytes = 0;
    if (buffer.length > 1600) {
      // ignore tiny noise bursts (<100ms @ 16kHz 16bit)
      this.onAudioReady(buffer, this.config.sampleRate);
    }
  }

  dispose(): void {
    this.stop();
  }
}
