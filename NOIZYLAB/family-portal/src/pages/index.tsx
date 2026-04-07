/**
 * NOIZY Family Legacy Portal — Home
 * GORUNFREE · Sovereign · Constitutional
 *
 * Pages to build:
 *   /              — Family home (this file, status overview)
 *   /upload        — Voice archive upload flow
 *   /beneficiaries — Royalty routing setup
 *   /legacy        — Post-transition view (activated automatically)
 *   /arrangements  — Therapeutic arrangements catalog
 *   /audit         — Immutable audit trail viewer
 */

import React, { useEffect, useState } from 'react';
import { getEstateStatus, connectVoiceSocket, EstateMember } from '../lib/gabriel';

// TODO: replace with actual family hvs_id from auth
const FAMILY_HVS_ID = process.env.NEXT_PUBLIC_FAMILY_HVS_ID ?? 'rsp001';

export default function FamilyPortalHome() {
  const [estate, setEstate] = useState<EstateMember | null>(null);
  const [gabrielMsg, setGabrielMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load estate status
  useEffect(() => {
    getEstateStatus(FAMILY_HVS_ID)
      .then(setEstate)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Connect GABRIEL voice socket
  useEffect(() => {
    const ws = connectVoiceSocket(setGabrielMsg);
    return () => ws.close();
  }, []);

  const isLegacyMode = estate?.member?.status === 'legacy';

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>⬛ NOIZY</span>
        <span style={{ ...styles.badge, ...(isLegacyMode ? styles.badgeLegacy : styles.badgeLiving) }}>
          {isLegacyMode ? 'LEGACY MODE' : 'LIVING'}
        </span>
      </header>

      {loading && <p style={styles.muted}>Loading family vault…</p>}
      {error && <p style={styles.error}>GABRIEL: {error}</p>}

      {estate && (
        <>
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>{estate.member.full_name}</h2>
            <p style={styles.muted}>{estate.member.relationship} · {estate.member.hvs_id}</p>
            {isLegacyMode && (
              <p style={styles.legacyNote}>
                This portal has transitioned to Legacy Mode.
                All royalties are flowing to your designated beneficiaries.
              </p>
            )}
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Royalty Routing</h3>
            {estate.beneficiaries.length === 0
              ? <p style={styles.muted}>No beneficiaries configured yet.</p>
              : estate.beneficiaries.map(b => (
                <div key={b.id} style={styles.beneficiaryRow}>
                  <span>{b.beneficiary_name}</span>
                  <span style={styles.accent}>{b.royalty_split_pct}%</span>
                </div>
              ))
            }
          </section>
        </>
      )}

      {gabrielMsg && (
        <section style={styles.gabrielPanel}>
          <span style={styles.gabrielLabel}>GABRIEL</span>
          <p style={styles.gabrielText}>{gabrielMsg}</p>
        </section>
      )}

      <nav style={styles.nav}>
        <a href="/upload" style={styles.navBtn}>Voice Archive Upload</a>
        <a href="/beneficiaries" style={styles.navBtn}>Beneficiaries</a>
        <a href="/arrangements" style={styles.navBtn}>Therapeutic Arrangements</a>
        <a href="/audit" style={styles.navBtn}>Audit Trail</a>
      </nav>

      <footer style={styles.footer}>
        GORUNFREE · 1% NOIZYKIDZ · Kill switch absolute · Consent immutable
      </footer>
    </main>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0a0a0a', minHeight: '100vh', color: '#e0e0e0', fontFamily: "'Fira Code', monospace", padding: '24px 20px', maxWidth: 640, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  logo: { color: '#00ffcc', fontWeight: 700, letterSpacing: '0.15em' },
  badge: { fontSize: 11, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 3, border: '1px solid' },
  badgeLiving: { color: '#00ffcc', borderColor: '#00ffcc' },
  badgeLegacy: { color: '#f39c12', borderColor: '#f39c12' },
  card: { background: '#111', border: '1px solid #222', borderRadius: 6, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' },
  muted: { color: '#666', fontSize: 12 },
  error: { color: '#e74c3c', fontSize: 12 },
  accent: { color: '#00ffcc' },
  legacyNote: { marginTop: 12, padding: 12, background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.3)', borderRadius: 4, fontSize: 12, color: '#f39c12', lineHeight: 1.6 },
  beneficiaryRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 },
  gabrielPanel: { background: '#0d1117', border: '1px solid #00ffcc33', borderLeft: '3px solid #00ffcc', borderRadius: 4, padding: '12px 16px', marginBottom: 16 },
  gabrielLabel: { fontSize: 10, color: '#00ffcc', letterSpacing: '0.15em', display: 'block', marginBottom: 6 },
  gabrielText: { fontSize: 13, lineHeight: 1.6, color: '#ccc' },
  nav: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 24, marginBottom: 32 },
  navBtn: { display: 'block', background: '#111', border: '1px solid #222', color: '#888', padding: '12px 16px', textDecoration: 'none', borderRadius: 4, fontSize: 12, textAlign: 'center', letterSpacing: '0.05em' },
  footer: { fontSize: 10, color: '#333', letterSpacing: '0.05em', textAlign: 'center', paddingTop: 24, borderTop: '1px solid #1a1a1a' },
};
