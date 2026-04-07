/**
 * NOIZY Budget-Aware Traffic Throttling
 *
 * When error budget is burning fast:
 * - Don't just freeze deploys
 * - REDUCE traffic hitting risky paths
 * - Prefer cached/degraded responses
 *
 * This is runtime behavior change, not just CI policy.
 */

/**
 * Throttle configuration (stored in KV)
 * {
 *   "mode": "normal" | "throttle" | "emergency",
 *   "percent": 0-100 (percent of traffic to shed)
 *   "paths": ["/api/*"] (optional: which paths to throttle)
 * }
 */

/**
 * Check if throttling is active
 * @param {Object} env - Worker environment
 * @returns {Promise<boolean>}
 */
export async function shouldThrottle(env) {
  try {
    const kv = env.FEATURE_FLAGS || env.GABRIEL_KV;
    if (!kv) return false;

    const config = await kv.get('THROTTLE_CONFIG', { type: 'json' });
    return config?.mode === 'throttle' || config?.mode === 'emergency';
  } catch {
    return false;
  }
}

/**
 * Get throttle percentage (0-100)
 * @param {Object} env - Worker environment
 * @returns {Promise<number>}
 */
export async function getThrottlePercent(env) {
  try {
    const kv = env.FEATURE_FLAGS || env.GABRIEL_KV;
    if (!kv) return 0;

    const config = await kv.get('THROTTLE_CONFIG', { type: 'json' });
    if (!config) return 0;

    // Emergency mode = 80% shed
    if (config.mode === 'emergency') return 80;
    // Normal throttle = configured percent
    if (config.mode === 'throttle') return config.percent || 40;
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Check if a specific path should be throttled
 * @param {Object} env - Worker environment
 * @param {string} pathname - Request path
 * @returns {Promise<boolean>}
 */
export async function shouldThrottlePath(env, pathname) {
  try {
    const kv = env.FEATURE_FLAGS || env.GABRIEL_KV;
    if (!kv) return false;

    const config = await kv.get('THROTTLE_CONFIG', { type: 'json' });
    if (!config || config.mode === 'normal') return false;

    // If no specific paths, throttle all
    if (!config.paths || config.paths.length === 0) return true;

    // Check if pathname matches any throttle patterns
    return config.paths.some(pattern => {
      if (pattern.endsWith('*')) {
        return pathname.startsWith(pattern.slice(0, -1));
      }
      return pathname === pattern;
    });
  } catch {
    return false;
  }
}

/**
 * Generate throttle response (soft degradation)
 * @param {string} reason - Reason for throttling
 * @returns {Response}
 */
export function throttleResponse(reason = 'stability') {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'temporarily_degraded',
      message: 'Service operating in degraded mode for stability',
      reason,
      retry_after: 60,
    }),
    {
      status: 200, // Return 200 to avoid client-side error handling
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-Degraded-Mode': 'true',
        'Cache-Control': 'no-store',
      },
    }
  );
}

/**
 * Apply throttle decision to a request
 * @param {Request} request - Incoming request
 * @param {Object} env - Worker environment
 * @returns {Promise<Response|null>} Response if throttled, null if should proceed
 */
export async function applyThrottle(request, env) {
  const url = new URL(request.url);

  // Check if this path should be throttled
  if (!(await shouldThrottlePath(env, url.pathname))) {
    return null; // Not a throttle target
  }

  // Get throttle percentage
  const percent = await getThrottlePercent(env);
  if (percent === 0) {
    return null; // No throttling active
  }

  // Probabilistic shedding
  if (Math.random() * 100 < percent) {
    return throttleResponse('budget_protection');
  }

  return null; // Request proceeds normally
}

/**
 * Throttle configuration helpers
 */
export const ThrottleConfig = {
  /**
   * Enable normal throttle mode
   */
  throttle(percent = 40, paths = []) {
    return JSON.stringify({
      mode: 'throttle',
      percent,
      paths,
      updated: new Date().toISOString(),
    });
  },

  /**
   * Enable emergency mode (aggressive shedding)
   */
  emergency(paths = []) {
    return JSON.stringify({
      mode: 'emergency',
      percent: 80,
      paths,
      updated: new Date().toISOString(),
    });
  },

  /**
   * Disable throttling
   */
  normal() {
    return JSON.stringify({
      mode: 'normal',
      percent: 0,
      paths: [],
      updated: new Date().toISOString(),
    });
  },
};

export default {
  shouldThrottle,
  getThrottlePercent,
  shouldThrottlePath,
  throttleResponse,
  applyThrottle,
  ThrottleConfig,
};
