-- VOICE MARKET SCHEMA
-- Migration: 0008_voice_market.sql
-- Purpose: Creator profiles, voice listings, license requests, payouts
--
-- Revenue split (CONSTITUTIONAL — never negotiate down):
-- - Creator: 75%
-- - Platform: 24%
-- - GORUNFREE: 1% (irremovable)
-- ============================================================

-- Creator profiles
CREATE TABLE IF NOT EXISTS voice_market_creators (
    creator_id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,                    -- Link to HVS actor
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    verified INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'GUILD',                 -- FOUNDING / GUILD / ASSOCIATE
    total_earnings INTEGER DEFAULT 0,          -- Cents
    total_licenses INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creators_actor ON voice_market_creators(actor_id);
CREATE INDEX IF NOT EXISTS idx_creators_verified ON voice_market_creators(verified);

-- Voice listings
CREATE TABLE IF NOT EXISTS voice_market_listings (
    listing_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    voice_model_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sample_url TEXT,
    status TEXT DEFAULT 'ACTIVE',              -- ACTIVE / PAUSED / REVOKED

    -- Pricing (cents)
    base_price_cents INTEGER DEFAULT 1000,     -- $10.00 default
    price_per_1k_chars INTEGER DEFAULT 3,      -- $0.03 per 1K chars

    -- Allowed-use matrix (JSON arrays)
    allowed_uses TEXT DEFAULT '[]',
    blocked_uses TEXT DEFAULT '[]',

    -- Territories (JSON arrays)
    territories TEXT DEFAULT '["GLOBAL"]',
    blocked_territories TEXT DEFAULT '[]',

    -- License options (JSON array)
    license_types TEXT DEFAULT '["ONE_TIME", "MONTHLY", "ANNUAL"]',

    -- Governance
    requires_approval INTEGER DEFAULT 0,
    revocable INTEGER DEFAULT 1,               -- Always 1 (CONSTITUTIONAL)

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (creator_id) REFERENCES voice_market_creators(creator_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_creator ON voice_market_listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON voice_market_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_voice_model ON voice_market_listings(voice_model_id);

-- License requests
CREATE TABLE IF NOT EXISTS voice_market_requests (
    request_id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,

    -- Use details
    use_type TEXT NOT NULL,
    use_description TEXT,
    license_duration TEXT DEFAULT 'ONE_TIME',
    territory TEXT DEFAULT 'GLOBAL',
    estimated_chars INTEGER DEFAULT 0,

    -- Pricing (cents)
    quoted_price_cents INTEGER DEFAULT 0,
    creator_share_cents INTEGER DEFAULT 0,
    platform_share_cents INTEGER DEFAULT 0,
    gorunfree_share_cents INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'PENDING',             -- PENDING / APPROVED / REJECTED / CANCELLED
    rejection_reason TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (listing_id) REFERENCES voice_market_listings(listing_id)
);

CREATE INDEX IF NOT EXISTS idx_requests_listing ON voice_market_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON voice_market_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON voice_market_requests(requester_id);

-- Payouts
CREATE TABLE IF NOT EXISTS voice_market_payouts (
    payout_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    request_id TEXT,
    license_id TEXT,

    -- Amounts (cents)
    gross_amount_cents INTEGER NOT NULL,
    creator_amount_cents INTEGER NOT NULL,     -- 75%
    platform_amount_cents INTEGER NOT NULL,    -- 24%
    gorunfree_amount_cents INTEGER NOT NULL,   -- 1%

    -- Status
    status TEXT DEFAULT 'PENDING',             -- PENDING / PROCESSING / COMPLETED / FAILED
    payout_reference TEXT,                     -- External payment reference (Stripe, etc.)

    created_at TEXT NOT NULL,

    FOREIGN KEY (creator_id) REFERENCES voice_market_creators(creator_id)
);

CREATE INDEX IF NOT EXISTS idx_payouts_creator ON voice_market_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON voice_market_payouts(status);

-- ============================================================
-- GOVERNANCE VIEWS
-- ============================================================

-- Active listings summary
CREATE VIEW IF NOT EXISTS voice_market_active_listings AS
SELECT
    l.listing_id,
    l.title,
    c.display_name as creator_name,
    c.verified as creator_verified,
    l.base_price_cents,
    l.status
FROM voice_market_listings l
JOIN voice_market_creators c ON l.creator_id = c.creator_id
WHERE l.status = 'ACTIVE';

-- Creator earnings summary
CREATE VIEW IF NOT EXISTS voice_market_earnings_summary AS
SELECT
    c.creator_id,
    c.display_name,
    c.tier,
    c.total_earnings / 100.0 as total_earnings_dollars,
    c.total_licenses,
    COALESCE(SUM(CASE WHEN p.status = 'PENDING' THEN p.creator_amount_cents ELSE 0 END), 0) / 100.0 as pending_dollars
FROM voice_market_creators c
LEFT JOIN voice_market_payouts p ON c.creator_id = p.creator_id
GROUP BY c.creator_id;
