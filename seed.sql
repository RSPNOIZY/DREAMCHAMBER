-- HEAVEN Seed Data — Founding Actor RSP_001

-- RSP as founding actor
INSERT OR IGNORE INTO hvs_actors (actor_id, display_name, legal_name, email, country, is_founding, union_member, union_name, status)
VALUES ('RSP_001', 'RSP', 'Robert Stephen Plowman', 'rsp@noizyfish.com', 'CA', 1, 0, NULL, 'active');

-- Never Clauses (sacred boundaries)
INSERT OR IGNORE INTO hvs_never_clauses (actor_id, clause_code, clause_text, category, is_global)
VALUES
  ('RSP_001', 'NC_POLITICAL', 'My voice shall never be used for political campaigns, propaganda, or partisan messaging of any kind.', 'political', 1),
  ('RSP_001', 'NC_SEXUAL', 'My voice shall never be used in sexual, adult, or pornographic content.', 'sexual', 1),
  ('RSP_001', 'NC_WEAPONS', 'My voice shall never be used to promote weapons, violence, or content designed to cause harm.', 'weapons', 1),
  ('RSP_001', 'NC_DECEPTION', 'My voice shall never be used to deceive, impersonate, or commit fraud against any person.', 'deception', 1),
  ('RSP_001', 'NC_HATE', 'My voice shall never be used in hate speech or content that demeans any group or individual.', 'hate', 1),
  ('RSP_001', 'NC_TRANSFER', 'My voice rights shall never be transferred, sublicensed, or assigned without explicit written consent.', 'transfer', 1);

-- Missing never clause (NC_SURVEILLANCE — was in CLAUDE.md as 7th personal clause)
INSERT OR IGNORE INTO hvs_never_clauses (actor_id, clause_code, clause_text, category, is_global)
VALUES
  ('RSP_001', 'NC_SURVEILLANCE', 'My voice shall never be used in surveillance, tracking, or biometric identification systems without explicit consent.', 'surveillance', 1),
  ('RSP_001', 'NC_SYSTEM_INTEGRITY', 'No synthesis shall proceed without a valid, active consent token linked to my actor record.', 'system', 1),
  ('RSP_001', 'NC_SYSTEM_TRANSFER', 'Voice DNA and all derivative models are non-transferable outside the NOIZY consent kernel without court order.', 'system', 1);

-- RSP_001 Estate Record (100-year OAIS preservation)
INSERT OR IGNORE INTO hvs_estates (estate_id, actor_id, trustee_name, trustee_email, preservation_standard, retention_years, status)
VALUES ('EST-RSP-001', 'RSP_001', 'Robert Stephen Plowman', 'rsplowman@icloud.com', 'OAIS/PREMIS', 100, 'active');

-- Union Tiers (5-tier structure per CLAUDE.md)
INSERT OR IGNORE INTO hvs_union_tiers (tier_name, min_earnings_cad, max_earnings_cad, contribution_pct, description)
VALUES
  ('emerging',   0,       10000,   2.0, 'Emerging voice actor — 2% union contribution from artist share'),
  ('developing', 10000,   50000,   4.0, 'Developing voice actor — 4% union contribution'),
  ('established',50000,   150000,  6.0, 'Established voice actor — 6% union contribution'),
  ('prominent',  150000,  500000,  8.0, 'Prominent voice actor — 8% union contribution'),
  ('landmark',   500000,  NULL,   10.0, 'Landmark voice actor — 10% union contribution');

-- GENESIS ledger entry for RSP_001 estate creation
INSERT OR IGNORE INTO noizy_ledger (event_id, actor_id, event_type, payload_json, source_system, recorded_at)
VALUES ('GENESIS-RSP-001', 'RSP_001', 'system.genesis', '{"message":"NOIZY Empire founded. RSP_001 is the first voice. All rights reserved. Consent is law.","estate_id":"EST-RSP-001","version":"17.0.0"}', 'HEAVEN', datetime('now'));

-- Rate Table (standard NOIZY rates)
INSERT OR IGNORE INTO hvs_rate_table (use_category, base_fee_cad, per_minute_cad, description)
VALUES
  ('commercial_ad', 500.00, 25.00, 'Commercial advertising — TV, radio, digital'),
  ('audiobook', 200.00, 15.00, 'Audiobook narration'),
  ('podcast', 100.00, 10.00, 'Podcast voiceover or hosting'),
  ('gaming', 300.00, 20.00, 'Video game character voice'),
  ('animation', 350.00, 20.00, 'Animated film or series'),
  ('corporate', 250.00, 15.00, 'Corporate training, presentations'),
  ('music', 400.00, 30.00, 'Music production, singing synthesis'),
  ('personal', 0.00, 0.00, 'Personal non-commercial use'),
  ('educational', 50.00, 5.00, 'Educational content'),
  ('accessibility', 0.00, 0.00, 'Accessibility tools for disabled persons');
