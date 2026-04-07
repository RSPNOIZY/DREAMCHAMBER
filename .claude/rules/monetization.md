---
description: Royalty architecture, union tiers, licensing model, and artist-first economics.
paths:
  - "seed.sql"
  - "schema.sql"
  - "src/index.js"
---

# MONETIZATION — ARTIST-FIRST ECONOMICS

## Royalty Architecture

| Actor Type | Artist Share | NOIZY Cut | Union (from artist share) |
|------------|-------------|-----------|--------------------------|
| RSP_001 (Founding) | 85% | 15% | 2%–10% tiered |
| Standard Actor | 75% | 25% | 2%–10% tiered |

**75/25 split — artists and actors take 75%. Always.**

## Union Tiers (seeded in hvs_union_tiers)

| Tier | Rate | Description |
|------|------|-------------|
| Emerging | 2% | New actors |
| Developing | 4% | Growing catalog |
| Established | 6% | Proven track record |
| Prominent | 8% | Industry recognition |
| Landmark | 10% | Legacy status |

## Rate Table (10 use categories in hvs_rate_table)

Pricing varies by use category (commercial, personal, educational, etc.). Each category has a base rate per synthesis request. Union tier percentage is deducted from the artist's share, not the NOIZY cut.

## Licensing Model

- Licenses are scoped: purpose, territory, duration, descendant
- License registry in `hvs_licenses` table
- Licensee registry in `hvs_licensees` table
- All license events logged to `noizy_ledger`

## Anti-Exploitation Rules

- If competitors undercut on price, we outproduce them on authentic art and community
- Authentic, abundant art is the deterrent to cash-grab opportunists
- Creators take the driver's seat. Greedy interests take the backseat
- Build so much art, so well-protected, that extraction becomes impossible
