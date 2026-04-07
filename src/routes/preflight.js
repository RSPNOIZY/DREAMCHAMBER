/**
 * Pre-Flight Insight API
 *
 * Surfaces context BEFORE generation:
 * - What exists (relevant to intent)
 * - What's missing (explicit gap detection)
 * - Why it's missing (consent, rarity, never recorded)
 * - Recommendations (alternatives, archive rescue, commissions)
 *
 * Part of GORUNFREE: Creators move faster with less cognitive overhead.
 */

import { logToObservability } from '../observability.js';

/**
 * Analyze creator intent and return pre-flight insights
 * GET /preflight?intent=<encoded intent>
 */
export async function handlePreflight(request, env) {
  const url = new URL(request.url);
  const intent = url.searchParams.get('intent');

  if (!intent) {
    return Response.json({
      success: false,
      error: 'Missing intent parameter'
    }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    // Parse and understand the intent
    const parsedIntent = parseIntent(intent);

    // Query what exists
    const existing = await findExistingResources(env, parsedIntent);

    // Detect what's missing
    const missing = await detectMissingResources(env, parsedIntent, existing);

    // Generate recommendations
    const recommendations = await generateRecommendations(env, parsedIntent, existing, missing);

    // Check consent status for all paths
    const consentStatus = await checkConsentStatus(env, existing);

    const latency = Date.now() - startTime;

    // Log for observability
    await logToObservability(env, 'preflight_complete', {
      intent: intent.substring(0, 100),
      existing_count: existing.length,
      missing_count: missing.length,
      recommendations_count: recommendations.length,
      consent_clear: consentStatus.allClear,
      latency_ms: latency
    });

    return Response.json({
      success: true,
      intent: {
        raw: intent,
        parsed: parsedIntent
      },
      insights: {
        existing: {
          count: existing.length,
          items: existing.slice(0, 10), // Top 10
          summary: summarizeExisting(existing)
        },
        missing: {
          count: missing.length,
          items: missing,
          reasons: missing.map(m => m.reason)
        },
        recommendations: recommendations,
        consent: consentStatus
      },
      meta: {
        latency_ms: latency,
        timestamp: new Date().toISOString(),
        version: 'preflight-v1'
      }
    });

  } catch (error) {
    console.error('[Preflight] Error:', error);
    return Response.json({
      success: false,
      error: 'Failed to generate pre-flight insights'
    }, { status: 500 });
  }
}

/**
 * Parse natural language intent into structured query
 */
function parseIntent(intent) {
  const lower = intent.toLowerCase();

  // Extract voice characteristics
  const voicePatterns = {
    gender: extractPattern(lower, ['male', 'female', 'non-binary', 'androgynous']),
    range: extractPattern(lower, ['soprano', 'alto', 'tenor', 'baritone', 'bass']),
    texture: extractPattern(lower, ['breathy', 'raspy', 'smooth', 'powerful', 'soft']),
    style: extractPattern(lower, ['r&b', 'pop', 'rock', 'jazz', 'gospel', 'country', 'hip-hop', 'classical'])
  };

  // Extract era/decade
  const eraMatch = lower.match(/(\d{2})s|(\d{4})s?/);
  const era = eraMatch ? normalizeEra(eraMatch[0]) : null;

  // Extract artist references
  const artistPatterns = lower.match(/(\w+)\s*style|like\s*(\w+)|(\w+)-esque/i);
  const artistReference = artistPatterns ? (artistPatterns[1] || artistPatterns[2] || artistPatterns[3]) : null;

  return {
    voice: voicePatterns,
    era,
    artistReference,
    keywords: extractKeywords(lower),
    originalIntent: intent
  };
}

function extractPattern(text, patterns) {
  for (const pattern of patterns) {
    if (text.includes(pattern)) return pattern;
  }
  return null;
}

function normalizeEra(era) {
  if (era.length === 3) {
    // "90s" -> "1990s"
    const decade = parseInt(era);
    return decade < 30 ? `20${era}` : `19${era}`;
  }
  return era;
}

function extractKeywords(text) {
  // Remove common words, keep meaningful terms
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'style', 'like', 'similar'];
  return text
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10);
}

/**
 * Find existing resources matching the intent
 */
async function findExistingResources(env, parsedIntent) {
  const results = [];

  // Query voice profiles from D1
  try {
    const voiceQuery = buildVoiceQuery(parsedIntent);
    const voices = await env.GABRIEL_DB.prepare(voiceQuery.sql)
      .bind(...voiceQuery.params)
      .all();

    if (voices.results) {
      results.push(...voices.results.map(v => ({
        type: 'voice_profile',
        id: v.id,
        name: v.display_name,
        match_score: calculateMatchScore(v, parsedIntent),
        consent_status: v.consent_status,
        royalty_rate: v.royalty_rate || 0.75
      })));
    }
  } catch (e) {
    console.error('[Preflight] Voice query error:', e);
  }

  // Query style models
  try {
    const styleQuery = buildStyleQuery(parsedIntent);
    const styles = await env.GABRIEL_DB.prepare(styleQuery.sql)
      .bind(...styleQuery.params)
      .all();

    if (styles.results) {
      results.push(...styles.results.map(s => ({
        type: 'style_model',
        id: s.id,
        name: s.name,
        match_score: calculateStyleMatchScore(s, parsedIntent),
        samples_count: s.samples_count
      })));
    }
  } catch (e) {
    console.error('[Preflight] Style query error:', e);
  }

  // Sort by match score
  return results.sort((a, b) => b.match_score - a.match_score);
}

function buildVoiceQuery(parsedIntent) {
  let sql = `SELECT id, display_name, consent_status, royalty_rate, voice_type, era_specialty
             FROM hvs_actors WHERE is_active = 1`;
  const params = [];

  if (parsedIntent.voice.gender) {
    sql += ` AND voice_type LIKE ?`;
    params.push(`%${parsedIntent.voice.gender}%`);
  }

  if (parsedIntent.voice.style) {
    sql += ` AND style_tags LIKE ?`;
    params.push(`%${parsedIntent.voice.style}%`);
  }

  sql += ` LIMIT 50`;

  return { sql, params };
}

function buildStyleQuery(parsedIntent) {
  let sql = `SELECT id, name, samples_count, era_range FROM style_models WHERE is_active = 1`;
  const params = [];

  if (parsedIntent.era) {
    sql += ` AND era_range LIKE ?`;
    params.push(`%${parsedIntent.era}%`);
  }

  if (parsedIntent.voice.style) {
    sql += ` AND genre = ?`;
    params.push(parsedIntent.voice.style);
  }

  sql += ` LIMIT 20`;

  return { sql, params };
}

function calculateMatchScore(voice, intent) {
  let score = 0.5; // Base score

  // Boost for matching characteristics
  if (intent.voice.gender && voice.voice_type?.includes(intent.voice.gender)) score += 0.2;
  if (intent.era && voice.era_specialty?.includes(intent.era)) score += 0.15;
  if (voice.consent_status === 'active') score += 0.15;

  return Math.min(score, 1.0);
}

function calculateStyleMatchScore(style, intent) {
  let score = 0.5;

  if (intent.era && style.era_range?.includes(intent.era)) score += 0.25;
  if (style.samples_count > 100) score += 0.15;

  return Math.min(score, 1.0);
}

/**
 * Detect what's missing based on intent vs. available resources
 */
async function detectMissingResources(env, parsedIntent, existing) {
  const missing = [];

  // Check for specific artist reference without consent
  if (parsedIntent.artistReference) {
    const artistExists = existing.some(e =>
      e.name?.toLowerCase().includes(parsedIntent.artistReference.toLowerCase())
    );

    if (!artistExists) {
      missing.push({
        type: 'artist_reference',
        description: `${capitalizeFirst(parsedIntent.artistReference)}'s voice`,
        reason: 'no_consent',
        explanation: 'This artist has not provided consent for voice synthesis.',
        severity: 'high'
      });
    }
  }

  // Check for gaps in voice characteristics
  if (parsedIntent.voice.texture) {
    const textureExists = existing.some(e =>
      e.type === 'voice_profile' && e.match_score > 0.7
    );

    if (!textureExists) {
      missing.push({
        type: 'voice_characteristic',
        description: `${parsedIntent.voice.texture} vocal texture`,
        reason: 'gap_in_archive',
        explanation: 'Limited samples with this characteristic in our consented archive.',
        severity: 'medium'
      });
    }
  }

  // Check for era-specific gaps
  if (parsedIntent.era) {
    const eraCount = existing.filter(e => e.match_score > 0.6).length;
    if (eraCount < 5) {
      missing.push({
        type: 'era_coverage',
        description: `${parsedIntent.era} era authenticity`,
        reason: 'limited_samples',
        explanation: `Only ${eraCount} high-match resources from this era.`,
        severity: 'low'
      });
    }
  }

  return missing;
}

/**
 * Generate recommendations based on gaps
 */
async function generateRecommendations(env, parsedIntent, existing, missing) {
  const recommendations = [];

  // Alternative voice recommendations
  const topVoices = existing
    .filter(e => e.type === 'voice_profile' && e.consent_status === 'active')
    .slice(0, 3);

  if (topVoices.length > 0) {
    recommendations.push({
      type: 'alternative_voice',
      title: 'Consented alternatives',
      description: `Use ${topVoices.map(v => v.name).join(', ')} for similar results with full consent.`,
      items: topVoices,
      confidence: 'high'
    });
  }

  // Archive rescue recommendations
  const archiveCandidates = await findArchiveCandidates(env, parsedIntent);
  if (archiveCandidates.length > 0) {
    recommendations.push({
      type: 'archive_rescue',
      title: 'Archive resurrection',
      description: 'Unreleased material that matches your intent is available for rescue.',
      items: archiveCandidates,
      confidence: 'medium',
      action: 'resurrect'
    });
  }

  // Commission recommendation for significant gaps
  const significantGaps = missing.filter(m => m.severity === 'high');
  if (significantGaps.length > 0) {
    recommendations.push({
      type: 'commission',
      title: 'Commission opportunity',
      description: 'This sound doesn\'t exist yet. Consider commissioning original vocal capture.',
      gaps: significantGaps,
      confidence: 'high',
      action: 'commission'
    });
  }

  return recommendations;
}

async function findArchiveCandidates(env, parsedIntent) {
  try {
    const sql = `SELECT id, title, artist, year, match_description, consent_available
                 FROM archive_candidates
                 WHERE consent_available = 1
                 LIMIT 5`;

    const results = await env.GABRIEL_DB.prepare(sql).all();
    return results.results || [];
  } catch (e) {
    return [];
  }
}

/**
 * Check consent status for all paths
 */
async function checkConsentStatus(env, existing) {
  const voiceProfiles = existing.filter(e => e.type === 'voice_profile');
  const consented = voiceProfiles.filter(v => v.consent_status === 'active');

  return {
    allClear: consented.length === voiceProfiles.length,
    consented: consented.length,
    total: voiceProfiles.length,
    message: consented.length === voiceProfiles.length
      ? 'All paths lead to consented sources'
      : `${voiceProfiles.length - consented.length} source(s) require consent verification`
  };
}

function summarizeExisting(existing) {
  const voices = existing.filter(e => e.type === 'voice_profile').length;
  const styles = existing.filter(e => e.type === 'style_model').length;

  return `${voices} consented voice profiles, ${styles} style models available`;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default { handlePreflight };
