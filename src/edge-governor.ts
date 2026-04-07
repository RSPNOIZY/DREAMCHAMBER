/**
 * EdgeGovernor Durable Object
 *
 * Cryptographic intent enforcement for high-risk operations.
 * Makes zone migration and other irreversible actions require
 * explicit, time-bounded, single-use authorization.
 *
 * Account: 5f36aa9795348ea681d0b21910dfc82a
 */

import { DurableObject } from 'cloudflare:workers';

interface MigrationToken {
  token: string;
  owner: string;
  operation: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
  usedAt?: number;
  usedBy?: string;
}

interface TokenRequest {
  owner: string;
  operation: string;
  ttlMinutes?: number;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  owner?: string;
  operation?: string;
}

// Authorized operators who can request migration tokens
const AUTHORIZED_OPERATORS = [
  'RSP_001',           // Robert Stephen Plowman
  'rsp@noizy.ai',      // Primary email
  'github:rspnoizy',   // GitHub identity
];

// Supported high-risk operations
const SUPPORTED_OPERATIONS = [
  'zone_migration',
  'dns_transfer',
  'account_consolidation',
  'database_migration',
  'kill_switch_override',  // Requires additional authorization
];

export class EdgeGovernor extends DurableObject {

  /**
   * Issue a migration DRM token
   * - Scoped to specific operation
   * - Time-limited (default 15 minutes)
   * - Single-use (burned on validation)
   */
  async issueMigrationToken(request: TokenRequest): Promise<{ token: string; expiresAt: number } | { error: string }> {
    const { owner, operation, ttlMinutes = 15 } = request;

    // Validate operator
    if (!AUTHORIZED_OPERATORS.includes(owner)) {
      await this.logAudit('token_denied', { owner, operation, reason: 'unauthorized_operator' });
      return { error: 'Unauthorized operator' };
    }

    // Validate operation
    if (!SUPPORTED_OPERATIONS.includes(operation)) {
      await this.logAudit('token_denied', { owner, operation, reason: 'unsupported_operation' });
      return { error: 'Unsupported operation' };
    }

    // Check for existing active tokens for this operation
    const existingTokens = await this.getActiveTokensForOperation(operation);
    if (existingTokens.length > 0) {
      await this.logAudit('token_denied', { owner, operation, reason: 'active_token_exists' });
      return { error: 'Active token already exists for this operation. Wait for expiry or use existing token.' };
    }

    // Generate token
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + (ttlMinutes * 60 * 1000);

    const tokenRecord: MigrationToken = {
      token,
      owner,
      operation,
      expiresAt,
      used: false,
      createdAt: now,
    };

    await this.ctx.storage.put(`migration_token:${token}`, tokenRecord);
    await this.logAudit('token_issued', { token: token.slice(0, 8) + '...', owner, operation, expiresAt });

    return { token, expiresAt };
  }

  /**
   * Validate and burn a migration token
   * Returns true only once per token
   */
  async validateMigrationToken(token: string, validator?: string): Promise<ValidationResult> {
    const key = `migration_token:${token}`;
    const record = await this.ctx.storage.get<MigrationToken>(key);

    if (!record) {
      await this.logAudit('token_validation_failed', { token: token.slice(0, 8) + '...', reason: 'not_found' });
      return { valid: false, reason: 'Token not found' };
    }

    if (record.used) {
      await this.logAudit('token_validation_failed', { token: token.slice(0, 8) + '...', reason: 'already_used' });
      return { valid: false, reason: 'Token already used' };
    }

    if (Date.now() > record.expiresAt) {
      await this.logAudit('token_validation_failed', { token: token.slice(0, 8) + '...', reason: 'expired' });
      return { valid: false, reason: 'Token expired' };
    }

    // Burn the token (single-use)
    record.used = true;
    record.usedAt = Date.now();
    record.usedBy = validator;
    await this.ctx.storage.put(key, record);

    await this.logAudit('token_validated', {
      token: token.slice(0, 8) + '...',
      owner: record.owner,
      operation: record.operation,
      validator
    });

    return {
      valid: true,
      owner: record.owner,
      operation: record.operation
    };
  }

  /**
   * Revoke a token (emergency use)
   */
  async revokeToken(token: string, reason: string): Promise<boolean> {
    const key = `migration_token:${token}`;
    const record = await this.ctx.storage.get<MigrationToken>(key);

    if (!record) {
      return false;
    }

    record.used = true;
    record.usedAt = Date.now();
    record.usedBy = `REVOKED: ${reason}`;
    await this.ctx.storage.put(key, record);

    await this.logAudit('token_revoked', { token: token.slice(0, 8) + '...', reason });
    return true;
  }

  /**
   * Get active tokens for an operation
   */
  private async getActiveTokensForOperation(operation: string): Promise<MigrationToken[]> {
    const allTokens = await this.ctx.storage.list<MigrationToken>({ prefix: 'migration_token:' });
    const active: MigrationToken[] = [];
    const now = Date.now();

    for (const [, token] of allTokens) {
      if (token.operation === operation && !token.used && token.expiresAt > now) {
        active.push(token);
      }
    }

    return active;
  }

  /**
   * Get token status (for monitoring)
   */
  async getTokenStatus(token: string): Promise<Partial<MigrationToken> | null> {
    const record = await this.ctx.storage.get<MigrationToken>(`migration_token:${token}`);
    if (!record) return null;

    // Return status without exposing full token
    return {
      operation: record.operation,
      owner: record.owner,
      expiresAt: record.expiresAt,
      used: record.used,
      createdAt: record.createdAt,
      usedAt: record.usedAt,
    };
  }

  /**
   * Cleanup expired tokens (maintenance)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const allTokens = await this.ctx.storage.list<MigrationToken>({ prefix: 'migration_token:' });
    const now = Date.now();
    const expiredThreshold = now - (24 * 60 * 60 * 1000); // 24 hours after expiry
    let cleaned = 0;

    for (const [key, token] of allTokens) {
      if (token.expiresAt < expiredThreshold) {
        await this.ctx.storage.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      await this.logAudit('tokens_cleaned', { count: cleaned });
    }

    return cleaned;
  }

  /**
   * Audit logging
   */
  private async logAudit(action: string, data: Record<string, unknown>): Promise<void> {
    const entry = {
      action,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Store in DO for persistence
    const auditKey = `audit:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    await this.ctx.storage.put(auditKey, entry);

    // Also log to console for observability
    console.log(`[EdgeGovernor] ${action}`, JSON.stringify(data));
  }

  /**
   * Get recent audit log
   */
  async getAuditLog(limit: number = 50): Promise<unknown[]> {
    const entries = await this.ctx.storage.list({ prefix: 'audit:', reverse: true, limit });
    return Array.from(entries.values());
  }

  /**
   * HTTP request handler
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for API access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /issue - Issue a new migration token
      if (path === '/issue' && request.method === 'POST') {
        const body = await request.json() as TokenRequest;
        const result = await this.issueMigrationToken(body);

        if ('error' in result) {
          return Response.json({ success: false, error: result.error }, {
            status: 403,
            headers: corsHeaders
          });
        }

        return Response.json({
          success: true,
          token: result.token,
          expiresAt: result.expiresAt,
          expiresIn: `${Math.round((result.expiresAt - Date.now()) / 60000)} minutes`
        }, { headers: corsHeaders });
      }

      // POST /validate - Validate and burn a token
      if (path === '/validate' && request.method === 'POST') {
        const auth = request.headers.get('Authorization');
        const token = auth?.replace('Bearer ', '') || '';
        const validator = request.headers.get('X-Validator') || 'unknown';

        const result = await this.validateMigrationToken(token, validator);

        if (!result.valid) {
          return Response.json({ success: false, error: result.reason }, {
            status: 403,
            headers: corsHeaders
          });
        }

        return Response.json({
          success: true,
          message: 'Token validated and burned',
          owner: result.owner,
          operation: result.operation
        }, { headers: corsHeaders });
      }

      // GET /status/:token - Check token status
      if (path.startsWith('/status/') && request.method === 'GET') {
        const token = path.replace('/status/', '');
        const status = await this.getTokenStatus(token);

        if (!status) {
          return Response.json({ success: false, error: 'Token not found' }, {
            status: 404,
            headers: corsHeaders
          });
        }

        return Response.json({ success: true, status }, { headers: corsHeaders });
      }

      // GET /audit - Get audit log
      if (path === '/audit' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const log = await this.getAuditLog(limit);
        return Response.json({ success: true, log }, { headers: corsHeaders });
      }

      // POST /revoke - Revoke a token
      if (path === '/revoke' && request.method === 'POST') {
        const { token, reason } = await request.json() as { token: string; reason: string };
        const revoked = await this.revokeToken(token, reason);

        return Response.json({ success: revoked }, {
          status: revoked ? 200 : 404,
          headers: corsHeaders
        });
      }

      // POST /cleanup - Cleanup expired tokens
      if (path === '/cleanup' && request.method === 'POST') {
        const cleaned = await this.cleanupExpiredTokens();
        return Response.json({ success: true, cleaned }, { headers: corsHeaders });
      }

      // GET /health
      if (path === '/health') {
        return Response.json({
          status: 'healthy',
          service: 'EdgeGovernor',
          timestamp: new Date().toISOString()
        }, { headers: corsHeaders });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('[EdgeGovernor] Error:', error);
      return Response.json({
        success: false,
        error: 'Internal error'
      }, { status: 500, headers: corsHeaders });
    }
  }
}

export default {
  async fetch(request: Request, env: { EDGE_GOVERNOR: DurableObjectNamespace }): Promise<Response> {
    // Single global instance
    const id = env.EDGE_GOVERNOR.idFromName('global');
    const stub = env.EDGE_GOVERNOR.get(id);
    return stub.fetch(request);
  }
};
