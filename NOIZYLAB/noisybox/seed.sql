-- ============================================================
-- NOISY BOX V0.1 — Seed Data
-- 5 test creator personas + consent + voices + characters
-- ============================================================

-- 1. FIVE TEST CREATORS (realistic archetypes spanning the voice industry)

INSERT INTO creators (id, display_name, legal_name, archetype, bio, contact_email, status, onboarded_at, created_at, updated_at) VALUES
('cr_001', 'Amara Osei', 'Amara Nana Osei', 'vocalist',
 'West African-Canadian vocalist. Warm contralto with a 3-octave range. Known for Afrobeats vocal texture and spoken-word narration. 12 years in animation and commercial VO.',
 'amara@test.noizyvox.com', 'active', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z'),

('cr_002', 'Marcus Chen', 'Marcus Wei Chen', 'character_actor',
 'Character actor and dialect specialist. 200+ characters in games and animation. Range: villain baritone to child tenor. Fluent in Mandarin, Cantonese, English.',
 'marcus@test.noizyvox.com', 'active', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z'),

('cr_003', 'Elise Dubois', 'Elise Marie Dubois', 'narrator',
 'Audiobook narrator and documentary voice. Calm, measured, authoritative. 15 years in broadcast. Known for science and history narration. Bilingual French-English.',
 'elise@test.noizyvox.com', 'active', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z'),

('cr_004', 'Javier Reyes', 'Javier Antonio Reyes', 'singer',
 'Latin jazz vocalist and songwriter. Rich baritone with R&B inflection. Session singer for 8 years. Fluent in Spanish, Portuguese, English. Specializes in emotional ballad delivery.',
 'javier@test.noizyvox.com', 'active', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z'),

('cr_005', 'Nkechi Adeyemi', 'Nkechi Grace Adeyemi', 'voice_over',
 'Corporate and commercial VO artist. Clear, professional, warm. Known for tech brand narration and e-learning. 6 years in the industry. Nigerian-British accent versatility.',
 'nkechi@test.noizyvox.com', 'active', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z', '2026-04-02T00:00:00Z');

-- 2. CONSENT PROFILES — Each creator grants consent with specific never-clauses

INSERT INTO consent_profiles (id, creator_id, consent_hash, never_clauses_hash, never_clauses_json, token_id, terms_version, status, granted_at) VALUES
('cp_001', 'cr_001', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'nc_hash_001', '[{"clause":"no_political_ads","description":"Voice may not be used in political advertising","severity":"absolute"},{"clause":"no_weapons_marketing","description":"Voice may not promote weapons or military recruitment","severity":"absolute"},{"clause":"no_adult_content","description":"Voice may not be used in adult/explicit content","severity":"absolute"}]', 'ct_amara001token', '1.0', 'active', '2026-04-02T00:00:00Z'),

('cp_002', 'cr_002', 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'nc_hash_002', '[{"clause":"no_hate_speech","description":"Voice may not be used to generate hate speech or discriminatory content","severity":"absolute"},{"clause":"no_deepfake_impersonation","description":"Voice may not be used to impersonate real people without their consent","severity":"absolute"}]', 'ct_marcus002token', '1.0', 'active', '2026-04-02T00:00:00Z'),

('cp_003', 'cr_003', 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'nc_hash_003', '[{"clause":"no_tobacco_alcohol","description":"Voice may not promote tobacco or alcohol products","severity":"absolute"},{"clause":"no_gambling","description":"Voice may not be used in gambling advertisements","severity":"contextual"},{"clause":"no_political_ads","description":"Voice may not be used in political advertising","severity":"absolute"}]', 'ct_elise003token', '1.0', 'active', '2026-04-02T00:00:00Z'),

('cp_004', 'cr_004', 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', 'nc_hash_004', '[{"clause":"no_adult_content","description":"Voice may not be used in explicit sexual content","severity":"absolute"},{"clause":"no_ai_training_without_notice","description":"Voice data may not be used to train AI models without explicit per-model consent","severity":"absolute"}]', 'ct_javier004token', '1.0', 'active', '2026-04-02T00:00:00Z'),

('cp_005', 'cr_005', 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 'nc_hash_005', '[{"clause":"no_weapons_marketing","description":"Voice may not promote weapons or military recruitment","severity":"absolute"},{"clause":"no_surveillance","description":"Voice may not be used in surveillance or tracking systems","severity":"absolute"},{"clause":"no_misinformation","description":"Voice may not be used to generate false news or misinformation","severity":"absolute"}]', 'ct_nkechi005token', '1.0', 'active', '2026-04-02T00:00:00Z');

-- 3. VOICE ASSETS — Captured recordings

INSERT INTO voice_assets (id, creator_id, consent_profile_id, capture_ref, sample_rate, bit_depth, channels, duration_ms, format, quality_gate_status, status) VALUES
('va_001', 'cr_001', 'cp_001', 'r2://noisybox/captures/amara_baseline_01.wav', 48000, 24, 1, 180000, 'wav', 'passed', 'active'),
('va_002', 'cr_001', 'cp_001', 'r2://noisybox/captures/amara_warm_02.wav', 48000, 24, 1, 120000, 'wav', 'passed', 'active'),
('va_003', 'cr_002', 'cp_002', 'r2://noisybox/captures/marcus_villain_01.wav', 48000, 24, 1, 90000, 'wav', 'passed', 'active'),
('va_004', 'cr_002', 'cp_002', 'r2://noisybox/captures/marcus_child_02.wav', 48000, 24, 1, 75000, 'wav', 'passed', 'active'),
('va_005', 'cr_003', 'cp_003', 'r2://noisybox/captures/elise_narrative_01.wav', 48000, 24, 1, 300000, 'wav', 'passed', 'active'),
('va_006', 'cr_004', 'cp_004', 'r2://noisybox/captures/javier_ballad_01.wav', 48000, 24, 1, 240000, 'wav', 'passed', 'active'),
('va_007', 'cr_004', 'cp_004', 'r2://noisybox/captures/javier_uptempo_02.wav', 48000, 24, 1, 180000, 'wav', 'passed', 'active'),
('va_008', 'cr_005', 'cp_005', 'r2://noisybox/captures/nkechi_corporate_01.wav', 48000, 24, 1, 60000, 'wav', 'passed', 'active'),
('va_009', 'cr_005', 'cp_005', 'r2://noisybox/captures/nkechi_warm_02.wav', 48000, 24, 1, 90000, 'wav', 'passed', 'active'),
('va_010', 'cr_001', 'cp_001', 'r2://noisybox/captures/amara_spokenword_03.wav', 48000, 24, 1, 200000, 'wav', 'passed', 'active');

-- 4. SESSIONS

INSERT INTO sessions (id, creator_id, session_type, director_notes, start_ts, status) VALUES
('ses_001', 'cr_001', 'capture', 'Baseline capture: warm contralto, natural breath, minimal processing', '2026-04-02T01:00:00Z', 'completed'),
('ses_002', 'cr_002', 'character', 'Character range test: villain to child, 6 variants', '2026-04-02T01:30:00Z', 'completed'),
('ses_003', 'cr_003', 'capture', 'Narrative baseline: measured pace, documentary tone', '2026-04-02T02:00:00Z', 'completed'),
('ses_004', 'cr_004', 'capture', 'Vocal range: ballad to uptempo, emotional dynamic', '2026-04-02T02:30:00Z', 'completed'),
('ses_005', 'cr_005', 'capture', 'Corporate VO: clarity test, warmth calibration', '2026-04-02T03:00:00Z', 'completed');

-- 5. TAKES

INSERT INTO takes (id, session_id, take_no, voice_asset_id, blessed, deviation_flags, duration_ms, notes) VALUES
('tk_001', 'ses_001', 1, 'va_001', 1, NULL, 180000, 'Clean take. Natural breath texture excellent.'),
('tk_002', 'ses_001', 2, 'va_002', 1, NULL, 120000, 'Warm variant. Slightly lower register. Gorgeous.'),
('tk_003', 'ses_002', 1, 'va_003', 1, NULL, 90000, 'Villain voice: deep, menacing, controlled.'),
('tk_004', 'ses_002', 2, 'va_004', 1, NULL, 75000, 'Child voice: bright, energetic, believable age.'),
('tk_005', 'ses_003', 1, 'va_005', 1, NULL, 300000, 'Documentary tone: measured, authoritative, warm.'),
('tk_006', 'ses_004', 1, 'va_006', 1, NULL, 240000, 'Emotional ballad delivery. Stunning control.'),
('tk_007', 'ses_004', 2, 'va_007', 1, NULL, 180000, 'Uptempo energy. Clean diction at speed.'),
('tk_008', 'ses_005', 1, 'va_008', 1, NULL, 60000, 'Corporate baseline. Clear, professional.'),
('tk_009', 'ses_005', 2, 'va_009', 1, NULL, 90000, 'Warm variant. Better for e-learning.');

-- 6. CHARACTERS

INSERT INTO characters (id, creator_id, source_session_id, character_name, variant_label, description, voice_parameters, consent_profile_id, status) VALUES
('ch_001', 'cr_001', 'ses_001', 'Ama Gold', 'warm', 'Warm storyteller voice. West African inflection. Perfect for children''s content.', '{"warmth":0.8,"breathiness":0.3,"speed":0.95}', 'cp_001', 'active'),
('ch_002', 'cr_002', 'ses_002', 'Lord Vex', 'menacing', 'Deep villain baritone. Controlled menace. Games and animation.', '{"pitch_shift":-2,"warmth":0.2,"speed":0.85}', 'cp_002', 'active'),
('ch_003', 'cr_002', 'ses_002', 'Kit Sparrow', 'bright', 'Bright child character. Energetic and curious. Animation.', '{"pitch_shift":4,"warmth":0.7,"speed":1.15}', 'cp_002', 'active'),
('ch_004', 'cr_003', 'ses_003', 'Dr. Claire Wells', 'authoritative', 'Science documentary narrator. Calm authority with warmth.', '{"warmth":0.5,"speed":0.90,"resonance":"chest"}', 'cp_003', 'active'),
('ch_005', 'cr_004', 'ses_004', 'Javi Luna', 'romantic', 'Romantic ballad voice. Rich baritone with emotional tremolo.', '{"warmth":0.9,"breathiness":0.4,"speed":0.88}', 'cp_004', 'active'),
('ch_006', 'cr_005', 'ses_005', 'Nova', 'professional', 'Clean corporate voice. Tech brand narration. E-learning.', '{"warmth":0.6,"speed":1.0,"resonance":"balanced"}', 'cp_005', 'active');

-- 7. AUTH SCORES

INSERT INTO auth_scores (id, take_id, scorer_model, similarity_score, naturalness_score, intelligibility_score, overall_score, notes) VALUES
('as_001', 'tk_001', 'gemma4', 0.95, 0.92, 0.98, 0.948, 'Excellent baseline capture. High authenticity.'),
('as_002', 'tk_002', 'gemma4', 0.91, 0.94, 0.96, 0.934, 'Warm variant maintains identity. Natural transition.'),
('as_003', 'tk_003', 'gemma4', 0.88, 0.90, 0.95, 0.904, 'Villain voice: strong character differentiation while maintaining root identity.'),
('as_004', 'tk_004', 'gemma4', 0.82, 0.87, 0.93, 0.864, 'Child voice: impressive range. Slightly lower authenticity expected for extreme variant.'),
('as_005', 'tk_005', 'gemma4', 0.97, 0.96, 0.99, 0.968, 'Documentary narration: highest quality capture in test batch.'),
('as_006', 'tk_006', 'gemma4', 0.93, 0.95, 0.97, 0.946, 'Ballad delivery: emotional authenticity exceptional.'),
('as_007', 'tk_007', 'gemma4', 0.90, 0.88, 0.94, 0.904, 'Uptempo: slight diction softening at speed. Still excellent.'),
('as_008', 'tk_008', 'gemma4', 0.96, 0.93, 0.99, 0.956, 'Corporate baseline: crystal clear. Production-ready.'),
('as_009', 'tk_009', 'gemma4', 0.94, 0.95, 0.97, 0.948, 'E-learning variant: warm and approachable. Perfect for long-form.');

-- 8. TEST USAGE RECEIPTS + ROYALTY SPLITS

-- Receipt 1: Indie game uses Marcus's villain character ($500)
INSERT INTO usage_receipts (id, voice_asset_id, character_id, project_id, project_name, requester_id, usage_type, start_ts, duration_ms, consent_hash, gross_amount, currency, status) VALUES
('ur_001', 'va_003', 'ch_002', 'proj_001', 'Shadow Realms (Indie RPG)', 'client_001', 'synthesis', '2026-04-02T04:00:00Z', 45000, 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 500.00, 'USD', 'completed');

-- Splits for Receipt 1: $500 gross
-- GORUNFREE: $5.00 (1%)
-- Net after tithe: $495.00
-- Creator (Marcus): $371.25 (75% of net)
-- Platform: $123.75 (25% of net)
INSERT INTO royalty_splits (id, receipt_id, payee_id, payee_type, basis_points, amount, currency, status) VALUES
('rs_001', 'ur_001', 'NOIZYKIDZ', 'gorunfree', 100, 5.00, 'USD', 'pending'),
('rs_002', 'ur_001', 'cr_002', 'creator', 7500, 371.25, 'USD', 'pending'),
('rs_003', 'ur_001', 'PLATFORM', 'platform', 2400, 123.75, 'USD', 'pending');

-- Receipt 2: E-learning platform licenses Nkechi's corporate voice ($1200)
INSERT INTO usage_receipts (id, voice_asset_id, character_id, project_id, project_name, requester_id, usage_type, start_ts, duration_ms, consent_hash, gross_amount, currency, status) VALUES
('ur_002', 'va_008', 'ch_006', 'proj_002', 'TechLearn Pro (E-Learning)', 'client_002', 'license', '2026-04-02T04:30:00Z', 600000, 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 1200.00, 'USD', 'completed');

INSERT INTO royalty_splits (id, receipt_id, payee_id, payee_type, basis_points, amount, currency, status) VALUES
('rs_004', 'ur_002', 'NOIZYKIDZ', 'gorunfree', 100, 12.00, 'USD', 'pending'),
('rs_005', 'ur_002', 'cr_005', 'creator', 7500, 891.00, 'USD', 'pending'),
('rs_006', 'ur_002', 'PLATFORM', 'platform', 2400, 297.00, 'USD', 'pending');

-- Receipt 3: Animation studio uses Amara's storyteller character ($2500)
INSERT INTO usage_receipts (id, voice_asset_id, character_id, project_id, project_name, requester_id, usage_type, start_ts, duration_ms, consent_hash, gross_amount, currency, status) VALUES
('ur_003', 'va_001', 'ch_001', 'proj_003', 'Golden Stories (Animation)', 'client_003', 'synthesis', '2026-04-02T05:00:00Z', 120000, 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 2500.00, 'USD', 'completed');

INSERT INTO royalty_splits (id, receipt_id, payee_id, payee_type, basis_points, amount, currency, status) VALUES
('rs_007', 'ur_003', 'NOIZYKIDZ', 'gorunfree', 100, 25.00, 'USD', 'pending'),
('rs_008', 'ur_003', 'cr_001', 'creator', 7500, 1856.25, 'USD', 'pending'),
('rs_009', 'ur_003', 'PLATFORM', 'platform', 2400, 618.75, 'USD', 'pending');

-- 9. LUCY'S FIRST OBSERVATIONS

INSERT INTO lucy_observations (id, observation_type, subject_type, subject_id, observation, confidence, data_points, acted_on) VALUES
('lo_001', 'pattern', 'creator', 'cr_002', 'Marcus Chen shows exceptional character range (villain to child). His auth scores maintain >0.85 even at extreme variants. Consider premium character licensing tier.', 0.85, '{"villain_score":0.904,"child_score":0.864,"range_delta":0.040}', 0),
('lo_002', 'opportunity', 'creator', 'cr_003', 'Elise Dubois scored highest authenticity in the test batch (0.968). Documentary narration market is underserved by consent-native platforms. First-mover opportunity.', 0.90, '{"overall_score":0.968,"market_gap":"documentary_narration"}', 0),
('lo_003', 'trend', 'market', NULL, 'E-learning VO demand is growing 23% YoY. Nkechi''s corporate voice profile matches this demand perfectly. Recommend featuring in e-learning marketplace.', 0.75, '{"market_growth":"23%","matching_creators":["cr_005"]}', 0),
('lo_004', 'recommendation', 'creator', 'cr_004', 'Javier''s emotional ballad delivery (0.946 auth score) could serve the growing AI companion/wellness app market. Consent gates would need careful calibration for therapeutic contexts.', 0.70, '{"auth_score":0.946,"potential_market":"wellness_apps"}', 0),
('lo_005', 'risk', 'creator', 'cr_001', 'Amara''s spoken-word captures are popular but only 3 takes exist. For character stability and licensing confidence, recommend at least 10 baseline captures across different emotional states.', 0.80, '{"current_takes":3,"recommended_minimum":10}', 0);

-- 10. INITIAL AUDIT LOG ENTRIES

INSERT INTO audit_log (id, event_type, actor_id, actor_type, resource_type, resource_id, action, metadata, timestamp, block_hash, previous_hash) VALUES
('al_001', 'system.init', 'SYSTEM', 'system', 'platform', 'noisybox', 'create', '{"version":"0.1.0","sacred_invariants":"enforced"}', '2026-04-02T00:00:00Z', 'genesis_hash_noisybox_v01', 'GENESIS');
