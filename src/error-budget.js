/**
 * NOIZY Error Budget — SRE-Grade Reliability Gating
 *
 * Implements Google SRE error budget patterns:
 * - Define SLO (e.g., 99.9% success)
 * - Track error budget consumption
 * - Gate deploys when budget exhausted
 *
 * Error budget = allowed failures before SLO breach
 * When exhausted, reliability work takes priority over features.
 */

/**
 * Default SLOs for NOIZY services
 */
export const DEFAULT_SLOS = {
  heaven_api: 0.999,      // 99.9% — 43.8 min/month downtime allowed
  consent_kernel: 0.9999, // 99.99% — 4.38 min/month (critical path)
  gabriel_db: 0.999,      // 99.9%
  landing_page: 0.995,    // 99.5% — more tolerance for marketing
};

/**
 * Calculate remaining error budget
 * @param {number} totalRequests - Total requests in window
 * @param {number} failedRequests - Failed requests in window
 * @param {number} slo - Target success rate (e.g., 0.999 for 99.9%)
 * @returns {Object} Budget status
 */
export function calculateBudget(totalRequests, failedRequests, slo = 0.999) {
  const allowedFailures = Math.floor(totalRequests * (1 - slo));
  const remaining = Math.max(0, allowedFailures - failedRequests);
  const consumed = allowedFailures > 0 ? (failedRequests / allowedFailures) * 100 : 0;
  const exhausted = remaining <= 0;

  return {
    slo,
    sloPercent: (slo * 100).toFixed(2) + '%',
    totalRequests,
    failedRequests,
    allowedFailures,
    remaining,
    consumedPercent: Math.min(100, consumed).toFixed(1) + '%',
    exhausted,
    canDeploy: !exhausted,
  };
}

/**
 * Check if deployment should proceed based on error budget
 * @param {Object} metrics - Metrics object with total and failed counts
 * @param {number} slo - Target SLO
 * @returns {Object} Deployment decision
 */
export function shouldDeploy(metrics, slo = 0.999) {
  const budget = calculateBudget(metrics.total, metrics.failed, slo);

  return {
    allowed: budget.canDeploy,
    reason: budget.canDeploy
      ? `Error budget healthy (${budget.remaining} failures remaining)`
      : `Error budget exhausted (${budget.consumedPercent} consumed)`,
    budget,
    recommendation: budget.exhausted
      ? 'FREEZE: Fix reliability issues before new deployments'
      : budget.remaining < 10
        ? 'CAUTION: Budget low, deploy only critical fixes'
        : 'PROCEED: Budget healthy for normal deploys',
  };
}

/**
 * Calculate burn rate (how fast budget is being consumed)
 * @param {number} failedRequests - Failures in current window
 * @param {number} windowHours - Window size in hours
 * @param {number} allowedFailuresPerMonth - Monthly error budget
 * @returns {Object} Burn rate analysis
 */
export function calculateBurnRate(failedRequests, windowHours, allowedFailuresPerMonth) {
  const hoursPerMonth = 720; // 30 days
  const expectedFailuresInWindow = (allowedFailuresPerMonth / hoursPerMonth) * windowHours;
  const burnRate = expectedFailuresInWindow > 0
    ? failedRequests / expectedFailuresInWindow
    : 0;

  return {
    burnRate: burnRate.toFixed(2),
    status: burnRate > 1 ? 'CRITICAL' : burnRate > 0.5 ? 'WARNING' : 'HEALTHY',
    timeToExhaustion: burnRate > 0
      ? `${Math.floor((allowedFailuresPerMonth / failedRequests) * windowHours)} hours`
      : 'infinite',
    alert: burnRate > 1
      ? 'Budget burning faster than it replenishes!'
      : burnRate > 0.5
        ? 'Budget consumption elevated'
        : 'Budget consumption normal',
  };
}

/**
 * Format budget status for CI output
 * @param {Object} budget - Budget calculation result
 * @returns {string} Formatted status
 */
export function formatBudgetStatus(budget) {
  const lines = [
    '════════════════════════════════════════',
    '  NOIZY Error Budget Status',
    '════════════════════════════════════════',
    `  SLO Target:      ${budget.sloPercent}`,
    `  Total Requests:  ${budget.totalRequests.toLocaleString()}`,
    `  Failed:          ${budget.failedRequests.toLocaleString()}`,
    `  Allowed:         ${budget.allowedFailures.toLocaleString()}`,
    `  Remaining:       ${budget.remaining.toLocaleString()}`,
    `  Consumed:        ${budget.consumedPercent}`,
    '────────────────────────────────────────',
    budget.canDeploy
      ? '  ✅ DEPLOY ALLOWED'
      : '  ❌ DEPLOY BLOCKED — Budget exhausted',
    '════════════════════════════════════════',
  ];

  return lines.join('\n');
}

export default {
  DEFAULT_SLOS,
  calculateBudget,
  shouldDeploy,
  calculateBurnRate,
  formatBudgetStatus,
};
