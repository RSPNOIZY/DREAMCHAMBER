/**
 * GABRIEL API client for the Family Legacy Portal.
 * Every call that touches estate data goes through here.
 * GORUNFREE · Constitutional invariants enforced server-side.
 */

const GABRIEL = process.env.NEXT_PUBLIC_GABRIEL_URL ?? 'http://10.90.90.10:7777';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GABRIEL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Member ────────────────────────────────────────────────────────────────────
export const getEstateStatus  = (hvs_id: string) => api<EstateMember>(`/estate/${hvs_id}`);
export const registerMember   = (hvs_id: string, full_name: string, relationship: string) =>
  api('/estate/member', { method: 'POST', body: JSON.stringify({ hvs_id, full_name, relationship }) });

// ── Transition ────────────────────────────────────────────────────────────────
export const triggerLegacyTransition = (hvs_id: string, actor: string) =>
  api('/estate/transition', { method: 'POST', body: JSON.stringify({ hvs_id, actor }) });

// ── Consent ───────────────────────────────────────────────────────────────────
export const grantConsent = (hvs_id: string, use_type: string, granted_by: string, scope?: string) =>
  api('/estate/consent', { method: 'POST', body: JSON.stringify({ hvs_id, use_type, granted_by, scope }) });

// ── Beneficiaries ─────────────────────────────────────────────────────────────
export const addBeneficiary = (hvs_id: string, name: string, wallet: string, pct: number) =>
  api('/estate/beneficiary', { method: 'POST', body: JSON.stringify({ hvs_id, name, wallet, pct }) });

// ── Audit ─────────────────────────────────────────────────────────────────────
export const getAuditTrail = (hvs_id: string) => api<{ audit: AuditEvent[] }>(`/estate/audit/${hvs_id}`);

// ── Voice to GABRIEL ──────────────────────────────────────────────────────────
export function connectVoiceSocket(onMessage: (text: string) => void): WebSocket {
  const ws = new WebSocket(`ws://10.90.90.10:7777/voice`);
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data) as { type: string; text: string };
    if (msg.type === 'gabriel') onMessage(msg.text);
  };
  return ws;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface EstateMember {
  member: {
    hvs_id: string;
    full_name: string;
    relationship: string;
    status: 'living' | 'transitioning' | 'legacy';
    voice_archive_path?: string;
    created_at: string;
    transitioned_at?: string;
  };
  beneficiaries: Beneficiary[];
  rules: UsageRule[];
}

export interface Beneficiary {
  id: number;
  hvs_id: string;
  beneficiary_name: string;
  wallet_or_account?: string;
  royalty_split_pct: number;
  priority: number;
  active: number;
}

export interface UsageRule {
  id: number;
  hvs_id?: string;
  asset_type: string;
  rule_key: string;
  rule_value: string;
  is_absolute: number;
}

export interface AuditEvent {
  id: number;
  hvs_id?: string;
  event_type: string;
  actor: string;
  payload?: string;
  ts: string;
}
