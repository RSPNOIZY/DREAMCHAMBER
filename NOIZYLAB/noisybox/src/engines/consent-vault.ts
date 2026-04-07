// ============================================================
// NOISY BOX — Consent Vault
// Consent is architecture, not a checkbox.
// Once created, consent profiles are IMMUTABLE.
// Revocation creates a NEW record with status='revoked'.
// ============================================================

import { ConsentProfile } from '../types';
import { ImmutableAuditLedger } from './audit';

export interface NeverClause {
  clause: string;          // e.g., 'no_political_ads', 'no_adult_content', 'no_weapons_marketing'
  description: string;
  severity: 'absolute' | 'contextual';  // absolute = never ever, contextual = depends on use case
}

export class ConsentVault {
  private db: D1Database;
  private audit: ImmutableAuditLedger;

  constructor(db: D1Database, audit: ImmutableAuditLedger) {
    this.db = db;
    this.audit = audit;
  }

  /**
   * Grant consent — creates an immutable consent profile.
   * Once written, this record NEVER changes. Revocation creates a new record.
   */
  async grantConsent(params: {
    creatorId: string;
    neverClauses: NeverClause[];
    termsVersion?: string;
    expiresAt?: string;
  }): Promise<ConsentProfile> {
    const id = crypto.randomUUID();
    const tokenId = `ct_${crypto.randomUUID().replace(/-/g, '')}`;

    // Hash the consent document
    const consentDoc = JSON.stringify({
      creator_id: params.creatorId,
      never_clauses: params.neverClauses,
      terms_version: params.termsVersion || '1.0',
      granted_at: new Date().toISOString(),
    });
    const consentHash = await this.sha256(consentDoc);

    // Hash the never-clauses specifically
    const neverClausesJson = JSON.stringify(params.neverClauses);
    const neverClausesHash = await this.sha256(neverClausesJson);

    const profile: ConsentProfile = {
      id,
      creator_id: params.creatorId,
      consent_hash: consentHash,
      never_clauses_hash: neverClausesHash,
      never_clauses_json: neverClausesJson,
      token_id: tokenId,
      terms_version: params.termsVersion || '1.0',
      status: 'active',
      granted_at: new Date().toISOString(),
      expires_at: params.expiresAt,
      created_at: new Date().toISOString(),
    };

    await this.db.prepare(`
      INSERT INTO consent_profiles (id, creator_id, consent_hash, never_clauses_hash, never_clauses_json, token_id, terms_version, status, granted_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      profile.id, profile.creator_id, profile.consent_hash,
      profile.never_clauses_hash, profile.never_clauses_json,
      profile.token_id, profile.terms_version, profile.status,
      profile.granted_at, profile.expires_at || null
    ).run();

    await this.audit.append({
      event_type: 'consent.grant',
      actor_id: params.creatorId,
      actor_type: 'creator',
      resource_type: 'consent_profile',
      resource_id: id,
      action: 'create',
      metadata: {
        never_clauses_count: params.neverClauses.length,
        terms_version: profile.terms_version,
        consent_hash: consentHash,
      },
    });

    return profile;
  }

  /**
   * Revoke consent — does NOT modify the original record.
   * Creates a new audit entry and updates status field.
   * The original consent_hash and never_clauses_hash remain as historical proof.
   */
  async revokeConsent(consentId: string, creatorId: string, reason: string): Promise<ConsentProfile> {
    const existing = await this.getById(consentId);
    if (!existing) throw new Error(`Consent profile ${consentId} not found`);
    if (existing.creator_id !== creatorId) throw new Error('Only the creator can revoke their own consent');
    if (existing.status === 'revoked') throw new Error('Consent already revoked');

    const now = new Date().toISOString();
    await this.db.prepare(`
      UPDATE consent_profiles SET status = 'revoked', revoked_at = ?, revocation_reason = ? WHERE id = ?
    `).bind(now, reason, consentId).run();

    await this.audit.append({
      event_type: 'consent.revoke',
      actor_id: creatorId,
      actor_type: 'creator',
      resource_type: 'consent_profile',
      resource_id: consentId,
      action: 'revoke',
      metadata: { reason, original_consent_hash: existing.consent_hash },
    });

    return { ...existing, status: 'revoked', revoked_at: now, revocation_reason: reason };
  }

  /**
   * Check if consent is valid for a given creator and usage
   */
  async checkConsent(creatorId: string, usageContext?: string): Promise<{
    authorized: boolean;
    consent_profile?: ConsentProfile;
    reason?: string;
  }> {
    const active = await this.db
      .prepare("SELECT * FROM consent_profiles WHERE creator_id = ? AND status = 'active' ORDER BY granted_at DESC LIMIT 1")
      .bind(creatorId)
      .first<ConsentProfile>();

    if (!active) {
      return { authorized: false, reason: 'No active consent profile found' };
    }

    // Check expiration
    if (active.expires_at && new Date(active.expires_at) < new Date()) {
      return { authorized: false, reason: 'Consent has expired', consent_profile: active };
    }

    // Check never clauses against usage context
    if (usageContext) {
      const neverClauses: NeverClause[] = JSON.parse(active.never_clauses_json);
      for (const clause of neverClauses) {
        if (clause.severity === 'absolute' && usageContext.toLowerCase().includes(clause.clause.toLowerCase())) {
          return {
            authorized: false,
            reason: `Blocked by never-clause: ${clause.clause} (${clause.description})`,
            consent_profile: active,
          };
        }
      }
    }

    return { authorized: true, consent_profile: active };
  }

  async getById(id: string): Promise<ConsentProfile | null> {
    return await this.db.prepare('SELECT * FROM consent_profiles WHERE id = ?').bind(id).first<ConsentProfile>();
  }

  async getActiveForCreator(creatorId: string): Promise<ConsentProfile[]> {
    const result = await this.db
      .prepare("SELECT * FROM consent_profiles WHERE creator_id = ? AND status = 'active' ORDER BY granted_at DESC")
      .bind(creatorId)
      .all<ConsentProfile>();
    return result.results || [];
  }

  private async sha256(input: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
