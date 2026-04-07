/**
 * NOIZY Empire — React Consent Gate Component Template
 * Constitutional: No interaction proceeds without explicit consent capture.
 * GORUNFREE · Gospel Deal enforced at the UI layer.
 *
 * Usage:
 *   <ConsentGate hvs_id="rsp001" useType="voice_synthesis" onGranted={() => ...}>
 *     <YourProtectedComponent />
 *   </ConsentGate>
 */

import React, { useState, useEffect, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConsentGateProps {
  hvs_id: string;
  useType: string;
  grantedBy: string;
  scope?: string;
  expiresAt?: string;
  onGranted?: () => void;
  onDenied?: () => void;
  gabrielUrl?: string;
  children: ReactNode;
}

interface ConsentState {
  status: 'checking' | 'granted' | 'pending' | 'denied' | 'error';
  error?: string;
}

// ── GORUNFREE Disclosure ──────────────────────────────────────────────────────
const GOSPEL_DISCLOSURE = `
By granting consent you confirm:
• Your voice and likeness are protected under the NOIZY Constitutional Framework
• 75% founding royalty floor is irrevocable
• 1% of all royalties flow to NOIZYKIDZ (GORUNFREE Trust Clause)
• This consent is logged to an immutable audit trail
• You may revoke at any time — your kill switch is absolute
`.trim();

// ── Hook: consent status ──────────────────────────────────────────────────────
function useConsentStatus(
  hvs_id: string,
  useType: string,
  gabrielUrl: string
): ConsentState {
  const [state, setState] = useState<ConsentState>({ status: 'checking' });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${gabrielUrl}/estate/${encodeURIComponent(hvs_id)}`);
        if (!res.ok) { setState({ status: 'pending' }); return; }

        const data = await res.json() as { member: unknown; beneficiaries: unknown[] };
        if (!data.member) { setState({ status: 'pending' }); return; }

        // Check consent via GABRIEL estate endpoint
        const consentRes = await fetch(
          `${gabrielUrl}/estate/consent/check?hvs_id=${hvs_id}&use_type=${useType}`
        );
        const { granted } = consentRes.ok
          ? (await consentRes.json() as { granted: boolean })
          : { granted: false };

        if (!cancelled) setState({ status: granted ? 'granted' : 'pending' });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', error: (e as Error).message });
      }
    }

    check();
    return () => { cancelled = true; };
  }, [hvs_id, useType, gabrielUrl]);

  return state;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ConsentGate({
  hvs_id,
  useType,
  grantedBy,
  scope,
  expiresAt,
  onGranted,
  onDenied,
  gabrielUrl = 'http://10.90.90.10:7777',
  children,
}: ConsentGateProps) {
  const consent = useConsentStatus(hvs_id, useType, gabrielUrl);
  const [submitting, setSubmitting] = useState(false);
  const [disclosed, setDisclosed] = useState(false);

  async function handleGrant() {
    setSubmitting(true);
    try {
      const res = await fetch(`${gabrielUrl}/estate/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hvs_id, use_type: useType, granted_by: grantedBy, scope, expires_at: expiresAt }),
      });
      if (!res.ok) throw new Error('Consent grant failed');
      onGranted?.();
      // Reload page to re-check
      window.location.reload();
    } catch (e) {
      alert(`Consent error: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (consent.status === 'checking') {
    return (
      <div style={styles.gate}>
        <span style={styles.muted}>Verifying consent… GABRIEL checking constitutional record</span>
      </div>
    );
  }

  if (consent.status === 'granted') {
    return <>{children}</>;
  }

  // Consent pending or denied — show gate
  return (
    <div style={styles.gate}>
      <div style={styles.header}>
        <span style={styles.logo}>⬛ NOIZY</span>
        <span style={styles.badge}>CONSENT REQUIRED</span>
      </div>

      <p style={styles.body}>
        This feature requires your explicit consent for <strong>{useType}</strong>.
        Your consent is recorded to GABRIEL's immutable audit trail.
      </p>

      {!disclosed ? (
        <button style={styles.btnSecondary} onClick={() => setDisclosed(true)}>
          Read Constitutional Disclosure
        </button>
      ) : (
        <pre style={styles.disclosure}>{GOSPEL_DISCLOSURE}</pre>
      )}

      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.btnGrant }}
          onClick={handleGrant}
          disabled={submitting || !disclosed}
        >
          {submitting ? 'Granting…' : 'Grant Consent'}
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnDeny }}
          onClick={onDenied}
          disabled={submitting}
        >
          Deny
        </button>
      </div>

      <p style={styles.footnote}>
        GORUNFREE · 1% NOIZYKIDZ · Kill switch absolute · Audit trail immutable
      </p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  gate: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 6,
    padding: 24,
    fontFamily: "'Fira Code', monospace",
    color: '#e0e0e0',
    maxWidth: 480,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { color: '#00ffcc', fontWeight: 700, letterSpacing: '0.1em' },
  badge: { fontSize: 11, letterSpacing: '0.1em', color: '#f39c12', border: '1px solid #f39c12', padding: '2px 8px', borderRadius: 3 },
  body: { fontSize: 13, lineHeight: 1.6, marginBottom: 16, color: '#ccc' },
  disclosure: { background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, padding: 12, fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16, color: '#aaa' },
  actions: { display: 'flex', gap: 10, marginBottom: 12 },
  btn: { flex: 1, padding: '10px 16px', fontFamily: "'Fira Code', monospace", fontSize: 12, cursor: 'pointer', borderRadius: 3, border: 'none' },
  btnGrant: { background: '#00ffcc', color: '#000', fontWeight: 700 },
  btnDeny: { background: '#222', color: '#666', border: '1px solid #333' },
  btnSecondary: { background: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 12px', fontFamily: "'Fira Code', monospace", fontSize: 11, cursor: 'pointer', borderRadius: 3, marginBottom: 12 },
  footnote: { fontSize: 10, color: '#444', letterSpacing: '0.05em' },
  muted: { color: '#666', fontSize: 12 },
};

export default ConsentGate;
