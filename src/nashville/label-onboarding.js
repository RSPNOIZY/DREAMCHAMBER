/**
 * NASHVILLE SCALE — Label Onboarding System
 *
 * Production-ready system for onboarding major labels and artists.
 * Faith Hill pilot → Nashville scale → Industry standard.
 *
 * "From pilot to production. From Nashville to everywhere."
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// LABEL REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Label tier definitions
 */
export const LABEL_TIERS = {
  PILOT: {
    id: 'pilot',
    name: 'Pilot',
    max_artists: 10,
    max_voices: 50,
    features: ['voice_registration', 'consent_management', 'basic_analytics'],
    price_monthly: 0,
    revenue_share: 0
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    max_artists: 100,
    max_voices: 500,
    features: ['voice_registration', 'consent_management', 'analytics', 'c2pa_export', 'regulator_bundles'],
    price_monthly: 2500,
    revenue_share: 0.05
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    max_artists: -1, // Unlimited
    max_voices: -1,
    features: ['all'],
    price_monthly: 'custom',
    revenue_share: 'custom'
  }
};

/**
 * Register a new label
 */
export async function registerLabel(env, labelData) {
  const labelId = `label_${crypto.randomUUID().slice(0, 8)}`;

  const label = {
    id: labelId,
    name: labelData.name,
    tier: labelData.tier || 'pilot',
    contact_email: labelData.contact_email,
    contact_name: labelData.contact_name,
    billing_email: labelData.billing_email,
    address: labelData.address,
    status: 'pending_verification',
    created_at: new Date().toISOString(),
    verified_at: null,
    metadata: labelData.metadata || {}
  };

  // Store in D1
  await env.GABRIEL_DB.prepare(`
    INSERT INTO labels (id, name, tier, contact_email, contact_name, status, created_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    label.id,
    label.name,
    label.tier,
    label.contact_email,
    label.contact_name,
    label.status,
    label.created_at,
    JSON.stringify(label.metadata)
  ).run();

  // Log audit event
  await env.GABRIEL_DB.prepare(`
    INSERT INTO audit_events (id, operator_email, action, explanation, precondition_passed, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    label.contact_email,
    'LABEL_REGISTERED',
    `New label registered: ${label.name} (${label.tier} tier)`,
    1,
    new Date().toISOString()
  ).run();

  return {
    success: true,
    label_id: labelId,
    status: 'pending_verification',
    next_steps: [
      'Verify email address',
      'Complete billing setup',
      'Register first artist'
    ]
  };
}

/**
 * Get label dashboard data
 */
export async function getLabelDashboard(env, labelId) {
  // Get label
  const label = await env.GABRIEL_DB.prepare(`
    SELECT * FROM labels WHERE id = ?
  `).bind(labelId).first();

  if (!label) {
    return { success: false, error: 'Label not found' };
  }

  // Get artists count
  const artistCount = await env.GABRIEL_DB.prepare(`
    SELECT COUNT(*) as count FROM artists WHERE label_id = ?
  `).bind(labelId).first();

  // Get voices count
  const voiceCount = await env.GABRIEL_DB.prepare(`
    SELECT COUNT(*) as count FROM voice_models WHERE label_id = ?
  `).bind(labelId).first();

  // Get recent activity
  const recentActivity = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_events
    WHERE metadata LIKE ?
    ORDER BY created_at DESC
    LIMIT 10
  `).bind(`%${labelId}%`).all();

  // Get revenue (if any)
  const revenue = await env.GABRIEL_DB.prepare(`
    SELECT SUM(amount) as total FROM royalty_events WHERE label_id = ?
  `).bind(labelId).first();

  const tierConfig = LABEL_TIERS[label.tier.toUpperCase()] || LABEL_TIERS.PILOT;

  return {
    success: true,
    label: {
      id: label.id,
      name: label.name,
      tier: label.tier,
      status: label.status,
      created_at: label.created_at
    },
    stats: {
      artists: artistCount?.count || 0,
      voices: voiceCount?.count || 0,
      max_artists: tierConfig.max_artists,
      max_voices: tierConfig.max_voices
    },
    revenue: {
      total: revenue?.total || 0,
      currency: 'USD'
    },
    recent_activity: recentActivity.results || [],
    tier_config: tierConfig
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTIST MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register an artist under a label
 */
export async function registerArtist(env, labelId, artistData) {
  // Verify label exists and has capacity
  const label = await env.GABRIEL_DB.prepare(`
    SELECT * FROM labels WHERE id = ?
  `).bind(labelId).first();

  if (!label) {
    return { success: false, error: 'Label not found' };
  }

  const tierConfig = LABEL_TIERS[label.tier.toUpperCase()] || LABEL_TIERS.PILOT;

  // Check capacity
  const currentCount = await env.GABRIEL_DB.prepare(`
    SELECT COUNT(*) as count FROM artists WHERE label_id = ?
  `).bind(labelId).first();

  if (tierConfig.max_artists > 0 && currentCount.count >= tierConfig.max_artists) {
    return {
      success: false,
      error: `Artist limit reached for ${label.tier} tier (${tierConfig.max_artists})`
    };
  }

  const artistId = `artist_${crypto.randomUUID().slice(0, 8)}`;

  const artist = {
    id: artistId,
    label_id: labelId,
    name: artistData.name,
    stage_name: artistData.stage_name,
    email: artistData.email,
    status: 'active',
    consent_status: 'pending',
    created_at: new Date().toISOString(),
    metadata: artistData.metadata || {}
  };

  await env.GABRIEL_DB.prepare(`
    INSERT INTO artists (id, label_id, name, stage_name, email, status, consent_status, created_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    artist.id,
    artist.label_id,
    artist.name,
    artist.stage_name,
    artist.email,
    artist.status,
    artist.consent_status,
    artist.created_at,
    JSON.stringify(artist.metadata)
  ).run();

  // Log audit
  await env.GABRIEL_DB.prepare(`
    INSERT INTO audit_events (id, operator_email, action, explanation, precondition_passed, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    artistData.email,
    'ARTIST_REGISTERED',
    `Artist registered: ${artistData.stage_name || artistData.name} under ${label.name}`,
    1,
    new Date().toISOString()
  ).run();

  return {
    success: true,
    artist_id: artistId,
    status: 'active',
    consent_status: 'pending',
    next_steps: [
      'Complete consent agreement',
      'Register voice model',
      'Set royalty preferences'
    ]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK VOICE REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bulk register voice models for a label
 */
export async function bulkRegisterVoices(env, labelId, voices) {
  const results = [];

  for (const voiceData of voices) {
    try {
      const result = await registerVoiceModel(env, labelId, voiceData);
      results.push({
        artist_id: voiceData.artist_id,
        success: result.success,
        voice_id: result.voice_id,
        error: result.error
      });
    } catch (e) {
      results.push({
        artist_id: voiceData.artist_id,
        success: false,
        error: e.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: true,
    total: voices.length,
    successful,
    failed,
    results
  };
}

/**
 * Register a single voice model
 */
export async function registerVoiceModel(env, labelId, voiceData) {
  const voiceId = `voice_${crypto.randomUUID().slice(0, 8)}`;

  const voice = {
    id: voiceId,
    label_id: labelId,
    artist_id: voiceData.artist_id,
    name: voiceData.name,
    description: voiceData.description,
    sample_url: voiceData.sample_url,
    consent_token_id: null,
    status: 'pending_consent',
    created_at: new Date().toISOString(),
    metadata: voiceData.metadata || {}
  };

  await env.GABRIEL_DB.prepare(`
    INSERT INTO voice_models (id, label_id, artist_id, name, description, status, created_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    voice.id,
    voice.label_id,
    voice.artist_id,
    voice.name,
    voice.description,
    voice.status,
    voice.created_at,
    JSON.stringify(voice.metadata)
  ).run();

  return {
    success: true,
    voice_id: voiceId,
    status: 'pending_consent'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FAITH HILL WORKFLOW TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Nashville artist workflow templates
 */
export const WORKFLOW_TEMPLATES = {
  FAITH_HILL_PILOT: {
    id: 'faith_hill_pilot',
    name: 'Faith Hill Pilot Workflow',
    description: 'Complete voice estate management for Nashville artists',
    steps: [
      {
        id: 'artist_onboard',
        name: 'Artist Onboarding',
        description: 'Register artist and collect basic information',
        required_fields: ['name', 'stage_name', 'email', 'label_affiliation']
      },
      {
        id: 'consent_collection',
        name: 'Consent Collection',
        description: 'Collect explicit consent for voice synthesis',
        required_fields: ['consent_scope', 'consent_duration', 'revocation_terms'],
        consent_template: 'NOIZYVOX_ARTIST_CONSENT_V1'
      },
      {
        id: 'voice_capture',
        name: 'Voice Capture',
        description: 'Record high-quality voice samples',
        requirements: ['minimum_3_minutes', '48khz_24bit', 'quiet_environment'],
        output: 'voice_model_id'
      },
      {
        id: 'voice_clone',
        name: 'Voice Clone Creation',
        description: 'Create AI voice model from samples',
        model: 'NOIZYVOX_CLONE_V2',
        quality_check: true
      },
      {
        id: 'provenance_stamp',
        name: 'Provenance Stamping',
        description: 'Attach C2PA manifest with ZK proofs',
        proofs: ['consent_active', 'origin_verified', 'chain_intact']
      },
      {
        id: 'test_generation',
        name: 'Test Generation',
        description: 'Generate test stems for artist approval',
        output: 'test_stems'
      },
      {
        id: 'artist_approval',
        name: 'Artist Approval',
        description: 'Artist reviews and approves voice model',
        approval_required: true
      },
      {
        id: 'production_ready',
        name: 'Production Ready',
        description: 'Voice model cleared for production use',
        status: 'active'
      }
    ]
  },

  NASHVILLE_LABEL: {
    id: 'nashville_label',
    name: 'Nashville Label Workflow',
    description: 'Bulk artist onboarding for Nashville labels',
    steps: [
      {
        id: 'label_setup',
        name: 'Label Account Setup',
        description: 'Configure label account and billing'
      },
      {
        id: 'roster_import',
        name: 'Artist Roster Import',
        description: 'Bulk import artist roster from CSV/API'
      },
      {
        id: 'consent_campaign',
        name: 'Consent Campaign',
        description: 'Send consent requests to all artists'
      },
      {
        id: 'voice_capture_scheduling',
        name: 'Voice Capture Scheduling',
        description: 'Schedule studio sessions for voice capture'
      },
      {
        id: 'bulk_processing',
        name: 'Bulk Voice Processing',
        description: 'Process all captured voices into models'
      },
      {
        id: 'quality_review',
        name: 'Quality Review',
        description: 'Review all models for quality'
      },
      {
        id: 'production_launch',
        name: 'Production Launch',
        description: 'Launch all approved models'
      }
    ]
  }
};

/**
 * Create workflow instance
 */
export async function createWorkflowInstance(env, labelId, templateId, artistId) {
  const template = WORKFLOW_TEMPLATES[templateId];
  if (!template) {
    return { success: false, error: 'Unknown workflow template' };
  }

  const instanceId = `wf_${crypto.randomUUID().slice(0, 8)}`;

  const instance = {
    id: instanceId,
    template_id: templateId,
    label_id: labelId,
    artist_id: artistId,
    current_step: 0,
    status: 'in_progress',
    steps_completed: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await env.GABRIEL_DB.prepare(`
    INSERT INTO workflow_instances (id, template_id, label_id, artist_id, current_step, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    instance.id,
    instance.template_id,
    instance.label_id,
    instance.artist_id,
    instance.current_step,
    instance.status,
    instance.created_at
  ).run();

  return {
    success: true,
    workflow_id: instanceId,
    template: template.name,
    current_step: template.steps[0],
    total_steps: template.steps.length
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REVENUE TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record revenue event
 */
export async function recordRevenueEvent(env, eventData) {
  const eventId = `rev_${crypto.randomUUID().slice(0, 8)}`;

  // Calculate splits
  const grossAmount = eventData.amount;
  const gorunfreeTithe = grossAmount * 0.01; // 1% GORUNFREE
  const netAmount = grossAmount - gorunfreeTithe;
  const artistShare = netAmount * 0.75; // 75% to artist
  const platformShare = netAmount * 0.25; // 25% to platform

  await env.GABRIEL_DB.prepare(`
    INSERT INTO royalty_events (id, label_id, artist_id, voice_id, event_type, gross_amount, gorunfree_tithe, artist_share, platform_share, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    eventId,
    eventData.label_id,
    eventData.artist_id,
    eventData.voice_id,
    eventData.event_type,
    grossAmount,
    gorunfreeTithe,
    artistShare,
    platformShare,
    new Date().toISOString()
  ).run();

  return {
    success: true,
    event_id: eventId,
    splits: {
      gross: grossAmount,
      gorunfree_tithe: gorunfreeTithe,
      artist_share: artistShare,
      platform_share: platformShare
    }
  };
}

/**
 * Get revenue report
 */
export async function getRevenueReport(env, labelId, dateRange) {
  const { start, end } = dateRange;

  const revenue = await env.GABRIEL_DB.prepare(`
    SELECT
      SUM(gross_amount) as total_gross,
      SUM(gorunfree_tithe) as total_gorunfree,
      SUM(artist_share) as total_artist,
      SUM(platform_share) as total_platform,
      COUNT(*) as event_count
    FROM royalty_events
    WHERE label_id = ?
    AND created_at >= ?
    AND created_at <= ?
  `).bind(labelId, start, end).first();

  const byArtist = await env.GABRIEL_DB.prepare(`
    SELECT
      artist_id,
      SUM(gross_amount) as gross,
      SUM(artist_share) as artist_share,
      COUNT(*) as events
    FROM royalty_events
    WHERE label_id = ?
    AND created_at >= ?
    AND created_at <= ?
    GROUP BY artist_id
    ORDER BY gross DESC
  `).bind(labelId, start, end).all();

  return {
    success: true,
    period: { start, end },
    totals: {
      gross: revenue?.total_gross || 0,
      gorunfree_tithe: revenue?.total_gorunfree || 0,
      artist_payouts: revenue?.total_artist || 0,
      platform_revenue: revenue?.total_platform || 0,
      event_count: revenue?.event_count || 0
    },
    by_artist: byArtist.results || []
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  LABEL_TIERS,
  registerLabel,
  getLabelDashboard,
  registerArtist,
  bulkRegisterVoices,
  registerVoiceModel,
  WORKFLOW_TEMPLATES,
  createWorkflowInstance,
  recordRevenueEvent,
  getRevenueReport
};
