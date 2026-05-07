import { postDiscordAnnouncement } from './discord';
import { getStreamState, setStreamState, StreamState } from './stream';

export interface Env {
  DISCORD_WEBHOOK_URL: string;
  HEAVEN_KV: KVNamespace;
  HEAVEN_API_KEY: string;
}

function requireApiKey(request: Request, env: Env): Response | null {
  const key = request.headers.get('X-Heaven-Key');
  if (key !== env.HEAVEN_API_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return null;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'GET' && url.pathname === '/status') {
      const state = await getStreamState(env.HEAVEN_KV);
      return json(state);
    }

    if (method === 'POST' && url.pathname === '/go-live') {
      const authError = requireApiKey(request, env);
      if (authError) return authError;

      const body = await request.json<{ showName?: string; streamUrl?: string; platform?: string }>();
      const showName = body.showName ?? 'Noizy.AI — Heavenly Setup';
      const platform = body.platform ?? 'Cloudflare Stream';
      const streamUrl = body.streamUrl;

      const state: StreamState = {
        isLive: true,
        showName,
        platform,
        startedAt: new Date().toISOString(),
        streamUrl,
      };

      await setStreamState(env.HEAVEN_KV, state);
      await postDiscordAnnouncement(env.DISCORD_WEBHOOK_URL, {
        showName,
        status: 'LIVE',
        platform,
        streamUrl,
      });

      return json({ ok: true, state });
    }

    if (method === 'POST' && url.pathname === '/go-offline') {
      const authError = requireApiKey(request, env);
      if (authError) return authError;

      const current = await getStreamState(env.HEAVEN_KV);
      const state: StreamState = {
        ...current,
        isLive: false,
        endedAt: new Date().toISOString(),
      };

      await setStreamState(env.HEAVEN_KV, state);
      await postDiscordAnnouncement(env.DISCORD_WEBHOOK_URL, {
        showName: current.showName || 'Noizy.AI — Heavenly Setup',
        status: 'OFFLINE',
        platform: current.platform || 'Cloudflare Stream',
      });

      return json({ ok: true, state });
    }

    return json({ error: 'Not found' }, 404);
  },
};
