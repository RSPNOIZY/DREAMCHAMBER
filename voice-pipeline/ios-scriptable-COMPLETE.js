// NOIZY.AI — iOS Scriptable Complete Task Suite
// ═══════════════════════════════════════════════════════════════
// INSTALL: Copy each script into Scriptable app on iPhone
// Scriptable scripts sync via iCloud:
//   ~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/
//
// These scripts let Rob trigger NOIZY tasks by voice from iPhone
// without needing hands. Each is a single tap from iPhone home screen
// or Siri Shortcut.
//
// GOD.local IP: 10.90.90.10
// Voice Bridge: :8080  |  DreamChamber: :7777
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// SCRIPT 1: noizy-voice-send.js
// USAGE: Tap → speak → sends to Claude → notification
// ══════════════════════════════════════════════════════
const SCRIPT_VOICE_SEND = `
// noizy-voice-send.js — Speak to Claude from iPhone
// Scriptable | NOIZY.AI | RSP_001

const GOD = "http://10.90.90.10:8080";
const TOWER_OPTIONS = ["max", "code", "work"];

// Get text from widget param, Siri, or prompt
let text = args.widgetParameter
  || args.shortcutParameter
  || await Speech.recognize({language: "en-GB"})
  || await new Prompt().startText();

if (!text || text.trim() === "") {
  let p = new Alert();
  p.title = "NOIZY";
  p.message = "No input received.";
  await p.present();
  Script.complete();
}

// Auto-detect tower
let tower = "max";
let t = text.toLowerCase();
if (/build|code|deploy|script|api|git|fix/.test(t)) tower = "code";
else if (/task|assign|crew|delegate|schedule/.test(t)) tower = "work";

// Send to DreamChamber
let req = new Request(GOD + "/api/voice/v2/speak");
req.method = "POST";
req.headers = {"Content-Type": "application/json"};
req.body = JSON.stringify({ text, tower });

try {
  let resp = await req.loadJSON();
  
  // Show response
  let alert = new Alert();
  alert.title = "Claude " + tower.toUpperCase();
  alert.message = (resp.reply || "No response").substring(0, 300);
  alert.addAction("Copy");
  alert.addCancelAction("OK");
  let idx = await alert.present();
  if (idx === 0) Pasteboard.copyString(resp.reply || "");
  
  // Quick Look for long responses
  if (resp.reply && resp.reply.length > 300) {
    QuickLook.present(resp.reply);
  }
} catch(e) {
  let alert = new Alert();
  alert.title = "NOIZY Error";
  alert.message = e.message + "\\n\\nIs GOD.local awake?";
  await alert.present();
}

Script.complete();
`;

// ══════════════════════════════════════════════════════
// SCRIPT 2: noizy-mission.js
// USAGE: Launch a full GABRIEL crew mission from iPhone
// ══════════════════════════════════════════════════════
const SCRIPT_MISSION = `
// noizy-mission.js — Launch GABRIEL crew mission from iPhone
// Scriptable | NOIZY.AI | RSP_001

const GABRIEL = "http://10.90.90.10:7777";

let text = args.shortcutParameter
  || await Speech.recognize({language: "en-GB"})
  || (() => { let p = new Alert(); p.addTextField("Mission:"); return p.textFieldValue(0); })();

if (!text) { Script.complete(); }

// Launch mission
let req = new Request(GABRIEL + "/api/gabriel/v4/mission");
req.method = "POST";
req.headers = {"Content-Type": "application/json"};
req.body = JSON.stringify({ text, autoRoute: true, maxAgents: 3 });

try {
  let resp = await req.loadJSON();
  
  // Notification
  let n = new Notification();
  n.title = "GABRIEL Mission Dispatched";
  n.body = "Mission " + resp.missionId + " — 9 agents active";
  n.sound = "default";
  await n.schedule();
  
  let alert = new Alert();
  alert.title = "Mission Active";
  alert.message = "ID: " + resp.missionId + "\\n" + resp.message;
  await alert.present();
} catch(e) {
  let alert = new Alert();
  alert.title = "Mission Failed";
  alert.message = e.message;
  await alert.present();
}

Script.complete();
`;

// ══════════════════════════════════════════════════════
// SCRIPT 3: noizy-status-widget.js
// USAGE: Home screen widget showing NOIZY empire status
// ══════════════════════════════════════════════════════
const SCRIPT_STATUS_WIDGET = `
// noizy-status-widget.js — NOIZY Empire home screen widget
// Scriptable | NOIZY.AI | RSP_001

const GOD = "http://10.90.90.10";
const SERVICES = [
  { name: "Voice Bridge", url: GOD + ":8080/health", port: 8080 },
  { name: "DreamChamber", url: GOD + ":7777/health", port: 7777 },
  { name: "GABRIEL",      url: GOD + ":7777/api/gabriel/v4/health", port: 7777 },
  { name: "HEAVEN",     url: "https://heaven.rsp-5f3.workers.dev/health", port: null },
];

async function checkService(svc) {
  try {
    let req = new Request(svc.url);
    req.timeoutInterval = 3;
    let res = await req.loadString();
    return { ...svc, live: true };
  } catch {
    return { ...svc, live: false };
  }
}

let results = await Promise.all(SERVICES.map(checkService));

// Build widget
let w = new ListWidget();
w.backgroundColor = new Color("#0a0b2e");

// Title
let title = w.addText("⚡ NOIZY EMPIRE");
title.textColor = new Color("#b39ddb");
title.font = Font.boldSystemFont(14);
w.addSpacer(4);

// Date
let dateText = w.addText(new Date().toLocaleTimeString("en-CA", {hour:"2-digit",minute:"2-digit"}));
dateText.textColor = new Color("#666");
dateText.font = Font.systemFont(10);
w.addSpacer(8);

// Services
for (let svc of results) {
  let row = w.addStack();
  row.layoutHorizontally();
  
  let dot = row.addText(svc.live ? "●" : "○");
  dot.textColor = svc.live ? new Color("#4caf50") : new Color("#f44336");
  dot.font = Font.systemFont(10);
  row.addSpacer(6);
  
  let label = row.addText(svc.name);
  label.textColor = new Color("#e0e0e0");
  label.font = Font.systemFont(10);
  row.addSpacer();
  
  let status = row.addText(svc.live ? "LIVE" : "DOWN");
  status.textColor = svc.live ? new Color("#4caf50") : new Color("#f44336");
  status.font = Font.boldSystemFont(9);
  
  w.addSpacer(2);
}

w.addSpacer();
let footer = w.addText("GOD.local · RSP_001");
footer.textColor = new Color("#444");
footer.font = Font.systemFont(8);

Script.setWidget(w);
if (!config.runsInWidget) w.presentSmall();
Script.complete();
`;

// ══════════════════════════════════════════════════════
// SCRIPT 4: noizy-deploy.js
// USAGE: One-tap HEAVEN deploy from iPhone
// ══════════════════════════════════════════════════════
const SCRIPT_DEPLOY = `
// noizy-deploy.js — Trigger HEAVEN deploy from iPhone
// Scriptable | NOIZY.AI | RSP_001

const GABRIEL = "http://10.90.90.10:7777";

let alert = new Alert();
alert.title = "HEAVEN Deploy";
alert.message = "Deploy to Cloudflare now?";
alert.addDestructiveAction("Deploy");
alert.addCancelAction("Cancel");
let choice = await alert.present();
if (choice !== 0) { Script.complete(); }

// Trigger CB01 deploy mission
let req = new Request(GABRIEL + "/api/gabriel/v4/agent/CB01");
req.method = "POST";
req.headers = {"Content-Type": "application/json"};
req.body = JSON.stringify({ text: "Run full HEAVEN deploy: bash ~/Desktop/HEAVEN/DEPLOY_HEAVEN.sh and report status" });

try {
  let resp = await req.loadJSON();
  let a = new Alert();
  a.title = "CB01 — Deploy";
  a.message = (resp.reply || "Deploy initiated").substring(0, 300);
  await a.present();
} catch(e) {
  let a = new Alert();
  a.title = "Deploy Error";
  a.message = e.message;
  await a.present();
}
Script.complete();
`;

// Export all scripts
module.exports = {
  SCRIPT_VOICE_SEND,
  SCRIPT_MISSION,
  SCRIPT_STATUS_WIDGET,
  SCRIPT_DEPLOY,
};
