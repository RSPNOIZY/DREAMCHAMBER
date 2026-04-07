// ============================================================
// NOISY FISH — Immutable Audit Ledger
// Same chain discipline as NOISY BOX. Append-only. Hash-chained.
// ============================================================

export interface AuditLogEntry {
  id: string;
  event_type: string;
  actor_id: string;
  actor_type: string;
  resource_type: string;
  resource_id: string;
  action: string;
  metadata?: any;
  timestamp: string;
  block_hash: string;
  previous_hash: string;
}

export class ImmutableAuditLedger {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async append(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'block_hash' | 'previous_hash'>): Promise<AuditLogEntry> {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const lastEntry = await this.db
      .prepare('SELECT block_hash FROM audit_log ORDER BY timestamp DESC LIMIT 1')
      .first<{ block_hash: string }>();
    const previousHash = lastEntry?.block_hash || 'GENESIS';

    const hashInput = `${id}|${entry.event_type}|${entry.actor_id}|${entry.resource_id}|${entry.action}|${previousHash}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput));
    const blockHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    await this.db.prepare(`
      INSERT INTO audit_log (id, event_type, actor_id, actor_type, resource_type, resource_id, action, metadata, timestamp, block_hash, previous_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, entry.event_type, entry.actor_id, entry.actor_type, entry.resource_type, entry.resource_id, entry.action, entry.metadata ? JSON.stringify(entry.metadata) : null, timestamp, blockHash, previousHash).run();

    return { id, ...entry, timestamp, block_hash: blockHash, previous_hash: previousHash };
  }

  async verifyChain(): Promise<{ valid: boolean; entries: number; broken_at?: string }> {
    const entries = await this.db
      .prepare('SELECT id, block_hash, previous_hash, event_type, actor_id, resource_id, action FROM audit_log ORDER BY timestamp ASC')
      .all<{ id: string; block_hash: string; previous_hash: string; event_type: string; actor_id: string; resource_id: string; action: string }>();

    if (!entries.results || entries.results.length === 0) return { valid: true, entries: 0 };

    let expectedPrevious = 'GENESIS';
    for (const entry of entries.results) {
      if (entry.previous_hash !== expectedPrevious) return { valid: false, entries: entries.results.length, broken_at: entry.id };
      const hashInput = `${entry.id}|${entry.event_type}|${entry.actor_id}|${entry.resource_id}|${entry.action}|${entry.previous_hash}`;
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput));
      const expectedHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (entry.block_hash !== expectedHash) return { valid: false, entries: entries.results.length, broken_at: entry.id };
      expectedPrevious = entry.block_hash;
    }

    return { valid: true, entries: entries.results.length };
  }

  async getStats(): Promise<{ total_entries: number; first_entry: string | null; last_entry: string | null; chain_valid: boolean }> {
    const count = await this.db.prepare('SELECT COUNT(*) as count FROM audit_log').first<{ count: number }>();
    const first = await this.db.prepare('SELECT timestamp FROM audit_log ORDER BY timestamp ASC LIMIT 1').first<{ timestamp: string }>();
    const last = await this.db.prepare('SELECT timestamp FROM audit_log ORDER BY timestamp DESC LIMIT 1').first<{ timestamp: string }>();
    const chain = await this.verifyChain();
    return { total_entries: count?.count || 0, first_entry: first?.timestamp || null, last_entry: last?.timestamp || null, chain_valid: chain.valid };
  }
}
