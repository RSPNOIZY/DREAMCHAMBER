/**
 * NOIZY Receipt Engine
 *
 * Enforces the Gospel Deal (75/25 creator-first split) and the
 * GORUNFREE Trust Clause (1% irremovable tithe to NOIZYKIDZ).
 *
 * SACRED INVARIANTS:
 *   - creator royalty_split >= 0.75 (75%)
 *   - GORUNFREE tithe = 1% of gross — irremovable
 *   - Every receipt is hashed and logged to the immutable audit ledger
 */

export interface ReceiptParams {
  transactionType: "synthesis" | "license" | "royalty" | "derivative";
  creatorId: string;
  requesterId: string;
  grossAmount: number;
  creatorSplitRatio?: number; // defaults to 0.75, cannot go below
  audioFingerprintId?: string;
  consentRecordId?: string;
  currency?: string;
}

export interface Receipt {
  id: string;
  transaction_type: string;
  creator_id: string;
  requester_id: string;
  audio_fingerprint_id: string | null;
  gross_amount: number;
  creator_share: number;
  platform_share: number;
  gorunfree_tithe: number;
  gorunfree_recipient: string;
  creator_net: number;
  platform_net: number;
  currency: string;
  receipt_hash: string;
  consent_record_id: string | null;
  created_at: string;
}

const FOUNDER_FLOOR = 0.75;
const GORUNFREE_RATE = 0.01;
const GORUNFREE_RECIPIENT = "NOIZYKIDZ";

export class ReceiptEngine {
  constructor(private db: D1Database) {}

  /**
   * Generate a receipt with enforced Gospel Deal economics.
   * Rejects any split below 75% for the creator.
   * Always deducts 1% GORUNFREE tithe from gross before splitting.
   */
  async generateReceipt(params: ReceiptParams): Promise<Receipt> {
    const splitRatio = params.creatorSplitRatio ?? FOUNDER_FLOOR;

    // SACRED INVARIANT: founding member royalty_split must be >= 0.75
    if (splitRatio < FOUNDER_FLOOR) {
      throw new Error(
        `GORUNFREE: Creator split ${splitRatio} violates founding floor of ${FOUNDER_FLOOR}`,
      );
    }

    if (params.grossAmount <= 0) {
      throw new Error("Gross amount must be positive");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // GORUNFREE Trust Clause: 1% of gross to NOIZYKIDZ — irremovable
    const gorunfreeTithe = Math.round(params.grossAmount * GORUNFREE_RATE * 100) / 100;
    const distributable = params.grossAmount - gorunfreeTithe;

    // Gospel Deal split on the remaining 99%
    const creatorShare = Math.round(distributable * splitRatio * 100) / 100;
    const platformShare = Math.round((distributable - creatorShare) * 100) / 100;

    const receipt: Receipt = {
      id,
      transaction_type: params.transactionType,
      creator_id: params.creatorId,
      requester_id: params.requesterId,
      audio_fingerprint_id: params.audioFingerprintId || null,
      gross_amount: params.grossAmount,
      creator_share: creatorShare,
      platform_share: platformShare,
      gorunfree_tithe: gorunfreeTithe,
      gorunfree_recipient: GORUNFREE_RECIPIENT,
      creator_net: creatorShare,
      platform_net: platformShare,
      currency: params.currency || "USD",
      receipt_hash: "", // computed below
      consent_record_id: params.consentRecordId || null,
      created_at: now,
    };

    // Hash the receipt for integrity verification
    receipt.receipt_hash = await this.hashReceipt(receipt);

    // Store in D1
    await this.db
      .prepare(
        `INSERT INTO receipts
        (id, transaction_type, creator_id, requester_id, audio_fingerprint_id,
         gross_amount, creator_share, platform_share, gorunfree_tithe, gorunfree_recipient,
         creator_net, platform_net, currency, receipt_hash, consent_record_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        receipt.id,
        receipt.transaction_type,
        receipt.creator_id,
        receipt.requester_id,
        receipt.audio_fingerprint_id,
        receipt.gross_amount,
        receipt.creator_share,
        receipt.platform_share,
        receipt.gorunfree_tithe,
        receipt.gorunfree_recipient,
        receipt.creator_net,
        receipt.platform_net,
        receipt.currency,
        receipt.receipt_hash,
        receipt.consent_record_id,
        receipt.created_at,
      )
      .run();

    return receipt;
  }

  /**
   * Retrieve a receipt by ID
   */
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    return this.db
      .prepare("SELECT * FROM receipts WHERE id = ?")
      .bind(receiptId)
      .first<Receipt>();
  }

  /**
   * Verify receipt integrity — recompute hash and compare
   */
  async verifyReceipt(receiptId: string): Promise<{ valid: boolean; receipt: Receipt | null }> {
    const receipt = await this.getReceipt(receiptId);
    if (!receipt) return { valid: false, receipt: null };

    const storedHash = receipt.receipt_hash;
    receipt.receipt_hash = "";
    const expectedHash = await this.hashReceipt(receipt);
    receipt.receipt_hash = storedHash;

    return {
      valid: storedHash === expectedHash,
      receipt,
    };
  }

  /**
   * Get all receipts for a creator with totals
   */
  async getCreatorReceipts(
    creatorId: string,
    limit = 50,
  ): Promise<{
    receipts: Receipt[];
    totals: {
      gross: number;
      creator_earned: number;
      gorunfree_contributed: number;
      transaction_count: number;
    };
  }> {
    const receipts = await this.db
      .prepare(
        "SELECT * FROM receipts WHERE creator_id = ? ORDER BY created_at DESC LIMIT ?",
      )
      .bind(creatorId, limit)
      .all<Receipt>();

    const totals = await this.db
      .prepare(
        `SELECT
          COALESCE(SUM(gross_amount), 0) as gross,
          COALESCE(SUM(creator_net), 0) as creator_earned,
          COALESCE(SUM(gorunfree_tithe), 0) as gorunfree_contributed,
          COUNT(*) as transaction_count
        FROM receipts WHERE creator_id = ?`,
      )
      .bind(creatorId)
      .first<{
        gross: number;
        creator_earned: number;
        gorunfree_contributed: number;
        transaction_count: number;
      }>();

    return {
      receipts: receipts.results,
      totals: totals || { gross: 0, creator_earned: 0, gorunfree_contributed: 0, transaction_count: 0 },
    };
  }

  /**
   * Get GORUNFREE tithe totals (transparency report)
   */
  async getGorunfreeReport(): Promise<{
    total_tithe: number;
    recipient: string;
    transaction_count: number;
    by_type: Record<string, number>;
  }> {
    const total = await this.db
      .prepare(
        `SELECT
          COALESCE(SUM(gorunfree_tithe), 0) as total_tithe,
          COUNT(*) as transaction_count
        FROM receipts`,
      )
      .first<{ total_tithe: number; transaction_count: number }>();

    const byType = await this.db
      .prepare(
        `SELECT transaction_type, COALESCE(SUM(gorunfree_tithe), 0) as tithe
        FROM receipts GROUP BY transaction_type`,
      )
      .all<{ transaction_type: string; tithe: number }>();

    const typeMap: Record<string, number> = {};
    for (const row of byType.results) {
      typeMap[row.transaction_type] = row.tithe;
    }

    return {
      total_tithe: total?.total_tithe || 0,
      recipient: GORUNFREE_RECIPIENT,
      transaction_count: total?.transaction_count || 0,
      by_type: typeMap,
    };
  }

  private async hashReceipt(receipt: Receipt): Promise<string> {
    const data = JSON.stringify({
      id: receipt.id,
      transaction_type: receipt.transaction_type,
      creator_id: receipt.creator_id,
      requester_id: receipt.requester_id,
      gross_amount: receipt.gross_amount,
      creator_share: receipt.creator_share,
      platform_share: receipt.platform_share,
      gorunfree_tithe: receipt.gorunfree_tithe,
      created_at: receipt.created_at,
    });
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
