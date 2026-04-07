/**
 * VOICE MARKET v0.1
 *
 * Monetization flywheel built on verified governance.
 * "Higher-trust, higher-control voice licensing."
 *
 * What this is:
 * - Creator profiles with voice listings
 * - Revocable permissions
 * - Allowed-use matrix
 * - Payout tracking
 * - License request flow
 *
 * What this is NOT:
 * - A commodity clone store
 * - "We also sell voices"
 *
 * Moat: Governance, revocation, auditability — not generation.
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// VOICE MARKET CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const VOICE_MARKET_VERSION = '0.1.0';

// Revenue split (locked at protocol level)
export const REVENUE_SPLIT = {
  creator: 75,      // 75% to creator (CONSTITUTIONAL — never negotiate down)
  platform: 24,     // 24% to NOIZY
  gorunfree: 1      // 1% to NOIZYKIDZ (irremovable)
};

// Use types for allowed-use matrix
export const USE_TYPES = {
  AUDIOBOOK: { id: 'audiobook', label: 'Audiobook Narration', category: 'publishing' },
  PODCAST: { id: 'podcast', label: 'Podcast Voice', category: 'media' },
  COMMERCIAL: { id: 'commercial', label: 'Commercial Advertisement', category: 'advertising' },
  GAME: { id: 'game', label: 'Video Game Character', category: 'entertainment' },
  FILM: { id: 'film', label: 'Film/TV Voice', category: 'entertainment' },
  MUSIC: { id: 'music', label: 'Music Production', category: 'music' },
  PERSONAL: { id: 'personal', label: 'Personal/Non-Commercial', category: 'personal' },
  ENTERPRISE: { id: 'enterprise', label: 'Enterprise/Internal', category: 'business' }
};

// License durations
export const LICENSE_DURATIONS = {
  ONE_TIME: { id: 'one_time', label: 'Single Use', days: null },
  MONTHLY: { id: 'monthly', label: 'Monthly', days: 30 },
  ANNUAL: { id: 'annual', label: 'Annual', days: 365 },
  PERPETUAL: { id: 'perpetual', label: 'Perpetual', days: null }
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR PROFILE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create or update creator profile
 */
export async function createCreatorProfile(env, data) {
  const profile = {
    creator_id: data.creator_id || `CRE_${crypto.randomUUID().slice(0, 12)}`,
    actor_id: data.actor_id,        // Link to HVS actor
    display_name: data.display_name,
    bio: data.bio || null,
    avatar_url: data.avatar_url || null,
    verified: data.verified || false,
    tier: data.tier || 'GUILD',     // FOUNDING / GUILD / ASSOCIATE
    total_earnings: 0,
    total_licenses: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await env.GABRIEL_DB
    .prepare(`
      INSERT INTO voice_market_creators
        (creator_id, actor_id, display_name, bio, avatar_url, verified, tier, total_earnings, total_licenses, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(creator_id) DO UPDATE SET
        display_name = excluded.display_name,
        bio = excluded.bio,
        avatar_url = excluded.avatar_url,
        verified = excluded.verified,
        tier = excluded.tier,
        updated_at = excluded.updated_at
    `)
    .bind(
      profile.creator_id,
      profile.actor_id,
      profile.display_name,
      profile.bio,
      profile.avatar_url,
      profile.verified ? 1 : 0,
      profile.tier,
      profile.total_earnings,
      profile.total_licenses,
      profile.created_at,
      profile.updated_at
    )
    .run();

  return { success: true, profile };
}

/**
 * Get creator profile
 */
export async function getCreatorProfile(env, creatorId) {
  const profile = await env.GABRIEL_DB
    .prepare('SELECT * FROM voice_market_creators WHERE creator_id = ?')
    .bind(creatorId)
    .first();

  if (!profile) {
    return { success: false, error: 'Creator not found' };
  }

  // Get voice listings
  const listings = await env.GABRIEL_DB
    .prepare('SELECT * FROM voice_market_listings WHERE creator_id = ? AND status = ?')
    .bind(creatorId, 'ACTIVE')
    .all();

  return {
    success: true,
    profile: {
      ...profile,
      verified: profile.verified === 1,
      listings: listings.results || []
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE LISTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create voice listing
 */
export async function createVoiceListing(env, data) {
  const listing = {
    listing_id: data.listing_id || `LST_${crypto.randomUUID().slice(0, 12)}`,
    creator_id: data.creator_id,
    voice_model_id: data.voice_model_id,
    title: data.title,
    description: data.description || null,
    sample_url: data.sample_url || null,
    status: 'ACTIVE',

    // Pricing
    base_price_cents: data.base_price_cents || 1000,  // $10.00 default
    price_per_1k_chars: data.price_per_1k_chars || 3, // $0.03 per 1K chars (ElevenLabs benchmark)

    // Allowed-use matrix (JSON)
    allowed_uses: JSON.stringify(data.allowed_uses || Object.keys(USE_TYPES)),
    blocked_uses: JSON.stringify(data.blocked_uses || []),

    // Territories
    territories: JSON.stringify(data.territories || ['GLOBAL']),
    blocked_territories: JSON.stringify(data.blocked_territories || []),

    // License options
    license_types: JSON.stringify(data.license_types || ['ONE_TIME', 'MONTHLY', 'ANNUAL']),

    // Governance
    requires_approval: data.requires_approval ? 1 : 0,
    revocable: 1,  // Always revocable (CONSTITUTIONAL)

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await env.GABRIEL_DB
    .prepare(`
      INSERT INTO voice_market_listings
        (listing_id, creator_id, voice_model_id, title, description, sample_url, status,
         base_price_cents, price_per_1k_chars, allowed_uses, blocked_uses,
         territories, blocked_territories, license_types, requires_approval, revocable,
         created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      listing.listing_id,
      listing.creator_id,
      listing.voice_model_id,
      listing.title,
      listing.description,
      listing.sample_url,
      listing.status,
      listing.base_price_cents,
      listing.price_per_1k_chars,
      listing.allowed_uses,
      listing.blocked_uses,
      listing.territories,
      listing.blocked_territories,
      listing.license_types,
      listing.requires_approval,
      listing.revocable,
      listing.created_at,
      listing.updated_at
    )
    .run();

  return { success: true, listing };
}

/**
 * Get voice listing
 */
export async function getVoiceListing(env, listingId) {
  const listing = await env.GABRIEL_DB
    .prepare('SELECT * FROM voice_market_listings WHERE listing_id = ?')
    .bind(listingId)
    .first();

  if (!listing) {
    return { success: false, error: 'Listing not found' };
  }

  return {
    success: true,
    listing: {
      ...listing,
      allowed_uses: JSON.parse(listing.allowed_uses || '[]'),
      blocked_uses: JSON.parse(listing.blocked_uses || '[]'),
      territories: JSON.parse(listing.territories || '[]'),
      blocked_territories: JSON.parse(listing.blocked_territories || '[]'),
      license_types: JSON.parse(listing.license_types || '[]'),
      requires_approval: listing.requires_approval === 1,
      revocable: listing.revocable === 1
    }
  };
}

/**
 * Update listing allowed-use matrix
 */
export async function updateAllowedUses(env, listingId, allowedUses, blockedUses = []) {
  await env.GABRIEL_DB
    .prepare(`
      UPDATE voice_market_listings
      SET allowed_uses = ?, blocked_uses = ?, updated_at = ?
      WHERE listing_id = ?
    `)
    .bind(
      JSON.stringify(allowedUses),
      JSON.stringify(blockedUses),
      new Date().toISOString(),
      listingId
    )
    .run();

  return { success: true, listing_id: listingId };
}

/**
 * Toggle revocation (pause listing)
 */
export async function toggleListingStatus(env, listingId, status) {
  const validStatuses = ['ACTIVE', 'PAUSED', 'REVOKED'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' };
  }

  await env.GABRIEL_DB
    .prepare(`
      UPDATE voice_market_listings
      SET status = ?, updated_at = ?
      WHERE listing_id = ?
    `)
    .bind(status, new Date().toISOString(), listingId)
    .run();

  return { success: true, listing_id: listingId, status };
}

// ═══════════════════════════════════════════════════════════════════════════
// LICENSE REQUEST FLOW
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request a license
 */
export async function requestLicense(env, data) {
  const request = {
    request_id: `REQ_${crypto.randomUUID().slice(0, 12)}`,
    listing_id: data.listing_id,
    requester_id: data.requester_id,
    requester_name: data.requester_name,
    requester_email: data.requester_email,

    // Use details
    use_type: data.use_type,
    use_description: data.use_description || null,
    license_duration: data.license_duration || 'ONE_TIME',
    territory: data.territory || 'GLOBAL',

    // Estimated usage
    estimated_chars: data.estimated_chars || 0,

    // Status
    status: 'PENDING',

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Check if use type is allowed
  const listing = await getVoiceListing(env, data.listing_id);
  if (!listing.success) {
    return { success: false, error: 'Listing not found' };
  }

  if (listing.listing.blocked_uses.includes(data.use_type)) {
    return { success: false, error: 'Use type is blocked by creator' };
  }

  if (listing.listing.allowed_uses.length > 0 && !listing.listing.allowed_uses.includes(data.use_type)) {
    return { success: false, error: 'Use type is not in allowed list' };
  }

  // Calculate price
  const basePrice = listing.listing.base_price_cents;
  const charPrice = listing.listing.price_per_1k_chars * Math.ceil(request.estimated_chars / 1000);
  const totalPrice = basePrice + charPrice;

  request.quoted_price_cents = totalPrice;
  request.creator_share_cents = Math.floor(totalPrice * REVENUE_SPLIT.creator / 100);
  request.platform_share_cents = Math.floor(totalPrice * REVENUE_SPLIT.platform / 100);
  request.gorunfree_share_cents = Math.floor(totalPrice * REVENUE_SPLIT.gorunfree / 100);

  // Auto-approve if creator doesn't require approval
  if (!listing.listing.requires_approval) {
    request.status = 'APPROVED';
  }

  await env.GABRIEL_DB
    .prepare(`
      INSERT INTO voice_market_requests
        (request_id, listing_id, requester_id, requester_name, requester_email,
         use_type, use_description, license_duration, territory, estimated_chars,
         quoted_price_cents, creator_share_cents, platform_share_cents, gorunfree_share_cents,
         status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      request.request_id,
      request.listing_id,
      request.requester_id,
      request.requester_name,
      request.requester_email,
      request.use_type,
      request.use_description,
      request.license_duration,
      request.territory,
      request.estimated_chars,
      request.quoted_price_cents,
      request.creator_share_cents,
      request.platform_share_cents,
      request.gorunfree_share_cents,
      request.status,
      request.created_at,
      request.updated_at
    )
    .run();

  return { success: true, request };
}

/**
 * Approve/reject license request
 */
export async function processLicenseRequest(env, requestId, action, reason = null) {
  const validActions = ['APPROVED', 'REJECTED'];
  if (!validActions.includes(action)) {
    return { success: false, error: 'Invalid action' };
  }

  await env.GABRIEL_DB
    .prepare(`
      UPDATE voice_market_requests
      SET status = ?, rejection_reason = ?, updated_at = ?
      WHERE request_id = ?
    `)
    .bind(action, reason, new Date().toISOString(), requestId)
    .run();

  return { success: true, request_id: requestId, status: action };
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYOUT TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record a payout
 */
export async function recordPayout(env, data) {
  const payout = {
    payout_id: `PAY_${crypto.randomUUID().slice(0, 12)}`,
    creator_id: data.creator_id,
    request_id: data.request_id,
    license_id: data.license_id,

    gross_amount_cents: data.gross_amount_cents,
    creator_amount_cents: Math.floor(data.gross_amount_cents * REVENUE_SPLIT.creator / 100),
    platform_amount_cents: Math.floor(data.gross_amount_cents * REVENUE_SPLIT.platform / 100),
    gorunfree_amount_cents: Math.floor(data.gross_amount_cents * REVENUE_SPLIT.gorunfree / 100),

    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  await env.GABRIEL_DB
    .prepare(`
      INSERT INTO voice_market_payouts
        (payout_id, creator_id, request_id, license_id,
         gross_amount_cents, creator_amount_cents, platform_amount_cents, gorunfree_amount_cents,
         status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      payout.payout_id,
      payout.creator_id,
      payout.request_id,
      payout.license_id,
      payout.gross_amount_cents,
      payout.creator_amount_cents,
      payout.platform_amount_cents,
      payout.gorunfree_amount_cents,
      payout.status,
      payout.created_at
    )
    .run();

  // Update creator totals
  await env.GABRIEL_DB
    .prepare(`
      UPDATE voice_market_creators
      SET total_earnings = total_earnings + ?,
          total_licenses = total_licenses + 1,
          updated_at = ?
      WHERE creator_id = ?
    `)
    .bind(payout.creator_amount_cents, new Date().toISOString(), data.creator_id)
    .run();

  return { success: true, payout };
}

/**
 * Get creator payout dashboard
 */
export async function getPayoutDashboard(env, creatorId) {
  // Get totals
  const profile = await env.GABRIEL_DB
    .prepare('SELECT total_earnings, total_licenses FROM voice_market_creators WHERE creator_id = ?')
    .bind(creatorId)
    .first();

  if (!profile) {
    return { success: false, error: 'Creator not found' };
  }

  // Get recent payouts
  const payouts = await env.GABRIEL_DB
    .prepare(`
      SELECT * FROM voice_market_payouts
      WHERE creator_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `)
    .bind(creatorId)
    .all();

  // Get pending payouts
  const pending = await env.GABRIEL_DB
    .prepare(`
      SELECT SUM(creator_amount_cents) as pending_cents
      FROM voice_market_payouts
      WHERE creator_id = ? AND status = 'PENDING'
    `)
    .bind(creatorId)
    .first();

  return {
    success: true,
    dashboard: {
      total_earnings_cents: profile.total_earnings,
      total_licenses: profile.total_licenses,
      pending_payout_cents: pending?.pending_cents || 0,
      revenue_split: REVENUE_SPLIT,
      recent_payouts: payouts.results || []
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

export async function handleVoiceMarketAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/voice-market', '');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-NOIZY-Key',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Route handling
  const pathParts = path.split('/').filter(Boolean);

  switch (pathParts[0]) {
    // ─────────────────────────────────────────────────────────────────────
    // GET /voice-market/ — Market status
    // ─────────────────────────────────────────────────────────────────────
    case undefined:
    case '':
      return new Response(JSON.stringify({
        name: 'NOIZY Voice Market',
        version: VOICE_MARKET_VERSION,
        tagline: 'Higher-trust, higher-control voice licensing.',
        revenue_split: REVENUE_SPLIT,
        use_types: Object.values(USE_TYPES),
        license_durations: Object.values(LICENSE_DURATIONS),
        moat: 'Governance, revocation, and auditability — not commodity generation.',
        endpoints: {
          creators: 'GET/POST /voice-market/creators',
          listings: 'GET/POST /voice-market/listings',
          requests: 'POST /voice-market/requests',
          dashboard: 'GET /voice-market/dashboard/:creator_id'
        }
      }, null, 2), { headers: corsHeaders });

    // ─────────────────────────────────────────────────────────────────────
    // Creators
    // ─────────────────────────────────────────────────────────────────────
    case 'creators':
      if (request.method === 'POST') {
        const data = await request.json();
        const result = await createCreatorProfile(env, data);
        return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
      }

      if (pathParts[1]) {
        const result = await getCreatorProfile(env, pathParts[1]);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ error: 'Creator ID required' }), {
        status: 400,
        headers: corsHeaders
      });

    // ─────────────────────────────────────────────────────────────────────
    // Listings
    // ─────────────────────────────────────────────────────────────────────
    case 'listings':
      if (request.method === 'POST') {
        const data = await request.json();
        const result = await createVoiceListing(env, data);
        return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
      }

      if (pathParts[1]) {
        // GET /listings/:id
        if (request.method === 'GET') {
          const result = await getVoiceListing(env, pathParts[1]);
          return new Response(JSON.stringify(result, null, 2), {
            status: result.success ? 200 : 404,
            headers: corsHeaders
          });
        }

        // PUT /listings/:id/uses — Update allowed uses
        if (request.method === 'PUT' && pathParts[2] === 'uses') {
          const data = await request.json();
          const result = await updateAllowedUses(env, pathParts[1], data.allowed_uses, data.blocked_uses);
          return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
        }

        // PUT /listings/:id/status — Toggle status
        if (request.method === 'PUT' && pathParts[2] === 'status') {
          const data = await request.json();
          const result = await toggleListingStatus(env, pathParts[1], data.status);
          return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
        }
      }

      return new Response(JSON.stringify({ error: 'Listing ID required' }), {
        status: 400,
        headers: corsHeaders
      });

    // ─────────────────────────────────────────────────────────────────────
    // Requests
    // ─────────────────────────────────────────────────────────────────────
    case 'requests':
      if (request.method === 'POST') {
        const data = await request.json();
        const result = await requestLicense(env, data);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }

      // PUT /requests/:id — Process request
      if (request.method === 'PUT' && pathParts[1]) {
        const data = await request.json();
        const result = await processLicenseRequest(env, pathParts[1], data.action, data.reason);
        return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'POST required' }), {
        status: 405,
        headers: corsHeaders
      });

    // ─────────────────────────────────────────────────────────────────────
    // Dashboard
    // ─────────────────────────────────────────────────────────────────────
    case 'dashboard':
      if (pathParts[1]) {
        const result = await getPayoutDashboard(env, pathParts[1]);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ error: 'Creator ID required' }), {
        status: 400,
        headers: corsHeaders
      });

    default:
      return new Response(JSON.stringify({
        error: 'Unknown endpoint',
        available: ['creators', 'listings', 'requests', 'dashboard']
      }), {
        status: 404,
        headers: corsHeaders
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  VOICE_MARKET_VERSION,
  REVENUE_SPLIT,
  USE_TYPES,
  LICENSE_DURATIONS,
  createCreatorProfile,
  getCreatorProfile,
  createVoiceListing,
  getVoiceListing,
  updateAllowedUses,
  toggleListingStatus,
  requestLicense,
  processLicenseRequest,
  recordPayout,
  getPayoutDashboard,
  handleVoiceMarketAPI
};
