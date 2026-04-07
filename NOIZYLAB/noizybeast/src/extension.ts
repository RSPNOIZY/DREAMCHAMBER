/**
 * NOIZYBEAST — Empire command surface extension
 * Wired to GABRIEL daemon (port 7777) — the real backend.
 * Deploy, CI, voice, GABRIEL dispatch, system status — all from VSCode.
 */
import * as vscode from 'vscode';

const CHANNEL_NAME = 'NOIZYBEAST';
let outputChannel: vscode.OutputChannel;
let statusItem: vscode.StatusBarItem;

function getConfig() {
  const cfg = vscode.workspace.getConfiguration('noizybeast');
  return {
    gabrielUrl: cfg.get<string>('gabrielUrl', 'http://localhost:7777'),
    actor: cfg.get<string>('actor', 'RSP001'),
    apiKey: cfg.get<string>('apiKey', ''),
  };
}

function authHeaders(): Record<string, string> {
  const { apiKey } = getConfig();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  return headers;
}

// ── GABRIEL /command — sends natural language, gets Claude response ──────────
async function sendToGabriel(text: string, tts = false): Promise<void> {
  const { gabrielUrl } = getConfig();
  const url = `${gabrielUrl}/command`;

  outputChannel.appendLine(`→ GABRIEL: "${text}" @ ${new Date().toISOString()}`);
  statusItem.text = '$(sync~spin) BEAST';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, tts }),
    });

    statusItem.text = '$(zap) BEAST';

    if (!res.ok) {
      const body = await res.text();
      outputChannel.appendLine(`✗ ${res.status}: ${body}`);
      vscode.window.showErrorMessage(`NOIZYBEAST: GABRIEL returned ${res.status}`);
      return;
    }

    const data = await res.json() as Record<string, unknown>;
    const reply = (data.reply || data.response || data.error || JSON.stringify(data)) as string;
    outputChannel.appendLine(`✓ ${reply}`);
    outputChannel.show(true);
    vscode.window.showInformationMessage(
      reply.length > 120 ? reply.slice(0, 117) + '...' : reply
    );
  } catch (err: unknown) {
    statusItem.text = '$(zap) BEAST';
    const message = err instanceof Error ? err.message : String(err);
    outputChannel.appendLine(`✗ ${message}`);
    vscode.window.showErrorMessage(
      `NOIZYBEAST: Cannot reach GABRIEL at ${gabrielUrl}. Is the daemon running?`
    );
  }
}

// ── GABRIEL /status — daemon health check ───────────────────────────────────
async function fetchStatus(): Promise<void> {
  const { gabrielUrl } = getConfig();

  try {
    const res = await fetch(`${gabrielUrl}/status`, { headers: authHeaders() });
    if (!res.ok) {
      vscode.window.showErrorMessage(`NOIZYBEAST: Status check failed (${res.status})`);
      return;
    }

    const data = await res.json() as Record<string, unknown>;
    const lines = [
      `daemon: ${data.daemon}`,
      `model: ${data.model}`,
      `voice: ${data.voice}`,
      `session: ${data.session_turns} turns`,
      `tasks: ${data.pending_tasks} pending`,
      `memory: ${data.memory_cells} cells`,
      `uptime: ${data.uptime_seconds}s`,
    ];
    outputChannel.appendLine(`⚡ ${lines.join(' | ')}`);
    outputChannel.show(true);
    vscode.window.showInformationMessage(`GABRIEL: ${data.daemon} — ${data.model}`);
  } catch {
    vscode.window.showErrorMessage(
      `NOIZYBEAST: Cannot reach GABRIEL. Run: node GABRIEL/daemon/gabriel-daemon.js`
    );
  }
}

// ── GABRIEL /speak — TTS through GABRIEL's voice ────────────────────────────
async function speak(text: string, voice?: string): Promise<void> {
  const { gabrielUrl } = getConfig();

  try {
    await fetch(`${gabrielUrl}/speak`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, voice }),
    });
    outputChannel.appendLine(`🔊 spoke: "${text.slice(0, 60)}..."`);
  } catch {
    outputChannel.appendLine(`✗ speak failed — GABRIEL offline`);
  }
}

// ── GABRIEL /memcell — read/write memory cells ──────────────────────────────
async function memcellGet(key: string): Promise<string | null> {
  const { gabrielUrl } = getConfig();
  try {
    const res = await fetch(`${gabrielUrl}/memcell/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json() as Record<string, string>;
    return data.value;
  } catch {
    return null;
  }
}

async function memcellSet(key: string, value: string, category = 'noizybeast'): Promise<void> {
  const { gabrielUrl } = getConfig();
  try {
    await fetch(`${gabrielUrl}/memcell/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ value, category }),
    });
    outputChannel.appendLine(`📝 memcell set: ${key}`);
  } catch {
    outputChannel.appendLine(`✗ memcell write failed`);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  outputChannel = vscode.window.createOutputChannel(CHANNEL_NAME);
  context.subscriptions.push(outputChannel);

  // ── Status bar ──────────────────────────────────────────────────────────────
  statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right, 50
  );
  statusItem.text = '$(zap) BEAST';
  statusItem.tooltip = 'NOIZYBEAST — Empire Command Surface (⇧⌘N)';
  statusItem.command = 'noizybeast.openCommandCenter';
  statusItem.show();
  context.subscriptions.push(statusItem);

  // ── Commands ────────────────────────────────────────────────────────────────
  context.subscriptions.push(
    // Deploy: tell GABRIEL to deploy
    vscode.commands.registerCommand('noizybeast.deployWorker', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Deploy NOIZY workers to Cloudflare Edge?',
        { modal: true },
        'Deploy'
      );
      if (confirm === 'Deploy') {
        await sendToGabriel('Deploy noisyvox and noisyproof workers to Cloudflare production. Run wrangler deploy for both.');
        await memcellSet('last_deploy_trigger', new Date().toISOString(), 'deployment');
      }
    }),

    // Turbo: run CI/build
    vscode.commands.registerCommand('noizybeast.runTurbo', async () => {
      await sendToGabriel('Run typecheck and build for all Node packages: noisyvox, noisyproof, noizy-voice, GABRIEL daemon. Report any failures.');
    }),

    // Send to GABRIEL: free-form input
    vscode.commands.registerCommand('noizybeast.sendToGabriel', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'What do you want to tell GABRIEL?',
        placeHolder: 'e.g., "check DNS for noizy.ai" or "morning brief"',
      });
      if (input) {
        await sendToGabriel(input);
      }
    }),

    // Status check
    vscode.commands.registerCommand('noizybeast.showStatus', () =>
      fetchStatus()
    ),

    // Voice: bridge to DreamChamber
    vscode.commands.registerCommand('noizybeast.activateVoice', () => {
      vscode.commands.executeCommand('dreamchamber.toggle').then(
        undefined,
        () => vscode.window.showWarningMessage(
          'NOIZYBEAST: DreamChamber not found. Install it for voice commands.'
        )
      );
    }),

    // Command Center: the hub
    vscode.commands.registerCommand('noizybeast.openCommandCenter', async () => {
      const items = [
        { label: '$(broadcast) Send to GABRIEL',     description: 'Free-form command',         command: 'noizybeast.sendToGabriel' },
        { label: '$(cloud-upload) Deploy to CF Edge', description: 'noisyvox + noisyproof',    command: 'noizybeast.deployWorker' },
        { label: '$(play) Run Turbo Build',           description: 'Typecheck + build all',    command: 'noizybeast.runTurbo' },
        { label: '$(pulse) Empire Status',             description: 'GABRIEL daemon health',    command: 'noizybeast.showStatus' },
        { label: '$(unmute) Activate Voice',           description: 'DreamChamber toggle',      command: 'noizybeast.activateVoice' },
        { label: '$(megaphone) Morning Brief',         description: 'GABRIEL daily briefing',   command: '_noizybeast.brief' },
        { label: '$(note) GABRIEL Speak',              description: 'TTS through GABRIEL',      command: '_noizybeast.speak' },
      ];

      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: 'NOIZYBEAST Command Center — ⇧⌘N',
      });

      if (!pick) return;

      if (pick.command === '_noizybeast.brief') {
        await sendToGabriel('Give me the morning brief. Status of all systems, pending tasks, what needs attention today.');
      } else if (pick.command === '_noizybeast.speak') {
        const text = await vscode.window.showInputBox({ prompt: 'What should GABRIEL say?' });
        if (text) await speak(text);
      } else {
        vscode.commands.executeCommand(pick.command);
      }
    })
  );

  // ── Log activation to GABRIEL memcell ──────────────────────────────────────
  memcellSet('noizybeast_last_activate', new Date().toISOString(), 'extension');

  outputChannel.appendLine('NOIZYBEAST activated — wired to GABRIEL :7777');
  vscode.window.setStatusBarMessage('⚡ NOIZYBEAST online', 3000);
}

export function deactivate(): void {
  outputChannel?.dispose();
}
