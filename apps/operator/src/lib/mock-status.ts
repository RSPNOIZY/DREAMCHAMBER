export type TruthStatus =
  | "LIVE"
  | "WORKING_BUT_INTERNAL"
  | "SPEC_ONLY"
  | "BLOCKED"
  | "STALLED"
  | "NEEDS_VERIFICATION"
  | "DEPRECATED";

export type SystemStatusItem = {
  name: string;
  status: TruthStatus;
  blocker?: string;
  nextAction?: string;
  owner?: string;
  lastVerified?: string;
};

export type ProjectStatusItem = {
  name: string;
  status: TruthStatus;
  nextAction: string;
  owner?: string;
};

export type AlertItem = {
  id: string;
  level: "info" | "warning" | "critical";
  message: string;
};

export const systemStatus: SystemStatusItem[] = [
  {
    name: "consent-gateway",
    status: "SPEC_ONLY",
    blocker: "Worker scaffold exists but not deployed — needs ANTHROPIC_API_KEY + wrangler deploy",
    nextAction: "Bind D1 agent-memory and deploy health + eligibility routes",
    owner: "NOIZYBEAST",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "core_schema.sql",
    status: "WORKING_BUT_INTERNAL",
    blocker: "Needs migration run: wrangler d1 execute agent-memory --remote --file sql/core_schema.sql",
    nextAction: "Apply schema + verify founding records (CREATOR_RSP_001, HVS_RSP_001)",
    owner: "NOIZYBEAST",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "GABRIEL DreamChamber",
    status: "LIVE",
    nextAction: "Add ANTHROPIC_API_KEY to ~/NOIZYLAB/.env to unlock speak()",
    owner: "GABRIEL",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "HEAVEN worker",
    status: "LIVE",
    nextAction: "Deploy HEAVEN: cd ~/Desktop/HEAVEN && npx wrangler deploy",
    owner: "Infra",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "noizy.ai domain",
    status: "BLOCKED",
    blocker: "CF email must change to rsp@noizy.ai before GoDaddy exit",
    nextAction: "dash.cloudflare.com → Profile → Email → rsp@noizy.ai",
    owner: "RSP_001",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "Voice Bridge",
    status: "BLOCKED",
    blocker: "ANTHROPIC_API_KEY not in ~/NOIZYLAB/.env",
    nextAction: "echo 'ANTHROPIC_API_KEY=sk-ant-...' >> ~/NOIZYLAB/.env",
    owner: "RSP_001",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "Beast dashboard",
    status: "WORKING_BUT_INTERNAL",
    blocker: "Static data — not yet fetching from GABRIEL V3 /empire",
    nextAction: "Wire fetch layer to http://localhost:7777/api/gabriel/v3/empire",
    owner: "Operator",
    lastVerified: "2026-03-27T14:12:00Z",
  },
  {
    name: "R2 storage",
    status: "BLOCKED",
    blocker: "Bucket not verified — needed for provenance_records manifest_ref",
    nextAction: "Enable R2 and test upload path",
    owner: "Infra",
    lastVerified: "2026-03-27T14:12:00Z",
  },
];

export const projectStatus: ProjectStatusItem[] = [
  { name: "NOIZY.ai",     status: "WORKING_BUT_INTERNAL", nextAction: "Deploy HEAVEN worker → noizy.ai goes live", owner: "Mothership" },
  { name: "DreamChamber", status: "LIVE",                 nextAction: "Add ANTHROPIC_API_KEY to unlock speak()", owner: "GABRIEL" },
  { name: "NOIZYVOX",     status: "SPEC_ONLY",            nextAction: "Creator consent + Voice DNA session UX", owner: "NOIZYVOX" },
  { name: "NOIZYLAB",     status: "WORKING_BUT_INTERNAL", nextAction: "Repairs portal → deploy + connect payment", owner: "NOIZYLAB" },
  { name: "NOIZYKIDZ",    status: "SPEC_ONLY",            nextAction: "Product spec + scaffold", owner: "NOIZYKIDZ" },
  { name: "LIFELUV",      status: "SPEC_ONLY",            nextAction: "Define product scope", owner: "LIFELUV" },
  { name: "FISH MUSIC",   status: "WORKING_BUT_INTERNAL", nextAction: "Connect to NOIZY.ai consent layer", owner: "FISH MUSIC" },
];

export const alerts: AlertItem[] = [
  { id: "alert-001", level: "critical", message: "CF email change required BEFORE any domain ops. dash.cloudflare.com → Profile → Email → rsp@noizy.ai" },
  { id: "alert-002", level: "critical", message: "ANTHROPIC_API_KEY missing from ~/NOIZYLAB/.env — Voice Bridge + GABRIEL speak() both blocked" },
  { id: "alert-003", level: "critical", message: "GitHub 2FA not enabled — account security risk" },
  { id: "alert-004", level: "warning",  message: "10 KV dead candidates flagged in KV_AUDIT_MAR27 — review before cleanup" },
  { id: "alert-005", level: "warning",  message: "Revocation enforcement path not tested end-to-end" },
  { id: "alert-006", level: "info",     message: "GABRIEL V3 routes deployed but speak() requires ANTHROPIC_API_KEY" },
];

export const commandLog = [
  "beast scaffold consent-gateway",
  "beast verify core-schema",
  "beast map dreamchamber shell",
  "beast audit runtime-truth",
  "beast queue",
  "beast registry",
];

export const currentMission = {
  title: "Ship the first NOIZYBEAST runtime slice",
  description: "Deploy consent-gateway, apply core schema to D1, connect Beast dashboard to live GABRIEL V3 data.",
  owner: "Robert Stephen Plowman + Claude",
  nextAction: "CF email change → wrangler deploy HEAVEN → ANTHROPIC_API_KEY",
  daysToTarget: 21,
  targetDate: "2026-04-17",
};

export const infrastructure = {
  gabriel:     { url: "http://localhost:7777", status: "LIVE" as TruthStatus },
  heaven:    { url: "https://heaven.rsp-5f3.workers.dev", status: "LIVE" as TruthStatus },
  voiceBridge: { url: "http://localhost:8080", status: "BLOCKED" as TruthStatus },
  ollama:      { url: "http://localhost:11434", status: "LIVE" as TruthStatus },
  d1Memory:    { id: "7b813205-fd12-4a23-84a6-ce83bc49ec70", name: "agent-memory", status: "LIVE" as TruthStatus },
  cfHeaven:    { id: "5f36aa9795348ea681d0b21910dfc82a", label: "HEAVEN account" },
  cfConsent:   { id: "5f36aa9795348ea681d0b21910dfc82a", label: "consent-gateway account" },
};
