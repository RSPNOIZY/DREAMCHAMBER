import { readFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

function loadEnv() {
  const envPath = resolve(homedir(), 'NOIZYLAB', '.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env not found — rely on process.env
  }
}

loadEnv();

export const ENDPOINTS = {
  gabriel:      'http://localhost:7777',
  health:       'http://localhost:9090',
  noizystream:  'http://localhost:4040',
  voiceBridge:  'http://localhost:8080',
  ollama:       'http://localhost:11434',
  heaven:       'https://heaven.rsp-5f3.workers.dev',
  empire:       'http://localhost:5500',
};

export const VOICE_AUTH_TOKEN = process.env.VOICE_AUTH_TOKEN || '';

export const WORKERS_DIR = resolve(homedir(), 'Desktop', 'HEAVEN');
export const DOCS_DIR = resolve(homedir(), 'NOIZYLAB', 'docs');

export const SERVICE_MAP = [
  { name: 'GABRIEL',       url: `${ENDPOINTS.gabriel}/status`,       port: 7777  },
  { name: 'Health Monitor', url: `${ENDPOINTS.health}/api/status`,   port: 9090  },
  { name: 'NOIZYSTREAM',   url: `${ENDPOINTS.noizystream}/status`,   port: 4040  },
  { name: 'Voice Bridge',  url: `${ENDPOINTS.voiceBridge}/status`,   port: 8080  },
  { name: 'Ollama',        url: `${ENDPOINTS.ollama}/api/tags`,      port: 11434 },
  { name: 'Heaven Worker',  url: `${ENDPOINTS.heaven}/status`,       port: 'edge' },
  { name: 'Empire Codex',  url: `${ENDPOINTS.empire}/status`,        port: 5500  },
];
