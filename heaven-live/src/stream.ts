export interface StreamState {
  isLive: boolean;
  showName: string;
  platform: string;
  startedAt?: string;
  endedAt?: string;
  streamUrl?: string;
}

const STATE_KEY = 'heaven:stream:state';

export async function getStreamState(kv: KVNamespace): Promise<StreamState> {
  const raw = await kv.get(STATE_KEY);
  if (!raw) {
    return { isLive: false, showName: '', platform: 'Cloudflare Stream' };
  }
  return JSON.parse(raw) as StreamState;
}

export async function setStreamState(kv: KVNamespace, state: StreamState): Promise<void> {
  await kv.put(STATE_KEY, JSON.stringify(state));
}
