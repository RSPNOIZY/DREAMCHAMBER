// ============================================================
// D1Database Compatibility Layer for Docker (better-sqlite3)
// Provides the exact D1Database API surface used by NOISY FISH
// so all engine code runs unchanged.
// ============================================================

import Database from 'better-sqlite3';

/**
 * Wraps better-sqlite3 to match the Cloudflare D1Database interface.
 * Supports: prepare().bind().run(), .first<T>(), .all<T>()
 */
export class D1Compat {
  private sqlite: Database.Database;

  constructor(dbPath: string) {
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma('journal_mode = WAL');
    this.sqlite.pragma('foreign_keys = ON');
  }

  prepare(sql: string): D1PreparedStatement {
    return new D1PreparedStatement(this.sqlite, sql);
  }

  exec(sql: string): void {
    this.sqlite.exec(sql);
  }

  close(): void {
    this.sqlite.close();
  }

  get raw(): Database.Database {
    return this.sqlite;
  }
}

class D1PreparedStatement {
  private sqlite: Database.Database;
  private sql: string;
  private params: any[] = [];

  constructor(sqlite: Database.Database, sql: string) {
    this.sqlite = sqlite;
    this.sql = sql;
  }

  bind(...params: any[]): D1PreparedStatement {
    this.params = params;
    return this;
  }

  run(): { success: boolean; meta: { changes: number; last_row_id: number } } {
    const stmt = this.sqlite.prepare(this.sql);
    const result = stmt.run(...this.params);
    return {
      success: true,
      meta: {
        changes: result.changes,
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }

  first<T = any>(columnName?: string): T | null {
    const stmt = this.sqlite.prepare(this.sql);
    const row = stmt.get(...this.params) as any;
    if (!row) return null;
    if (columnName) return row[columnName] ?? null;
    return row as T;
  }

  all<T = any>(): { results: T[]; success: boolean } {
    const stmt = this.sqlite.prepare(this.sql);
    const rows = stmt.all(...this.params) as T[];
    return { results: rows, success: true };
  }
}
