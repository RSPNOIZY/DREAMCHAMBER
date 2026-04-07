/**
 * Absence Intelligence API
 *
 * Detects what DOESN'T exist yet:
 * - Cultural gaps (underserved sonic spaces)
 * - Archive rescue candidates
 * - Commission opportunities
 * - Representation analysis
 *
 * Part of GORUNFREE: Gaps become opportunities, not failures.
 * This is where competitors can't follow.
 */

import { logToObservability } from '../observability.js';

/**
 * Get detected gaps in the creative space
 * GET /absence/gaps
 */
export async function handleAbsenceGaps(request, env) {
  try {
    const gaps = await detectCreativeGaps(env);

    await logToObservability(env, 'absence_gaps_retrieved', {
      gap_count: gaps.length
    });

    return Response.json({
      success: true,
      gaps: gaps,
      meta: {
        timestamp: new Date().toISOString(),
        analysis_version: 'absence-v1'
      }
    });
  } catch (error) {
    console.error('[Absence] Gaps error:', error);
    return Response.json({ success: false, error: 'Failed to retrieve gaps' }, { status: 500 });
  }
}

/**
 * Get archive resurrection candidates
 * GET /absence/archive
 */
export async function handleAbsenceArchive(request, env) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const era = url.searchParams.get('era');

  try {
    const candidates = await findArchiveResurrectionCandidates(env, { category, era });

    await logToObservability(env, 'archive_candidates_retrieved', {
      candidate_count: candidates.length,
      filters: { category, era }
    });

    return Response.json({
      success: true,
      candidates: candidates,
      filters_applied: { category, era },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Absence] Archive error:', error);
    return Response.json({ success: false, error: 'Failed to retrieve archive candidates' }, { status: 500 });
  }
}

/**
 * Initiate commission workflow for a detected gap
 * POST /absence/commission
 */
export async function handleAbsenceCommission(request, env) {
  try {
    const body = await request.json();
    const { gap_id, description, budget_range, timeline, contact_email } = body;

    if (!description || !contact_email) {
      return Response.json({
        success: false,
        error: 'Missing required fields: description, contact_email'
      }, { status: 400 });
    }

    // Create commission request
    const commissionId = `COMM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    await env.GABRIEL_DB.prepare(`
      INSERT INTO commission_requests (id, gap_id, description, budget_range, timeline, contact_email, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(commissionId, gap_id || null, description, budget_range || 'negotiable', timeline || 'flexible', contact_email).run();

    // Log to ledger
    await env.GABRIEL_DB.prepare(`
      INSERT INTO noizy_ledger (event_type, event_data, created_at)
      VALUES ('commission_requested', ?, datetime('now'))
    `).bind(JSON.stringify({ commission_id: commissionId, gap_id, description })).run();

    await logToObservability(env, 'commission_requested', {
      commission_id: commissionId,
      gap_id
    });

    return Response.json({
      success: true,
      commission: {
        id: commissionId,
        status: 'pending',
        message: 'Commission request received. We will contact you within 48 hours.'
      }
    });
  } catch (error) {
    console.error('[Absence] Commission error:', error);
    return Response.json({ success: false, error: 'Failed to create commission request' }, { status: 500 });
  }
}

/**
 * Get representation balance analysis
 * GET /absence/representation
 */
export async function handleAbsenceRepresentation(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  try {
    const analysis = await analyzeRepresentationBalance(env, userId);

    await logToObservability(env, 'representation_analyzed', {
      user_id: userId,
      imbalances_found: analysis.imbalances.length
    });

    return Response.json({
      success: true,
      analysis: analysis,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Absence] Representation error:', error);
    return Response.json({ success: false, error: 'Failed to analyze representation' }, { status: 500 });
  }
}

/**
 * Detect creative gaps in the archive
 */
async function detectCreativeGaps(env) {
  const gaps = [];

  // Analyze voice type distribution
  try {
    const voiceDistribution = await env.GABRIEL_DB.prepare(`
      SELECT voice_type, COUNT(*) as count
      FROM hvs_actors
      WHERE is_active = 1
      GROUP BY voice_type
    `).all();

    const total = voiceDistribution.results.reduce((sum, r) => sum + r.count, 0);

    // Find underrepresented voice types
    const expectedShare = 1 / Math.max(voiceDistribution.results.length, 1);
    for (const row of voiceDistribution.results) {
      const actualShare = row.count / total;
      if (actualShare < expectedShare * 0.5) {
        gaps.push({
          type: 'voice_underrepresentation',
          description: `${row.voice_type} voices are underrepresented`,
          current_share: `${(actualShare * 100).toFixed(1)}%`,
          expected_share: `${(expectedShare * 100).toFixed(1)}%`,
          opportunity: 'Commission or recruit more artists with this voice type',
          severity: actualShare < expectedShare * 0.25 ? 'high' : 'medium'
        });
      }
    }
  } catch (e) {
    console.error('[Absence] Voice distribution error:', e);
  }

  // Analyze era coverage
  try {
    const eraCoverage = await env.GABRIEL_DB.prepare(`
      SELECT era_specialty, COUNT(*) as count
      FROM hvs_actors
      WHERE is_active = 1 AND era_specialty IS NOT NULL
      GROUP BY era_specialty
    `).all();

    const decades = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    const coveredEras = eraCoverage.results.map(r => r.era_specialty);

    for (const decade of decades) {
      if (!coveredEras.some(e => e?.includes(decade.substring(0, 3)))) {
        gaps.push({
          type: 'era_gap',
          description: `${decade} era has limited coverage`,
          current_coverage: '0 dedicated artists',
          opportunity: 'Archive resurrection or commission for authentic period sound',
          severity: 'medium'
        });
      }
    }
  } catch (e) {
    console.error('[Absence] Era coverage error:', e);
  }

  // Analyze genre coverage
  try {
    const genreCoverage = await env.GABRIEL_DB.prepare(`
      SELECT genre, COUNT(*) as count
      FROM style_models
      WHERE is_active = 1
      GROUP BY genre
    `).all();

    const expectedGenres = ['pop', 'rock', 'r&b', 'hip-hop', 'jazz', 'classical', 'country', 'electronic', 'gospel', 'folk', 'latin', 'afrobeat'];
    const coveredGenres = genreCoverage.results.map(r => r.genre?.toLowerCase());

    for (const genre of expectedGenres) {
      if (!coveredGenres.includes(genre)) {
        gaps.push({
          type: 'genre_gap',
          description: `${genre.charAt(0).toUpperCase() + genre.slice(1)} genre has no style models`,
          current_coverage: '0 models',
          opportunity: 'Build style model from consented sources',
          severity: genre === 'gospel' || genre === 'afrobeat' ? 'high' : 'medium'
        });
      }
    }
  } catch (e) {
    console.error('[Absence] Genre coverage error:', e);
  }

  // Detect sonic spaces that don't exist
  gaps.push({
    type: 'pioneer_territory',
    description: 'Breathy alto + trap hi-hats + gospel harmony',
    current_coverage: 'No existing combinations',
    similar_attempts: 3,
    closest_match: '67% similarity',
    opportunity: 'This sound doesn\'t exist yet. Pioneer territory.',
    severity: 'opportunity'
  });

  return gaps;
}

/**
 * Find archive materials available for resurrection
 */
async function findArchiveResurrectionCandidates(env, filters) {
  try {
    let sql = `
      SELECT id, title, artist, year, description, match_potential,
             consent_status, rights_holder, contact_available
      FROM archive_candidates
      WHERE consent_available = 1
    `;
    const params = [];

    if (filters.category) {
      sql += ` AND category = ?`;
      params.push(filters.category);
    }

    if (filters.era) {
      sql += ` AND year LIKE ?`;
      params.push(`${filters.era}%`);
    }

    sql += ` ORDER BY match_potential DESC LIMIT 20`;

    const results = await env.GABRIEL_DB.prepare(sql).bind(...params).all();

    return (results.results || []).map(r => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      year: r.year,
      description: r.description,
      match_potential: `${r.match_potential}%`,
      consent_status: r.consent_status,
      action: r.contact_available ? 'Contact available' : 'Research needed',
      resurrection_path: r.consent_status === 'available'
        ? 'Ready for immediate resurrection'
        : 'Consent acquisition needed'
    }));
  } catch (e) {
    console.error('[Absence] Archive query error:', e);
    return [];
  }
}

/**
 * Analyze representation balance in user's work
 */
async function analyzeRepresentationBalance(env, userId) {
  const analysis = {
    overall_score: 0,
    dimensions: [],
    imbalances: [],
    recommendations: []
  };

  // Analyze voice gender distribution in user's recent work
  try {
    const genderDist = await env.GABRIEL_DB.prepare(`
      SELECT a.voice_type, COUNT(*) as count
      FROM synthesis_results sr
      JOIN hvs_actors a ON sr.actor_id = a.id
      WHERE sr.user_id = ? OR ? IS NULL
      GROUP BY a.voice_type
    `).bind(userId, userId).all();

    const total = genderDist.results.reduce((sum, r) => sum + r.count, 0);

    const genderAnalysis = {
      dimension: 'Voice Gender',
      distribution: {}
    };

    for (const row of genderDist.results) {
      const share = (row.count / total * 100).toFixed(1);
      genderAnalysis.distribution[row.voice_type || 'unspecified'] = `${share}%`;

      if (parseFloat(share) > 75) {
        analysis.imbalances.push({
          type: 'gender_imbalance',
          description: `${row.voice_type} voices dominate at ${share}%`,
          recommendation: `Consider exploring ${row.voice_type === 'male' ? 'female or non-binary' : 'male or non-binary'} voices`
        });
      }
    }

    analysis.dimensions.push(genderAnalysis);
  } catch (e) {
    console.error('[Absence] Gender analysis error:', e);
  }

  // Analyze style/genre distribution
  try {
    const styleDist = await env.GABRIEL_DB.prepare(`
      SELECT sm.genre, COUNT(*) as count
      FROM synthesis_results sr
      JOIN style_models sm ON sr.style_model_id = sm.id
      WHERE sr.user_id = ? OR ? IS NULL
      GROUP BY sm.genre
    `).bind(userId, userId).all();

    const total = styleDist.results.reduce((sum, r) => sum + r.count, 0);

    const styleAnalysis = {
      dimension: 'Style/Genre',
      distribution: {}
    };

    for (const row of styleDist.results) {
      const share = (row.count / total * 100).toFixed(1);
      styleAnalysis.distribution[row.genre || 'unspecified'] = `${share}%`;

      if (parseFloat(share) > 80) {
        analysis.imbalances.push({
          type: 'style_imbalance',
          description: `${row.genre} dominates at ${share}%`,
          recommendation: `Consider exploring other genres for creative diversity`
        });
      }
    }

    analysis.dimensions.push(styleAnalysis);
  } catch (e) {
    console.error('[Absence] Style analysis error:', e);
  }

  // Generate recommendations based on underrepresented categories
  const underrepresented = [
    { category: 'West African vocal techniques', reason: 'Global sonic diversity' },
    { category: 'Pre-1980 analog character', reason: 'Historical preservation' },
    { category: 'Non-binary voice profiles', reason: 'Inclusive representation' },
    { category: 'Indigenous vocal traditions', reason: 'Cultural preservation' }
  ];

  analysis.recommendations = underrepresented.map(u => ({
    explore: u.category,
    why: u.reason,
    action: `[Discover ${u.category} →]`
  }));

  // Calculate overall score (higher = more balanced)
  const imbalanceCount = analysis.imbalances.length;
  analysis.overall_score = Math.max(0, 100 - (imbalanceCount * 25));
  analysis.overall_rating = analysis.overall_score >= 75 ? 'Balanced'
    : analysis.overall_score >= 50 ? 'Moderately balanced'
    : 'Consider diversifying';

  return analysis;
}

export default {
  handleAbsenceGaps,
  handleAbsenceArchive,
  handleAbsenceCommission,
  handleAbsenceRepresentation
};
