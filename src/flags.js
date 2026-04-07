/**
 * NOIZY Feature Flags — Edge-Based Feature Control
 *
 * KV-backed feature flags for instant behavior changes without deploys.
 * Reads are <1ms globally replicated.
 *
 * Usage:
 *   if (await isEnabled(env, 'new_pipeline')) { ... }
 *   const variant = await getVariant(env, 'checkout_flow', 'control');
 */

/**
 * Check if a boolean feature flag is enabled
 * @param {Object} env - Worker environment with FEATURE_FLAGS KV binding
 * @param {string} flag - Flag name
 * @param {boolean} fallback - Default value if flag not found
 * @returns {Promise<boolean>}
 */
export async function isEnabled(env, flag, fallback = false) {
  if (!env.FEATURE_FLAGS) {
    console.warn('FEATURE_FLAGS KV not bound, using fallback');
    return fallback;
  }

  try {
    const value = await env.FEATURE_FLAGS.get(flag);
    if (value === null) return fallback;
    return value === 'true' || value === '1';
  } catch (err) {
    console.error(`Flag read error [${flag}]:`, err.message);
    return fallback;
  }
}

/**
 * Get a variant value for A/B experimentation
 * @param {Object} env - Worker environment with FEATURE_FLAGS KV binding
 * @param {string} flag - Flag name
 * @param {string} fallback - Default variant if flag not found
 * @returns {Promise<string>}
 */
export async function getVariant(env, flag, fallback = 'control') {
  if (!env.FEATURE_FLAGS) {
    return fallback;
  }

  try {
    const value = await env.FEATURE_FLAGS.get(flag);
    return value ?? fallback;
  } catch (err) {
    console.error(`Variant read error [${flag}]:`, err.message);
    return fallback;
  }
}

/**
 * Get a JSON configuration object from flags
 * @param {Object} env - Worker environment
 * @param {string} flag - Flag name
 * @param {Object} fallback - Default config object
 * @returns {Promise<Object>}
 */
export async function getConfig(env, flag, fallback = {}) {
  if (!env.FEATURE_FLAGS) {
    return fallback;
  }

  try {
    const value = await env.FEATURE_FLAGS.get(flag, { type: 'json' });
    return value ?? fallback;
  } catch (err) {
    console.error(`Config read error [${flag}]:`, err.message);
    return fallback;
  }
}

/**
 * Percentage-based rollout check (sticky by user/session ID)
 * @param {Object} env - Worker environment
 * @param {string} flag - Flag name (value should be 0-100)
 * @param {string} userId - User or session ID for consistent bucketing
 * @returns {Promise<boolean>}
 */
export async function isRolledOut(env, flag, userId) {
  if (!env.FEATURE_FLAGS || !userId) {
    return false;
  }

  try {
    const percentStr = await env.FEATURE_FLAGS.get(flag);
    if (percentStr === null) return false;

    const percent = parseInt(percentStr, 10);
    if (isNaN(percent)) return false;

    // Consistent hash: same user always gets same bucket
    const hash = await hashUserId(userId);
    const bucket = hash % 100;

    return bucket < percent;
  } catch (err) {
    console.error(`Rollout check error [${flag}]:`, err.message);
    return false;
  }
}

/**
 * Simple hash function for consistent bucketing
 * @param {string} str - String to hash
 * @returns {Promise<number>}
 */
async function hashUserId(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  // Use first 4 bytes as a number
  return (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
}

/**
 * Batch read multiple flags at once
 * @param {Object} env - Worker environment
 * @param {string[]} flags - Array of flag names
 * @returns {Promise<Object>} - Map of flag name to value
 */
export async function getFlags(env, flags) {
  const results = {};

  if (!env.FEATURE_FLAGS) {
    flags.forEach(f => results[f] = null);
    return results;
  }

  // Read all flags in parallel
  const reads = flags.map(async (flag) => {
    try {
      results[flag] = await env.FEATURE_FLAGS.get(flag);
    } catch {
      results[flag] = null;
    }
  });

  await Promise.all(reads);
  return results;
}

export default {
  isEnabled,
  getVariant,
  getConfig,
  isRolledOut,
  getFlags,
};
