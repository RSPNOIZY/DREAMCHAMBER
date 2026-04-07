// ============================================================
// NOISY BOX — Royalty Engine
// 75/25 is sacred. GORUNFREE 1% is irremovable.
// ============================================================

import { SACRED, RoyaltySplit, UsageReceipt } from '../types';
import { ImmutableAuditLedger } from './audit';

export interface RoyaltyCalculation {
  gross: number;
  gorunfree_tithe: number;
  net_after_tithe: number;
  creator_amount: number;
  platform_amount: number;
  collaborator_amounts: { payee_id: string; amount: number; bps: number }[];
  splits: Omit<RoyaltySplit, 'id' | 'created_at'>[];
}

export class RoyaltyEngine {
  private db: D1Database;
  private audit: ImmutableAuditLedger;

  constructor(db: D1Database, audit: ImmutableAuditLedger) {
    this.db = db;
    this.audit = audit;
  }

  /**
   * Calculate royalty splits for a usage receipt.
   * Sacred invariants enforced:
   * - GORUNFREE 1% of gross is ALWAYS deducted first
   * - Creator gets >= 75% of net (after GORUNFREE)
   * - Platform gets remainder
   * - Collaborator splits come from platform's share, NEVER from creator's minimum
   */
  calculate(
    grossAmount: number,
    creatorId: string,
    collaborators: { payee_id: string; bps: number }[] = [],
    currency: string = 'USD'
  ): RoyaltyCalculation {
    // 1. GORUNFREE tithe — 1% of gross, always, irremovable
    const gorunfreeTithe = grossAmount * (SACRED.GORUNFREE_TITHE_BPS / 10000);
    const netAfterTithe = grossAmount - gorunfreeTithe;

    // 2. Creator gets minimum 75% of net
    const creatorAmount = netAfterTithe * (SACRED.ROYALTY_FLOOR_BPS / 10000);

    // 3. Platform + collaborators share the remaining 25%
    const platformPool = netAfterTithe - creatorAmount;

    // 4. Collaborator splits come from platform pool
    const totalCollabBps = collaborators.reduce((sum, c) => sum + c.bps, 0);
    if (totalCollabBps > 2500) {
      throw new Error(`Collaborator splits (${totalCollabBps} bps) exceed platform pool (2500 bps). Creator share is sacred.`);
    }

    const collaboratorAmounts = collaborators.map(c => ({
      payee_id: c.payee_id,
      amount: Math.round((netAfterTithe * c.bps / 10000) * 100) / 100,
      bps: c.bps,
    }));

    const totalCollabAmount = collaboratorAmounts.reduce((sum, c) => sum + c.amount, 0);
    const platformAmount = platformPool - totalCollabAmount;

    // Build split records
    const splits: Omit<RoyaltySplit, 'id' | 'created_at'>[] = [
      {
        receipt_id: '', // Set when writing
        payee_id: SACRED.GORUNFREE_RECIPIENT,
        payee_type: 'gorunfree',
        basis_points: SACRED.GORUNFREE_TITHE_BPS,
        amount: Math.round(gorunfreeTithe * 100) / 100,
        currency,
        status: 'pending',
      },
      {
        receipt_id: '',
        payee_id: creatorId,
        payee_type: 'creator',
        basis_points: SACRED.ROYALTY_FLOOR_BPS,
        amount: Math.round(creatorAmount * 100) / 100,
        currency,
        status: 'pending',
      },
      {
        receipt_id: '',
        payee_id: 'PLATFORM',
        payee_type: 'platform',
        basis_points: 2500 - totalCollabBps,
        amount: Math.round(platformAmount * 100) / 100,
        currency,
        status: 'pending',
      },
      ...collaboratorAmounts.map(c => ({
        receipt_id: '',
        payee_id: c.payee_id,
        payee_type: 'collaborator' as const,
        basis_points: c.bps,
        amount: c.amount,
        currency,
        status: 'pending' as const,
      })),
    ];

    return {
      gross: grossAmount,
      gorunfree_tithe: Math.round(gorunfreeTithe * 100) / 100,
      net_after_tithe: Math.round(netAfterTithe * 100) / 100,
      creator_amount: Math.round(creatorAmount * 100) / 100,
      platform_amount: Math.round(platformAmount * 100) / 100,
      collaborator_amounts: collaboratorAmounts,
      splits,
    };
  }

  /**
   * Write royalty splits to DB and audit log
   */
  async writeSplits(receiptId: string, calculation: RoyaltyCalculation): Promise<RoyaltySplit[]> {
    const written: RoyaltySplit[] = [];

    for (const split of calculation.splits) {
      const id = crypto.randomUUID();
      await this.db.prepare(`
        INSERT INTO royalty_splits (id, receipt_id, payee_id, payee_type, basis_points, amount, currency, routing, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, receiptId, split.payee_id, split.payee_type, split.basis_points, split.amount, split.currency, split.routing || null, split.status).run();

      const record: RoyaltySplit = { id, ...split, receipt_id: receiptId, created_at: new Date().toISOString() };
      written.push(record);

      await this.audit.append({
        event_type: 'royalty.split',
        actor_id: 'SYSTEM',
        actor_type: 'system',
        resource_type: 'royalty_split',
        resource_id: id,
        action: 'create',
        metadata: { receipt_id: receiptId, payee_id: split.payee_id, payee_type: split.payee_type, amount: split.amount, bps: split.basis_points },
      });
    }

    return written;
  }

  /**
   * Get all splits for a receipt
   */
  async getSplitsForReceipt(receiptId: string): Promise<RoyaltySplit[]> {
    const result = await this.db
      .prepare('SELECT * FROM royalty_splits WHERE receipt_id = ? ORDER BY basis_points DESC')
      .bind(receiptId)
      .all<RoyaltySplit>();
    return result.results || [];
  }

  /**
   * Get GORUNFREE tithe report
   */
  async getGorunfreeReport(): Promise<{ total_tithe: number; total_receipts: number; recent: RoyaltySplit[] }> {
    const total = await this.db
      .prepare("SELECT SUM(amount) as total, COUNT(*) as count FROM royalty_splits WHERE payee_type = 'gorunfree'")
      .first<{ total: number; count: number }>();

    const recent = await this.db
      .prepare("SELECT * FROM royalty_splits WHERE payee_type = 'gorunfree' ORDER BY created_at DESC LIMIT 20")
      .all<RoyaltySplit>();

    return {
      total_tithe: total?.total || 0,
      total_receipts: total?.count || 0,
      recent: recent.results || [],
    };
  }
}
