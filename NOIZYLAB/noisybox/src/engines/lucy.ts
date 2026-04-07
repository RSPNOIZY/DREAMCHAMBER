// ============================================================
// NOISY BOX — Lucy's Observation Engine
// Advice-driven, creator-first. Never overrides creator agency.
// Lucy reasons before she touches anything.
// ============================================================

import { LucyObservation } from '../types';
import { ImmutableAuditLedger } from './audit';

export class LucyEngine {
  private db: D1Database;
  private audit: ImmutableAuditLedger;

  constructor(db: D1Database, audit: ImmutableAuditLedger) {
    this.db = db;
    this.audit = audit;
  }

  /**
   * Record an observation — Lucy sees patterns, trends, opportunities
   */
  async observe(params: {
    type: LucyObservation['observation_type'];
    subjectType: LucyObservation['subject_type'];
    subjectId?: string;
    observation: string;
    confidence: number;
    dataPoints?: any;
  }): Promise<LucyObservation> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO lucy_observations (id, observation_type, subject_type, subject_id, observation, confidence, data_points, acted_on, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      id, params.type, params.subjectType, params.subjectId || null,
      params.observation, params.confidence,
      params.dataPoints ? JSON.stringify(params.dataPoints) : null,
      now
    ).run();

    await this.audit.append({
      event_type: 'lucy.observation',
      actor_id: 'LUCY',
      actor_type: 'lucy',
      resource_type: params.subjectType,
      resource_id: params.subjectId || 'global',
      action: 'observe',
      metadata: { observation_type: params.type, confidence: params.confidence },
    });

    return {
      id,
      observation_type: params.type,
      subject_type: params.subjectType,
      subject_id: params.subjectId,
      observation: params.observation,
      confidence: params.confidence,
      data_points: params.dataPoints,
      acted_on: false,
      created_at: now,
    };
  }

  /**
   * Analyze creator activity and generate observations
   */
  async analyzeCreator(creatorId: string): Promise<LucyObservation[]> {
    const observations: LucyObservation[] = [];

    // Check session frequency
    const sessions = await this.db
      .prepare("SELECT COUNT(*) as count, session_type FROM sessions WHERE creator_id = ? GROUP BY session_type")
      .bind(creatorId)
      .all<{ count: number; session_type: string }>();

    if (sessions.results && sessions.results.length > 0) {
      const totalSessions = sessions.results.reduce((sum, s) => sum + s.count, 0);
      if (totalSessions >= 3) {
        const mostCommon = sessions.results.sort((a, b) => b.count - a.count)[0];
        observations.push(await this.observe({
          type: 'pattern',
          subjectType: 'creator',
          subjectId: creatorId,
          observation: `Creator shows strong ${mostCommon.session_type} pattern with ${mostCommon.count} sessions. Consider expanding character range.`,
          confidence: 0.7,
          dataPoints: { session_counts: sessions.results },
        }));
      }
    }

    // Check auth scores
    const scores = await this.db.prepare(`
      SELECT AVG(a.overall_score) as avg_score, COUNT(*) as count
      FROM auth_scores a
      JOIN takes t ON a.take_id = t.id
      JOIN sessions s ON t.session_id = s.id
      WHERE s.creator_id = ?
    `).bind(creatorId).first<{ avg_score: number; count: number }>();

    if (scores && scores.count > 0) {
      if (scores.avg_score >= 0.85) {
        observations.push(await this.observe({
          type: 'opportunity',
          subjectType: 'creator',
          subjectId: creatorId,
          observation: `Exceptional voice quality (avg ${(scores.avg_score * 100).toFixed(1)}%). Ready for premium character work and enterprise licensing.`,
          confidence: 0.8,
          dataPoints: { avg_score: scores.avg_score, sample_count: scores.count },
        }));
      }
    }

    // Check revenue patterns
    const revenue = await this.db.prepare(`
      SELECT SUM(r.amount) as total, r.payee_type, COUNT(*) as count
      FROM royalty_splits r
      JOIN usage_receipts u ON r.receipt_id = u.id
      WHERE r.payee_id = ?
      GROUP BY r.payee_type
    `).bind(creatorId).all<{ total: number; payee_type: string; count: number }>();

    if (revenue.results && revenue.results.length > 0) {
      const totalRevenue = revenue.results.reduce((sum, r) => sum + r.total, 0);
      if (totalRevenue > 0) {
        observations.push(await this.observe({
          type: 'trend',
          subjectType: 'creator',
          subjectId: creatorId,
          observation: `Creator has earned $${totalRevenue.toFixed(2)} across ${revenue.results.reduce((s, r) => s + r.count, 0)} transactions. Revenue trending.`,
          confidence: 0.9,
          dataPoints: { revenue_by_type: revenue.results },
        }));
      }
    }

    return observations;
  }

  /**
   * Get unread observations for a creator
   */
  async getUnread(subjectType?: string, subjectId?: string): Promise<LucyObservation[]> {
    let query = 'SELECT * FROM lucy_observations WHERE acted_on = 0';
    const params: any[] = [];

    if (subjectType) {
      query += ' AND subject_type = ?';
      params.push(subjectType);
    }
    if (subjectId) {
      query += ' AND subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY confidence DESC, created_at DESC LIMIT 50';

    const result = await this.db.prepare(query).bind(...params).all<LucyObservation>();
    return result.results || [];
  }

  /**
   * Mark observation as seen/acted on
   */
  async markActedOn(observationId: string): Promise<void> {
    await this.db.prepare('UPDATE lucy_observations SET acted_on = 1 WHERE id = ?').bind(observationId).run();
  }
}
