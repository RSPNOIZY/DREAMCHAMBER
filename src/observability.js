/**
 * NOIZY Observability — Safe Logging & Metrics
 *
 * Rules:
 * - NEVER log secrets, tokens, or credentials
 * - NEVER log full request bodies (may contain PII)
 * - Log structured data for analysis
 * - Include correlation IDs for tracing
 */

/**
 * Generate a correlation ID for request tracing
 * @returns {string} - Unique correlation ID
 */
export function generateCorrelationId() {
  return `nz-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a safe log entry (no secrets)
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} context - Additional context (sanitized)
 * @returns {Object} - Structured log entry
 */
export function createLogEntry(level, message, context = {}) {
  // Sanitize context - remove any potential secrets
  const sanitized = { ...context };
  const sensitiveKeys = ['token', 'key', 'secret', 'password', 'auth', 'credential', 'apikey'];

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(s => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'heaven',
    version: '17.9.0',
    ...sanitized,
  };
}

/**
 * Log a request (safe summary only)
 * @param {Request} request - Incoming request
 * @param {string} correlationId - Correlation ID
 * @returns {Object} - Safe request log
 */
export function logRequest(request, correlationId) {
  const url = new URL(request.url);

  return createLogEntry('info', 'request', {
    correlationId,
    method: request.method,
    path: url.pathname,
    // Only log safe query params
    hasQuery: url.search.length > 1,
    cf: {
      country: request.cf?.country,
      colo: request.cf?.colo,
      asn: request.cf?.asn,
    },
  });
}

/**
 * Log a response (safe summary only)
 * @param {number} status - Response status code
 * @param {string} correlationId - Correlation ID
 * @param {number} durationMs - Request duration
 * @returns {Object} - Safe response log
 */
export function logResponse(status, correlationId, durationMs) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  return createLogEntry(level, 'response', {
    correlationId,
    status,
    durationMs,
  });
}

/**
 * Log an error (safe, no stack traces with secrets)
 * @param {Error} error - Error object
 * @param {string} correlationId - Correlation ID
 * @returns {Object} - Safe error log
 */
export function logError(error, correlationId) {
  return createLogEntry('error', 'error', {
    correlationId,
    errorName: error.name,
    errorMessage: error.message,
    // Only include stack in development
    // stack: process.env.NOIZY_ENV === 'development' ? error.stack : undefined,
  });
}

/**
 * Metrics collector for observability
 */
export class MetricsCollector {
  constructor() {
    this.counters = {};
    this.histograms = {};
  }

  increment(name, labels = {}) {
    const key = this.makeKey(name, labels);
    this.counters[key] = (this.counters[key] || 0) + 1;
  }

  recordDuration(name, durationMs, labels = {}) {
    const key = this.makeKey(name, labels);
    if (!this.histograms[key]) {
      this.histograms[key] = [];
    }
    this.histograms[key].push(durationMs);
  }

  makeKey(name, labels) {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  getMetrics() {
    return {
      counters: { ...this.counters },
      histograms: Object.fromEntries(
        Object.entries(this.histograms).map(([k, v]) => [
          k,
          {
            count: v.length,
            sum: v.reduce((a, b) => a + b, 0),
            avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0,
            min: v.length ? Math.min(...v) : 0,
            max: v.length ? Math.max(...v) : 0,
          },
        ])
      ),
    };
  }
}

/**
 * Log to observability layer (D1 ledger + console)
 * Used by GORUNFREE routes for tracking events
 * @param {Object} env - Worker environment bindings
 * @param {string} eventType - Event type (e.g., 'preflight_complete', 'provenance_retrieved')
 * @param {Object} data - Event data (sanitized)
 */
export async function logToObservability(env, eventType, data = {}) {
  const entry = createLogEntry('info', eventType, data);

  // Console log for Cloudflare dashboard
  console.log(JSON.stringify(entry));

  // Attempt to write to D1 ledger if available
  if (env?.GABRIEL_DB) {
    try {
      await env.GABRIEL_DB.prepare(`
        INSERT INTO noizy_ledger (event_id, event_type, payload_json, source_system, recorded_at)
        VALUES (?, ?, ?, 'GORUNFREE', datetime('now'))
      `)
        .bind(
          `nz-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`,
          eventType,
          JSON.stringify(data)
        )
        .run();
    } catch (e) {
      // Silent fail — observability should not break requests
      console.error('[Observability] D1 write failed:', e.message);
    }
  }
}

export default {
  generateCorrelationId,
  createLogEntry,
  logRequest,
  logResponse,
  logError,
  logToObservability,
  MetricsCollector,
};
