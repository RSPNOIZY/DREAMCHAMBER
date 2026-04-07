-- ============================================================
-- NOISY FISH V0.1 — Seed Data
-- 50 catalog entries from THE AQUARIUM + production notes + test licenses
-- Real file references enriched with synthetic metadata
-- ============================================================

-- 1. PRICING TIERS

INSERT INTO pricing_tiers (id, tier_name, description, base_price_min, base_price_max, currency, discount_pct, requires_approval, status) VALUES
('pt_001', 'educational', 'Students, educators, workshops', 50, 200, 'USD', 0, 0, 'active'),
('pt_002', 'noizykidz', 'NOIZYKIDZ curriculum — 20% strategic discount', 40, 160, 'USD', 20, 0, 'active'),
('pt_003', 'commercial', 'Indie games, small film, podcasts', 500, 2000, 'USD', 0, 0, 'active'),
('pt_004', 'enterprise', 'AAA studios, streaming platforms, major film', 5000, 50000, 'USD', 0, 1, 'active');

-- 2. CATALOG TITLES — 50 representative pieces across 40 years
-- Organized by era: 80s, 90s, 2000s, 2010s, 2020s

-- === 80s ERA (5 pieces) ===
INSERT INTO catalog_titles (id, title, project, composer, year, era_tag, duration_ms, bpm, musical_key, scale, time_signature, mood_tags, emotional_arc, instrumentation, genre_tags, technical_difficulty, rights_status, clearance_status, status) VALUES
('ct_001', 'Dawn Patrol', 'Early Sessions', 'Robert Stephen Plowman', 1986, '80s', 195000, 112, 'D major', 'major', '4/4', '["energetic","hopeful","bright"]', 'building', '["synth","drums","electric_guitar","bass"]', '["synth_pop","new_wave"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_002', 'Midnight Signal', 'Early Sessions', 'Robert Stephen Plowman', 1987, '80s', 240000, 98, 'B minor', 'minor', '4/4', '["mysterious","atmospheric","dark"]', 'tension', '["synth","pad","reverb_guitar","drum_machine"]', '["ambient","electronic"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_003', 'Street Level', 'Early Sessions', 'Robert Stephen Plowman', 1988, '80s', 180000, 120, 'E minor', 'minor', '4/4', '["urgent","gritty","determined"]', 'building', '["electric_guitar","bass","drums","synth"]', '["rock","electronic"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_004', 'Glass Houses', 'Early Sessions', 'Robert Stephen Plowman', 1989, '80s', 210000, 88, 'F major', 'major', '3/4', '["delicate","reflective","fragile"]', 'resolving', '["piano","strings","celesta"]', '["classical","ambient"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_005', 'Northern Lights', 'Early Sessions', 'Robert Stephen Plowman', 1989, '80s', 270000, 76, 'Ab major', 'major', '4/4', '["vast","peaceful","majestic"]', 'static', '["synth_pad","strings","choir","timpani"]', '["orchestral","ambient"]', 'advanced', 'owned', 'cleared', 'active'),

-- === 90s ERA (10 pieces) ===
('ct_006', 'Harvest Intro Loop', 'Fish Demos', 'Robert Stephen Plowman', 1992, '90s', 60000, 95, 'G major', 'major', '4/4', '["warm","organic","earthy"]', 'static', '["acoustic_guitar","fiddle","bodhran"]', '["folk","celtic"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_007', 'Pourquoi', 'Henrietta Southam', 'Robert Stephen Plowman', 1994, '90s', 300000, 72, 'C minor', 'minor', '4/4', '["melancholy","questioning","intimate"]', 'tension', '["piano","strings","voice","clarinet"]', '["classical","art_song"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_008', 'Two Drink Minimum', 'Fish Demos', 'Robert Stephen Plowman', 1995, '90s', 210000, 130, 'D minor', 'minor', '4/4', '["playful","jazzy","swinging"]', 'building', '["congas","piano","bass","saxophone","trumpet"]', '["jazz","latin"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_009', 'Sad Story', 'Fish Demos', 'Robert Stephen Plowman', 1996, '90s', 180000, 66, 'Ab minor', 'minor', '4/4', '["sad","vulnerable","hopeful"]', 'resolving', '["piano","strings","oboe","harp"]', '["orchestral","film"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_010', 'Hell Breaks Loose', 'Fish Demos', 'Robert Stephen Plowman', 1997, '90s', 150000, 137, 'Ab minor', 'minor', '4/4', '["intense","chaotic","powerful"]', 'building', '["drums","brass","strings","percussion","electric_guitar"]', '["orchestral","action"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_011', 'The Duel', 'Fish Demos', 'Robert Stephen Plowman', 1997, '90s', 165000, 108, 'E minor', 'minor', '4/4', '["tense","dramatic","confrontational"]', 'tension', '["bass","strings","percussion","brass"]', '["orchestral","film"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_012', 'Celtic Harp Dreams', 'Fish Demos', 'Robert Stephen Plowman', 1998, '90s', 240000, 58, 'D major', 'major', '3/4', '["serene","ethereal","ancient"]', 'static', '["celtic_harp","strings","flute"]', '["celtic","ambient","classical"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_013', 'Wave', 'Fish Demos', 'Robert Stephen Plowman', 1998, '90s', 195000, 92, 'C major', 'major', '4/4', '["flowing","uplifting","organic"]', 'building', '["organ","piano","bass","strings"]', '["gospel","soul"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_014', 'Hunter', 'Fish Demos', 'Robert Stephen Plowman', 1999, '90s', 135000, 140, 'A minor', 'minor', '4/4', '["primal","rhythmic","cultural"]', 'building', '["fiddle","drums","percussion","bass"]', '["world","folk","fusion"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_015', 'Love Song Intro', 'Velvetine Rabbits', 'Robert Stephen Plowman', 1999, '90s', 90000, 78, 'Eb major', 'major', '4/4', '["romantic","tender","intimate"]', 'building', '["piano","strings","acoustic_guitar"]', '["pop","ballad"]', 'intermediate', 'owned', 'cleared', 'active'),

-- === 2000s ERA (15 pieces — the animation golden age) ===
('ct_016', 'Ed''s Big Idea', 'Ed Edd n Eddy', 'Robert Stephen Plowman', 2000, '2000s', 30000, 140, 'C major', 'major', '4/4', '["manic","comedic","frenetic"]', 'building', '["banjo","tuba","whistles","percussion"]', '["cartoon","comedy"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_017', 'Jawbreaker Chase', 'Ed Edd n Eddy', 'Robert Stephen Plowman', 2001, '2000s', 45000, 160, 'G major', 'major', '4/4', '["frantic","exciting","slapstick"]', 'building', '["banjo","fiddle","washboard","tuba","drums"]', '["cartoon","bluegrass","comedy"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_018', 'Double D Thinks', 'Ed Edd n Eddy', 'Robert Stephen Plowman', 2002, '2000s', 20000, 88, 'F major', 'major', '4/4', '["curious","thoughtful","quirky"]', 'tension', '["clarinet","pizzicato_strings","xylophone"]', '["cartoon","classical"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_019', 'Dragon Tales Theme Underscore', 'Dragon Tales', 'Robert Stephen Plowman', 2001, '2000s', 60000, 100, 'D major', 'major', '4/4', '["magical","warm","adventurous"]', 'building', '["orchestra","flute","harp","celesta","strings"]', '["orchestral","children"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_020', 'Dragon Flight', 'Dragon Tales', 'Robert Stephen Plowman', 2002, '2000s', 45000, 108, 'Bb major', 'major', '4/4', '["soaring","joyful","epic"]', 'building', '["full_orchestra","brass","strings","percussion","flute"]', '["orchestral","adventure"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_021', 'Wheezie''s Garden', 'Dragon Tales', 'Robert Stephen Plowman', 2002, '2000s', 35000, 76, 'G major', 'major', '3/4', '["gentle","playful","nature"]', 'static', '["recorder","harp","strings","bird_sounds"]', '["children","pastoral"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_022', 'Johnny''s Guitar', 'Johnny Test', 'Robert Stephen Plowman', 2005, '2000s', 30000, 145, 'E minor', 'minor', '4/4', '["rebellious","cool","energetic"]', 'building', '["electric_guitar","drums","bass","synth"]', '["rock","cartoon"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_023', 'Lab Experiment', 'Johnny Test', 'Robert Stephen Plowman', 2005, '2000s', 25000, 120, 'C minor', 'minor', '4/4', '["scientific","mischievous","building"]', 'tension', '["synth","bass","percussion","electronics"]', '["electronic","cartoon"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_024', 'Dukey''s Lament', 'Johnny Test', 'Robert Stephen Plowman', 2006, '2000s', 20000, 72, 'F minor', 'minor', '4/4', '["comedic","sad","melodramatic"]', 'resolving', '["violin","piano","trombone"]', '["cartoon","classical"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_025', 'Transformers Battle Theme', 'Transformers', 'Robert Stephen Plowman', 2004, '2000s', 60000, 150, 'D minor', 'minor', '4/4', '["epic","powerful","mechanical"]', 'building', '["full_orchestra","synth","electric_guitar","drums","brass"]', '["orchestral","action","electronic"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_026', 'Autobot March', 'Transformers', 'Robert Stephen Plowman', 2004, '2000s', 45000, 116, 'Bb major', 'major', '4/4', '["heroic","triumphant","majestic"]', 'building', '["brass","strings","percussion","snare"]', '["orchestral","march"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_027', 'Barbie Dream Waltz', 'Barbie', 'Robert Stephen Plowman', 2003, '2000s', 90000, 84, 'A major', 'major', '3/4', '["elegant","dreamy","sparkly"]', 'resolving', '["strings","harp","celesta","flute","piano"]', '["classical","waltz"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_028', 'Fashion Runway', 'Barbie', 'Robert Stephen Plowman', 2003, '2000s', 60000, 128, 'F# minor', 'minor', '4/4', '["glamorous","confident","stylish"]', 'building', '["synth","bass","drums","strings","claps"]', '["pop","electronic"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_029', 'Vision TV Opening', 'Vision TV', 'Robert Stephen Plowman', 2001, '2000s', 30000, 104, 'C major', 'major', '4/4', '["professional","inspiring","clean"]', 'building', '["orchestra","piano","brass"]', '["orchestral","broadcast"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_030', 'CFL Touchdown', 'CFL', 'Robert Stephen Plowman', 2007, '2000s', 15000, 135, 'G major', 'major', '4/4', '["victorious","exciting","powerful"]', 'building', '["brass","drums","electric_guitar","crowd"]', '["sports","fanfare"]', 'intermediate', 'owned', 'cleared', 'active'),

-- === 2010s ERA (10 pieces) ===
('ct_031', 'Cities Mix', 'Personal', 'Robert Stephen Plowman', 2017, '2010s', 240000, 95, 'D minor', 'minor', '4/4', '["urban","reflective","atmospheric"]', 'building', '["synth","piano","strings","drums"]', '["ambient","electronic","film"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_032', 'Biscuits & Gravy', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 195000, 108, 'G major', 'major', '4/4', '["soulful","warm","groovy"]', 'building', '["piano","bass","drums","organ","guitar"]', '["soul","blues","funk"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_033', 'Coming Home', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 210000, 82, 'Eb major', 'major', '4/4', '["nostalgic","hopeful","bittersweet"]', 'resolving', '["acoustic_guitar","strings","piano","voice"]', '["folk","ballad"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_034', 'Dreaming In the East', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 225000, 90, 'A minor', 'minor', '4/4', '["contemplative","exotic","spiritual"]', 'tension', '["sitar","tabla","strings","flute","pad"]', '["world","ambient","fusion"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_035', 'Set Me Up', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 195000, 120, 'B minor', 'minor', '4/4', '["driven","confident","dark"]', 'building', '["electric_guitar","drums","bass","synth"]', '["rock","electronic"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_036', 'I Used To Drive Down That Street', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 240000, 78, 'C major', 'major', '4/4', '["nostalgic","wistful","gentle"]', 'resolving', '["piano","acoustic_guitar","strings","harmonica"]', '["folk","americana"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_037', 'Driving At Night', 'Personal', 'Robert Stephen Plowman', 2012, '2010s', 270000, 85, 'F# minor', 'minor', '4/4', '["lonely","atmospheric","cinematic"]', 'tension', '["synth","piano","pad","bass","subtle_drums"]', '["ambient","electronic","film"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_038', 'Launch Codes', 'Personal', 'Robert Stephen Plowman', 2015, '2010s', 195000, 90, 'E minor', 'minor', '4/4', '["tense","technological","urgent"]', 'building', '["synth","bass","drums","electronics","strings"]', '["electronic","film","sci_fi"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_039', 'Gravy Train', 'CLAC', 'Robert Stephen Plowman', 2016, '2010s', 180000, 115, 'A major', 'major', '4/4', '["funky","confident","groovy"]', 'building', '["bass","drums","keys","guitar","brass"]', '["funk","soul"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_040', 'Drone Ominous Cold', 'Sound Design', 'Robert Stephen Plowman', 2018, '2010s', 120000, 0, 'atonal', 'chromatic', 'free', '["ominous","cold","vast","threatening"]', 'static', '["drone","synth_pad","processed_metal","sub_bass"]', '["ambient","dark_ambient","sound_design"]', 'intermediate', 'owned', 'cleared', 'active'),

-- === 2020s ERA (10 pieces) ===
('ct_041', 'KoFi Theme', 'Personal', 'Robert Stephen Plowman', 2022, '2020s', 180000, 100, 'G major', 'major', '4/4', '["warm","inviting","community"]', 'building', '["piano","bass","drums","strings","voice"]', '["soul","pop"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_042', 'Undulate', 'Sound Design', 'Robert Stephen Plowman', 2021, '2020s', 90000, 75, 'G minor', 'minor', '4/4', '["flowing","organic","textural"]', 'static', '["granular_synth","processed_strings","pad"]', '["ambient","electronic","experimental"]', 'advanced', 'owned', 'cleared', 'active'),
('ct_043', 'Zippy', 'Sound Design', 'Robert Stephen Plowman', 2021, '2020s', 30000, 150, 'A major', 'major', '4/4', '["playful","fast","bright"]', 'building', '["synth","percussion","bass","effects"]', '["electronic","game"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_044', 'August 29th Full Mix', 'Personal', 'Robert Stephen Plowman', 2023, '2020s', 300000, 88, 'D minor', 'minor', '4/4', '["epic","layered","emotional"]', 'building', '["full_orchestra","synth","drums","choir","piano"]', '["orchestral","electronic","hybrid"]', 'virtuoso', 'owned', 'cleared', 'active'),
('ct_045', 'Tonal Percussion 60BPM', 'Sound Design', 'Robert Stephen Plowman', 2020, '2020s', 120000, 60, 'A minor', 'minor', '4/4', '["meditative","rhythmic","primal"]', 'static', '["tonal_percussion","marimba","kalimba","bells"]', '["world","ambient","percussion"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_046', 'Whoosh To Hit', 'Sound Design', 'Robert Stephen Plowman', 2020, '2020s', 5000, 0, 'atonal', 'chromatic', 'free', '["impact","dramatic","cinematic"]', 'building', '["processed_audio","synth","impact_fx"]', '["sound_design","sfx"]', 'beginner', 'owned', 'cleared', 'active'),
('ct_047', 'Fidelity', 'Fish Demos', 'Robert Stephen Plowman', 2024, '2020s', 210000, 90, 'G major', 'major', '4/4', '["honest","organic","warm"]', 'resolving', '["acoustic_guitar","voice","bass","subtle_drums"]', '["folk","singer_songwriter"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_048', 'Trouble', 'Fish Demos', 'Robert Stephen Plowman', 2024, '2020s', 195000, 120, 'D major', 'major', '4/4', '["gritty","soulful","raw"]', 'building', '["electric_guitar","bass","drums","organ"]', '["blues","rock","soul"]', 'intermediate', 'owned', 'cleared', 'active'),
('ct_049', 'Marc Fiddle Long', 'Collaborations', 'Robert Stephen Plowman', 2025, '2020s', 300000, 85, 'D major', 'major', '4/4', '["lyrical","passionate","virtuosic"]', 'building', '["fiddle","piano","bass","drums"]', '["folk","celtic","classical"]', 'virtuoso', 'co-owned', 'cleared', 'active'),
('ct_050', 'Marc Fiddle Short', 'Collaborations', 'Robert Stephen Plowman', 2025, '2020s', 90000, 140, 'A minor', 'minor', '4/4', '["energetic","driving","traditional"]', 'building', '["fiddle","bodhran","bass","guitar"]', '["celtic","folk","dance"]', 'advanced', 'co-owned', 'cleared', 'active');

-- 3. CATALOG ASSETS — File references to THE AQUARIUM

INSERT INTO catalog_assets (id, title_id, asset_type, file_ref, format, status) VALUES
('ca_001', 'ct_006', 'demo', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/_FISH 2011 DEMO/AUDIO ONLY/HARVEST_INTRO_LOOP_DRAFT1_2.wav', 'wav', 'available'),
('ca_002', 'ct_007', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/_HENRIETTA SOUTHAM/_AUDIO/POURQUOI.wav', 'wav', 'available'),
('ca_003', 'ct_015', 'master', '/Volumes/4TB Lacie/LIBRARY/02_FISH_DEMOS/VELVETINE RABBITS/LOVE SONG INTRO SEQ.wav', 'wav', 'available'),
('ca_004', 'ct_012', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Celtic Harp Harmonics/Harp 57 H.wav', 'wav', 'available'),
('ca_005', 'ct_014', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Hunter/Hunter Indian.wav', 'wav', 'available'),
('ca_006', 'ct_041', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/4_KoFi.wav', 'wav', 'available'),
('ca_007', 'ct_031', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug_17_Cities_MIx_01.mp3', 'mp3', 'available'),
('ca_008', 'ct_032', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug12/Biscuits & Gravy.wav', 'wav', 'available'),
('ca_009', 'ct_033', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug12/Coming Home.wav', 'wav', 'available'),
('ca_010', 'ct_034', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug12/Dreaming In the East.wav', 'wav', 'available'),
('ca_011', 'ct_036', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug12/I Use To Drive Down That Street.wav', 'wav', 'available'),
('ca_012', 'ct_035', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug12/Set Me Up.wav', 'wav', 'available'),
('ca_013', 'ct_044', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Aug29th_FullMix_(DR)_Mix_V3.wav', 'wav', 'available'),
('ca_014', 'ct_039', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/CLAC GRAVY TRAIN V1.wav', 'wav', 'available'),
('ca_015', 'ct_038', 'master', '/Volumes/4TB Lacie/LIBRARY/03_PROJECTS/CURRENT/Launch Codes 90bpm.wav', 'wav', 'available'),
('ca_016', 'ct_040', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Drones/Drone Ominous Cold.wav', 'wav', 'available'),
('ca_017', 'ct_049', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Fiddle Marc Long/MARC LONG 75D.wav', 'wav', 'available'),
('ca_018', 'ct_050', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Fiddle Marc Short/MARC SHORT 64U.wav', 'wav', 'available'),
('ca_019', 'ct_042', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Undulatte Gc/Undulate18.wav', 'wav', 'available'),
('ca_020', 'ct_043', 'master', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/AUDIO/_AUDIO TO GROUP/Zippy Gc/Zippy A32.wav', 'wav', 'available');

-- 4. PRODUCTION NOTES — RSP_001's wisdom layer

INSERT INTO production_notes (id, title_id, note_type, content, author, tags, teachable) VALUES
('pn_001', 'ct_009', 'creative_choice', 'I chose oboe for the melody here because oboe carries grief without self-pity. A violin would have been too obvious — too weepy. The oboe has this quality of quiet dignity that matched what the scene needed. The character wasn''t broken. She was sad but still standing.', 'Robert Stephen Plowman', '["orchestration","emotion","instrument_choice"]', 1),

('pn_002', 'ct_016', 'creative_choice', 'Ed Edd n Eddy taught me more about comedic timing in music than anything else in my career. You have to hit the gag BEFORE the visual — the music tells the audience "something ridiculous is about to happen." Banjo was the key. Banjo is inherently funny. You can''t make a banjo sound tragic.', 'Robert Stephen Plowman', '["comedy","timing","animation","instrument_choice"]', 1),

('pn_003', 'ct_025', 'technical', 'The Transformers battle theme needed to feel mechanical AND emotional. The trick was layering orchestral brass over synthesized industrial sounds. The brass gives it heroism. The synth gives it machine. Together they create something that sounds like war between feeling beings made of metal.', 'Robert Stephen Plowman', '["layering","orchestration","hybrid","production"]', 1),

('pn_004', 'ct_019', 'story', 'Dragon Tales was the first time I scored something where the audience was 3-year-olds. Everything changes when your listener is three. The harmonic language has to be simpler but not condescending. I used the celesta because to a child, it sounds like magic is literally happening. Because it is.', 'Robert Stephen Plowman', '["children","audience","simplicity","magic"]', 1),

('pn_005', 'ct_037', 'creative_choice', 'Driving At Night is the most autobiographical piece in the catalog. I wrote it at 2AM after a long drive through Ontario. The synth pad is meant to sound like highway lights passing overhead. The piano enters late because when you drive alone at night, you don''t think right away. You just move.', 'Robert Stephen Plowman', '["autobiographical","atmosphere","piano","timing"]', 1),

('pn_006', 'ct_012', 'lesson', 'Celtic harp teaches you that less is always more. Each note rings so long that you have to choose carefully — there''s no hiding behind density. This piece has maybe 40 notes total in 4 minutes. Every single one matters. That''s the lesson: restraint is not the absence of skill. It''s the highest expression of it.', 'Robert Stephen Plowman', '["restraint","celtic_harp","minimalism","craft"]', 1),

('pn_007', 'ct_010', 'technical', 'Hell Breaks Loose needed controlled chaos. The trick is that the chaos is an illusion — every element is precisely placed, but the ear perceives mayhem. Brass stabs on offbeats, strings in contrary motion, percussion fills in the gaps. It sounds like a riot but it''s actually a clock.', 'Robert Stephen Plowman', '["controlled_chaos","orchestration","precision","illusion"]', 1),

('pn_008', 'ct_027', 'creative_choice', 'Scoring Barbie taught me about elegance in music. The waltz form was obvious but the harmonies needed to sparkle without being saccharine. I added celesta at the top of the voicing — just touches — to create that "sparkle" effect. The harp arpeggios aren''t decorative. They''re structural. They hold the waltz together.', 'Robert Stephen Plowman', '["elegance","waltz","voicing","structure"]', 1),

('pn_009', 'ct_044', 'story', 'August 29th started as a sketch at 3AM. By dawn it had a full orchestra, synth layers, and a choir. It''s the most complex piece in the catalog and also the most personal. I was trying to capture what it feels like when everything you''ve learned suddenly makes sense — when 40 years of craft converges into one moment.', 'Robert Stephen Plowman', '["convergence","complexity","personal","milestone"]', 1),

('pn_010', 'ct_033', 'creative_choice', 'Coming Home uses a harmonica because harmonica sounds like memory. Not a specific memory — the feeling of remembering. The melody is simple because the emotion is simple. You''re going home. You don''t need complexity. You need truth.', 'Robert Stephen Plowman', '["harmonica","memory","simplicity","truth"]', 1);

-- 5. TEST LICENSES — 3 simulated licensing scenarios

-- License 1: Indie game studio licenses "Transformers Battle Theme" ($1500 commercial)
INSERT INTO licenses (id, title_id, tier, customer_ref, customer_name, customer_type, fee, currency, term_start, territory, usage_scope, exclusivity, status) VALUES
('lic_001', 'ct_025', 'commercial', 'cust_001', 'Pixel Forge Studios', 'indie_dev', 1500.00, 'USD', '2026-04-02T00:00:00Z', 'worldwide', 'game', 'non-exclusive', 'active');

INSERT INTO attribution_log (id, license_id, title_id, attribution_text, context, verified) VALUES
('attr_001', 'lic_001', 'ct_025', 'Music by Robert Stephen Plowman, from the NOIZYFISH catalog. Licensed under commercial tier.', 'game', 0);

INSERT INTO royalty_events (id, license_id, title_id, event_type, payee_id, payee_type, gross_amount, creator_share, platform_share, gorunfree_tithe, gorunfree_recipient, net_amount, currency, status) VALUES
('re_001', 'lic_001', 'ct_025', 'license_fee', 'RSP_001', 'composer', 1500.00, 1113.75, 371.25, 15.00, 'NOIZYKIDZ', 1113.75, 'USD', 'pending'),
('re_002', 'lic_001', 'ct_025', 'license_fee', 'PLATFORM', 'platform', 1500.00, 1113.75, 371.25, 15.00, 'NOIZYKIDZ', 371.25, 'USD', 'pending'),
('re_003', 'lic_001', 'ct_025', 'license_fee', 'NOIZYKIDZ', 'gorunfree', 1500.00, 1113.75, 371.25, 15.00, 'NOIZYKIDZ', 15.00, 'USD', 'pending');

-- License 2: NOIZYKIDZ licenses "Dragon Tales Underscore" + "Ed's Big Idea" ($160 noizykidz tier with 20% discount)
INSERT INTO licenses (id, title_id, tier, customer_ref, customer_name, customer_type, fee, currency, term_start, territory, usage_scope, exclusivity, status) VALUES
('lic_002', 'ct_019', 'noizykidz', 'cust_noizykidz', 'NOIZYKIDZ Curriculum', 'educator', 80.00, 'USD', '2026-04-02T00:00:00Z', 'worldwide', 'education', 'non-exclusive', 'active'),
('lic_003', 'ct_016', 'noizykidz', 'cust_noizykidz', 'NOIZYKIDZ Curriculum', 'educator', 80.00, 'USD', '2026-04-02T00:00:00Z', 'worldwide', 'education', 'non-exclusive', 'active');

INSERT INTO attribution_log (id, license_id, title_id, attribution_text, context, verified) VALUES
('attr_002', 'lic_002', 'ct_019', 'Music by Robert Stephen Plowman, from the NOIZYFISH catalog. Licensed for NOIZYKIDZ educational use.', 'education', 1),
('attr_003', 'lic_003', 'ct_016', 'Music by Robert Stephen Plowman, from the NOIZYFISH catalog. Licensed for NOIZYKIDZ educational use.', 'education', 1);

INSERT INTO royalty_events (id, license_id, title_id, event_type, payee_id, payee_type, gross_amount, creator_share, platform_share, gorunfree_tithe, gorunfree_recipient, net_amount, currency, status) VALUES
('re_004', 'lic_002', 'ct_019', 'license_fee', 'RSP_001', 'composer', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 59.40, 'USD', 'processed'),
('re_005', 'lic_002', 'ct_019', 'license_fee', 'PLATFORM', 'platform', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 19.80, 'USD', 'processed'),
('re_006', 'lic_002', 'ct_019', 'license_fee', 'NOIZYKIDZ', 'gorunfree', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 0.80, 'USD', 'processed'),
('re_007', 'lic_003', 'ct_016', 'license_fee', 'RSP_001', 'composer', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 59.40, 'USD', 'processed'),
('re_008', 'lic_003', 'ct_016', 'license_fee', 'PLATFORM', 'platform', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 19.80, 'USD', 'processed'),
('re_009', 'lic_003', 'ct_016', 'license_fee', 'NOIZYKIDZ', 'gorunfree', 80.00, 59.40, 19.80, 0.80, 'NOIZYKIDZ', 0.80, 'USD', 'processed');

-- 6. SEARCH INDEX — Full-text search entries

INSERT INTO search_index (id, title_id, searchable_text) VALUES
('si_001', 'ct_009', 'Sad Story orchestral film sad vulnerable hopeful piano strings oboe harp minor resolving'),
('si_002', 'ct_016', 'Ed''s Big Idea Ed Edd n Eddy cartoon comedy manic comedic frenetic banjo tuba whistles percussion'),
('si_003', 'ct_019', 'Dragon Tales Theme Underscore magical warm adventurous orchestra flute harp celesta strings children'),
('si_004', 'ct_025', 'Transformers Battle Theme epic powerful mechanical full orchestra synth electric guitar drums brass action'),
('si_005', 'ct_027', 'Barbie Dream Waltz elegant dreamy sparkly strings harp celesta flute piano classical waltz'),
('si_006', 'ct_037', 'Driving At Night lonely atmospheric cinematic synth piano pad bass subtle drums ambient electronic film'),
('si_007', 'ct_044', 'August 29th Full Mix epic layered emotional full orchestra synth drums choir piano orchestral electronic hybrid');

-- 7. LUCY'S FIRST CATALOG OBSERVATIONS

INSERT INTO lucy_observations (id, observation_type, subject_type, subject_id, observation, confidence, data_points, acted_on) VALUES
('lo_001', 'trend', 'era', '2000s', 'The 2000s era (animation golden age) has the highest density of catalog entries and the most diverse instrumentation. These pieces are historically significant and highly licensable for nostalgia-driven media.', 0.90, '{"era":"2000s","count":15,"projects":["Ed Edd n Eddy","Dragon Tales","Johnny Test","Transformers","Barbie"]}', 0),

('lo_002', 'recommendation', 'creator', 'RSP_001', 'Your minimalist string work (Celtic Harp Dreams, 1998) is underutilized. Wellness apps and meditation platforms are licensing ambient/celtic content at growing rates. Consider revisiting this era.', 0.75, '{"title":"Celtic Harp Dreams","year":1998,"market":"wellness_apps","growth":"18% YoY"}', 0),

('lo_003', 'opportunity', 'market', NULL, 'The NOIZYKIDZ curriculum only licenses 2 titles. The catalog has 50+ titles with teachable production notes. Expanding the educational tier could generate $2000-5000/year in recurring licensing revenue.', 0.85, '{"current_licenses":2,"potential_titles":50,"estimated_revenue":"$2000-5000/yr"}', 0),

('lo_004', 'gap', 'era', '80s', 'The 80s era has only 5 catalog entries. If more material exists in THE AQUARIUM from this period, adding it would strengthen the "40-year evolution" narrative and appeal to retro-wave licensees.', 0.70, '{"era":"80s","current_count":5,"recommendation":"add_more"}', 0),

('lo_005', 'pattern', 'style', NULL, 'Compositions tagged "determined" consistently appear in the most-licensed categories across eras. This emotional tone has cross-generational appeal. Consider it a signature strength.', 0.80, '{"mood":"determined","appearances":["ct_003","ct_035","ct_038"],"cross_era":true}', 0);

-- 8. INITIAL AUDIT LOG

INSERT INTO audit_log (id, event_type, actor_id, actor_type, resource_type, resource_id, action, metadata, timestamp, block_hash, previous_hash) VALUES
('al_001', 'system.init', 'SYSTEM', 'system', 'platform', 'noizyfish', 'create', '{"version":"0.1.0","catalog_size":50,"sacred_invariants":"enforced"}', '2026-04-02T00:00:00Z', 'genesis_hash_noizyfish_v01', 'GENESIS');
