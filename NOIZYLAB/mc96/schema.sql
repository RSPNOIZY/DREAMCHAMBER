-- MC96_BRAIN D1 Schema
-- Run: wrangler d1 execute MC96_BRAIN --file=schema.sql

CREATE TABLE IF NOT EXISTS agent_context (
  id          TEXT PRIMARY KEY,          -- e.g. "GABRIEL:task:2026-03-20"
  agent_id    TEXT NOT NULL,             -- SHIRL | POPS | ENGR_KEITH | DREAM | GABRIEL | RSP_001
  context_key TEXT NOT NULL,             -- e.g. "current_task" | "last_decision" | "learning"
  value       TEXT NOT NULL,             -- JSON blob
  confidence  REAL DEFAULT 1.0,          -- agent confidence in this entry (0.0–1.0)
  created_at  INTEGER NOT NULL,          -- unix ms
  expires_at  INTEGER,                   -- null = permanent
  tags        TEXT DEFAULT '[]'          -- JSON array: ["urgent","voice","recording"]
);

CREATE TABLE IF NOT EXISTS message_bus (
  id          TEXT PRIMARY KEY,
  from_agent  TEXT NOT NULL,
  to_agent    TEXT DEFAULT 'BROADCAST',  -- BROADCAST or specific agent
  intent      TEXT NOT NULL,             -- classified intent type
  payload     TEXT NOT NULL,             -- JSON
  status      TEXT DEFAULT 'pending',    -- pending | routing | executing | done | failed
  priority    INTEGER DEFAULT 5,         -- 1=critical, 5=normal, 9=background
  created_at  INTEGER NOT NULL,
  resolved_at INTEGER
);

CREATE TABLE IF NOT EXISTS agent_learnings (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL,
  trigger     TEXT NOT NULL,             -- what caused the learning
  learning    TEXT NOT NULL,             -- what was learned (JSON)
  applied     INTEGER DEFAULT 0,        -- has this been applied to agent behavior
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS permission_log (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL,            -- links to message_bus
  requested_by TEXT NOT NULL,           -- which agent asked
  decided_by  TEXT NOT NULL,            -- POPS | ENGR_KEITH | GOD
  decision    TEXT NOT NULL,            -- approved | denied | deferred
  reason      TEXT,
  created_at  INTEGER NOT NULL
);

-- Indexes: agent_context
CREATE INDEX IF NOT EXISTS idx_agent ON agent_context(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_key ON agent_context(agent_id, context_key);
CREATE INDEX IF NOT EXISTS idx_agent_expires ON agent_context(expires_at) WHERE expires_at IS NOT NULL;

-- Indexes: message_bus
CREATE INDEX IF NOT EXISTS idx_bus_status ON message_bus(status, priority);
CREATE INDEX IF NOT EXISTS idx_bus_agent ON message_bus(to_agent, status);
CREATE INDEX IF NOT EXISTS idx_bus_from ON message_bus(from_agent, created_at);
CREATE INDEX IF NOT EXISTS idx_bus_created ON message_bus(created_at);

-- Indexes: agent_learnings
CREATE INDEX IF NOT EXISTS idx_learn_agent ON agent_learnings(agent_id);
CREATE INDEX IF NOT EXISTS idx_learn_applied ON agent_learnings(applied, agent_id);

-- Indexes: permission_log
CREATE INDEX IF NOT EXISTS idx_perm_request ON permission_log(request_id);
CREATE INDEX IF NOT EXISTS idx_perm_decision ON permission_log(decision, created_at);
