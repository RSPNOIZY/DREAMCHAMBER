/**
 * NOIZY Edge A/B Experimentation — Variant Selection at the Edge
 *
 * KV-backed experiment definitions with deterministic variant assignment.
 * Supports weighted multi-variant experiments (A/B/n), not just booleans.
 *
 * Experiment definition format (stored in KV):
 * {
 *   "salt": "noizy-search-2026",
 *   "variants": {
 *     "control": 70,
 *     "v2": 20,
 *     "v3": 10
 *   }
 * }
 *
 * Properties:
 * - Sticky assignment (same user always gets same variant)
 * - Weighted variants (A/B/n testing)
 * - No flicker (decision made at edge)
 * - No client logic required
 */

/**
 * Hash a string to a value between 0 and 1 (deterministic)
 * @param {string} input - String to hash
 * @returns {Promise<number>} Value between 0 and 1
 */
async function hash01(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const view = new DataView(digest);
  return view.getUint32(0) / 2 ** 32;
}

/**
 * Choose a variant for a subject based on experiment weights
 * @param {Object} env - Worker environment with EXPERIMENTS KV binding
 * @param {string} experimentKey - Name of the experiment in KV
 * @param {string} subjectId - User ID, session ID, or IP for bucketing
 * @returns {Promise<string>} Selected variant name
 */
export async function chooseVariant(env, experimentKey, subjectId) {
  // Fallback if no experiments KV
  if (!env.EXPERIMENTS && !env.FEATURE_FLAGS) {
    return 'control';
  }

  const kv = env.EXPERIMENTS || env.FEATURE_FLAGS;

  try {
    const raw = await kv.get(experimentKey);
    if (!raw) return 'control';

    const exp = JSON.parse(raw);

    // Validate experiment structure
    if (!exp.salt || !exp.variants) {
      console.warn(`Invalid experiment structure: ${experimentKey}`);
      return 'control';
    }

    // Deterministic hash based on salt + subject
    const r = await hash01(`${exp.salt}:${subjectId}`);

    // Walk through variants by cumulative weight
    let acc = 0;
    for (const [name, weight] of Object.entries(exp.variants)) {
      acc += weight / 100;
      if (r < acc) return name;
    }

    return 'control';
  } catch (err) {
    console.error(`Experiment error [${experimentKey}]:`, err.message);
    return 'control';
  }
}

/**
 * Get experiment definition (for debugging/admin)
 * @param {Object} env - Worker environment
 * @param {string} experimentKey - Experiment name
 * @returns {Promise<Object|null>}
 */
export async function getExperiment(env, experimentKey) {
  const kv = env.EXPERIMENTS || env.FEATURE_FLAGS;
  if (!kv) return null;

  try {
    const raw = await kv.get(experimentKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Create experiment definition helper
 * @param {string} salt - Unique salt for this experiment
 * @param {Object} variants - Variant name to weight mapping (must sum to 100)
 * @returns {string} JSON string to store in KV
 */
export function createExperiment(salt, variants) {
  const totalWeight = Object.values(variants).reduce((a, b) => a + b, 0);
  if (totalWeight !== 100) {
    throw new Error(`Variant weights must sum to 100, got ${totalWeight}`);
  }

  return JSON.stringify({
    salt,
    variants,
    created: new Date().toISOString(),
  });
}

/**
 * Log experiment exposure (for analytics)
 * @param {Object} env - Worker environment
 * @param {string} experimentKey - Experiment name
 * @param {string} variant - Selected variant
 * @param {string} subjectId - Subject ID
 * @returns {Object} Exposure log entry
 */
export function logExposure(experimentKey, variant, subjectId) {
  return {
    type: 'experiment_exposure',
    experiment: experimentKey,
    variant,
    subject: subjectId.substring(0, 8) + '...', // Truncate for privacy
    timestamp: new Date().toISOString(),
  };
}

export default {
  chooseVariant,
  getExperiment,
  createExperiment,
  logExposure,
};
