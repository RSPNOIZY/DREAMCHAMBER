declare module 'node-record-lpcm16' {
  import { Readable } from 'stream';

  interface RecordOptions {
    sampleRate?: number;
    channels?: number;
    audioType?: string;
    encoding?: string;
    bits?: number;
    silence?: string;
    threshold?: number;
    device?: string;
    [key: string]: unknown;
  }

  interface Recording {
    stream(): Readable;
    stop(): void;
    pause(): void;
    resume(): void;
  }

  export function record(options?: RecordOptions): Recording;
}
