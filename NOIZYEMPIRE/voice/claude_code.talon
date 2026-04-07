# NOIZYLAB — Claude Code + NOIZY Voice Talon Commands
# =====================================================
# Copy to ~/.talon/user/claude_code.talon  (run: "sync talon" task)
#
# Requires:
#   - pokey.command-server  (VSCode extension — REQUIRED for Talon bridge)
#   - pokey.cursorless      (hands-free code editing)
#   - knistner.talon        (.talon syntax highlighting)
#   - knausj_talon or community repo for user.vscode() / user.vscode_run_task()
#
# Quick install:
#   code-insiders --install-extension pokey.command-server
#   code-insiders --install-extension pokey.cursorless

app.name: /Code.*Insiders|Code - Insiders/
-

# ─── NOIZY Voice Panel ────────────────────────────────────────────────────────

noizy voice:
    user.vscode("noizy-voice.openPanel")

noizy record:
    user.vscode("noizy-voice.toggle")

noizy dictate:
    user.vscode("noizy-voice.dictate")

noizy intake:
    user.vscode("noizy-voice.intake")

noizy ask claude:
    user.vscode("noizy-voice.askClaude")

noizy mode:
    user.vscode("noizy-voice.setMode")

# ─── Claude Inline Chat ───────────────────────────────────────────────────────

claude chat:
    user.vscode("workbench.action.chat.open")

claude here:
    user.vscode("inlineChat.start")

ask claude:
    user.vscode("inlineChat.start")

claude accept:
    user.vscode("inlineChat.acceptChanges")

claude discard:
    user.vscode("inlineChat.discardHeldChanges")

accept that:
    key(tab)

reject that:
    key(escape)

close claude:
    user.vscode("workbench.action.closeSidebar")

# ─── Claude Code Actions ──────────────────────────────────────────────────────

claude fix:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Fix the issue with this code")
    key(return)

claude explain:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Explain this code clearly and concisely")
    key(return)

claude test:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Write a pytest test for this function using arrange/act/assert")
    key(return)

claude refactor:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Refactor this for clarity and correctness. Keep it minimal.")
    key(return)

claude document:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Add a concise docstring to this function")
    key(return)

claude types:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Add type hints to this function signature and return type")
    key(return)

claude simplify:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Simplify this. Remove any over-engineering.")
    key(return)

# ─── NOIZY Platform Prompts ───────────────────────────────────────────────────

nerve map:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Map this to the NOIZY Nerve-to-Note adaptive input engine. What biometric signals or MIDI transforms are needed?")
    key(return)

vault this:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Generate a Vault of Self attribution entry for this asset. Include human lineage, AI assistance percentage, and a fingerprint hash.")
    key(return)

gabriel route:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Scaffold this as a GABRIEL orchestration task with FastAPI router, async handler, and typed Pydantic input/output models.")
    key(return)

intake spec:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Convert this into a full NOIZY spec document with Problem, Signal (NERVE), Solution, Components, and Acceptance Criteria.")
    key(return)

watermark this:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Add adversarial spectral watermarking to this audio pipeline using the NOIZY Sovereign Creative Protocol.")
    key(return)

federate this:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Implement federated learning for this — raw biometric data stays on device, only learned intent is uploaded. BIPA/GDPR compliant.")
    key(return)

lifeluv token:
    user.vscode("inlineChat.start")
    sleep(300ms)
    insert("Integrate LifeLUV token micro-split logic into this. Include recursive split calculation and legacy vault allocation.")
    key(return)

# ─── GABRIEL Control Tasks ────────────────────────────────────────────────────

gabriel status:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Status")
    key(return)

gabriel start:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Start Server")
    key(return)

gabriel bridge:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Start Bridge")
    key(return)

gabriel stop:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Stop All Servers")
    key(return)

gabriel health:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Health Check")
    key(return)

kill the noise:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("GABRIEL: Stop All Servers")
    key(return)

# ─── NOIZY Intake ─────────────────────────────────────────────────────────────

open inbox:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("INTAKE: Open Inbox")
    key(return)

new session:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("INTAKE: New Session File")
    key(return)

quick capture:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("INTAKE: Quick Voice Capture")
    key(return)

system health:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("NOIZY: System Health")
    key(return)

sync talon:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("Talon: Copy Voice Commands to ~/.talon")
    key(return)

# ─── Platform ─────────────────────────────────────────────────────────────────

platform start:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("Platform: Run NOIZY API")
    key(return)

platform install:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("Platform: Install Dependencies")
    key(return)

# ─── Slides ───────────────────────────────────────────────────────────────────

slides export:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("Slides: Export PPTX")
    key(return)

slides watch:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("Slides: Watch HTML")
    key(return)

# ─── Debug Launch ─────────────────────────────────────────────────────────────

debug platform:
    user.vscode("workbench.action.debug.selectandstart")
    sleep(200ms)
    insert("Platform API (port 8090)")
    key(return)

debug rob ava:
    user.vscode("workbench.action.debug.selectandstart")
    sleep(200ms)
    insert("Rob-AVA Server (port 8091)")
    key(return)

debug gabriel:
    user.vscode("workbench.action.debug.selectandstart")
    sleep(200ms)
    insert("GABRIEL Orchestrator")
    key(return)

debug python:
    user.vscode("workbench.action.debug.selectandstart")
    sleep(200ms)
    insert("Debug Python File")
    key(return)

debug stack:
    user.vscode("workbench.action.debug.selectandstart")
    sleep(200ms)
    insert("NOIZY Full Stack")
    key(return)

debug stop:
    user.vscode("workbench.action.debug.stop")

debug restart:
    user.vscode("workbench.action.debug.restart")

# ─── Editor ───────────────────────────────────────────────────────────────────

format file:
    user.vscode("editor.action.formatDocument")

save all:
    user.vscode("workbench.action.files.saveAll")

show problems:
    user.vscode("workbench.actions.view.problems")

open terminal:
    user.vscode("workbench.action.terminal.toggleTerminal")

split right:
    user.vscode("workbench.action.splitEditorRight")

go to file:
    user.vscode("workbench.action.quickOpen")

go to symbol:
    user.vscode("workbench.action.gotoSymbol")

find in files:
    user.vscode("workbench.action.findInFiles")

toggle sidebar:
    user.vscode("workbench.action.toggleSidebarVisibility")

zen mode:
    user.vscode("workbench.action.toggleZenMode")

# ─── Claude Web (Simple Browser in DREAMCHAMBER) ─────────────────────────────

# Open claude.ai as a panel inside VSCode Insiders
claude web:
    user.vscode("simpleBrowser.show")
    sleep(200ms)
    insert("https://claude.ai")
    key(return)

# Open Cloudflare dashboard
cloudflare dash:
    user.vscode("simpleBrowser.show")
    sleep(200ms)
    insert("https://dash.cloudflare.com")
    key(return)

# Open local platform API docs
api docs:
    user.vscode("simpleBrowser.show")
    sleep(200ms)
    insert("http://localhost:8090/docs")
    key(return)

# Open NOIZYLAB cockpit
open cockpit:
    user.vscode("simpleBrowser.show")
    sleep(200ms)
    insert("file:///Users/m2ultra/NOIZYLAB/workstation/cockpit.html")
    key(return)

# Open NOIZYFISH aquarium
open aquarium:
    user.vscode("simpleBrowser.show")
    sleep(200ms)
    insert("file:///Users/m2ultra/NOIZYLAB/workstation/aquarium.html")
    key(return)

# ─── CODEMASTER ──────────────────────────────────────────────────────────────

morning report:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("CODEMASTER: Morning Report")
    key(return)

codemaster dash:
    user.vscode("workbench.action.tasks.runTask")
    sleep(200ms)
    insert("CODEMASTER: Open Dashboard")
    key(return)
