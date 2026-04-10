-- ═══════════════════════════════════════════════════════════════════════════
-- NOIZY EMPIRE — Seed Data (Run after schema.sql)
-- npx wrangler d1 execute gabriel_db --remote --file=sql/seed.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- RSP_001 Estate (pre-configured for 100-year archival)
INSERT OR IGNORE INTO estates (id, actor_id, preservation_level, instructions)
VALUES ('EST_RSP001', 'RSP_001', 'archival', 
  'Voice to be preserved in perpetuity under OAIS/PREMIS standards. Estate executor to be appointed by family. All Never Clauses remain immutable after death. 75/25 minimum split maintained for descendants in perpetuity.');

-- Audit log: System genesis
INSERT INTO audit_log (event_type, entity_type, entity_id, action, details)
VALUES ('system', 'empire', 'NOIZY', 'genesis', 
  '{"version": "1.0.0", "founder": "RSP_001", "date": "2026-04-10", "mission": "Consent as executable code"}');
