import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { CommandRouter, VoiceMode } from './CommandRouter';

export class VoicePanel {
  private readonly panel: vscode.WebviewPanel;
  private mode: VoiceMode;
  private isRecording = false;
  private _onDispose?: () => void;

  constructor(
    private readonly ctx: vscode.ExtensionContext,
    private readonly router: CommandRouter,
    private readonly statusBar: vscode.StatusBarItem
  ) {
    const config = vscode.workspace.getConfiguration('noizyVoice');
    this.mode = (config.get<VoiceMode>('defaultMode')) ?? 'dictate';

    this.panel = vscode.window.createWebviewPanel(
      'noizyVoice',
      'NOIZY Voice Input',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.panel.webview.html = this.buildHtml();

    this.panel.webview.onDidReceiveMessage((msg) => this.handleMessage(msg));
    this.panel.onDidDispose(() => {
      this.isRecording = false;
      this.renderStatusBar();
      this._onDispose?.();
    });

    this.renderStatusBar();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  onDispose(cb: () => void): void { this._onDispose = cb; }
  reveal(): void { this.panel.reveal(vscode.ViewColumn.Beside, true); }
  dispose(): void { this.panel.dispose(); }

  toggleRecording(): void {
    this.panel.webview.postMessage({ type: 'toggle' });
  }

  startRecording(): void {
    this.panel.webview.postMessage({ type: 'start' });
  }

  stopRecording(): void {
    this.panel.webview.postMessage({ type: 'stop' });
  }

  setMode(mode: VoiceMode): void {
    this.mode = mode;
    this.panel.webview.postMessage({ type: 'setMode', mode });
    this.renderStatusBar();
  }

  refreshConfig(): void {
    // Re-render the panel with updated config
    this.panel.webview.html = this.buildHtml();
  }

  // ─── Message Handler ───────────────────────────────────────────────────────

  private async handleMessage(msg: { type: string; [k: string]: unknown }): Promise<void> {
    switch (msg.type) {
      case 'transcript':
        await this.router.route(
          msg.text as string,
          this.mode,
          msg.isFinal as boolean
        );
        break;

      case 'state':
        this.isRecording = msg.recording as boolean;
        this.renderStatusBar();
        break;

      case 'modeChange':
        this.mode = msg.mode as VoiceMode;
        this.renderStatusBar();
        break;

      case 'quickCapture':
        await this.router.appendToInbox(msg.text as string);
        break;

      case 'openInbox':
        await vscode.commands.executeCommand(
          'workbench.action.tasks.runTask',
          'INTAKE: Open Inbox'
        );
        break;

      case 'status':
        vscode.window.setStatusBarMessage(`NOIZY Voice: ${msg.text}`, 3000);
        break;

      case 'error':
        vscode.window.showErrorMessage(`NOIZY Voice: ${msg.text}`);
        break;
    }
  }

  // ─── Status Bar ────────────────────────────────────────────────────────────

  private renderStatusBar(): void {
    const modeIcon: Record<VoiceMode, string> = {
      dictate: '$(edit)',
      intake: '$(inbox)',
      command: '$(hubot)',
      capture: '$(save)',
    };

    if (this.isRecording) {
      this.statusBar.text = `$(record) NOIZY [${this.mode.toUpperCase()}]`;
      this.statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      this.statusBar.tooltip = `Recording — mode: ${this.mode}\nCtrl+Shift+Space to stop`;
    } else {
      this.statusBar.text = `${modeIcon[this.mode]} NOIZY Voice`;
      this.statusBar.backgroundColor = undefined;
      this.statusBar.tooltip = `NOIZY Voice — mode: ${this.mode}\nCtrl+Shift+Space to record`;
    }
  }

  // ─── Webview HTML ──────────────────────────────────────────────────────────

  private buildHtml(): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const config = vscode.workspace.getConfiguration('noizyVoice');
    const lang = config.get<string>('language') ?? 'en-US';
    const interim = config.get<boolean>('interimResults') ?? true;
    const defaultMode = this.mode;

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src 'nonce-${nonce}';
             script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NOIZY Voice</title>
  <style nonce="${nonce}">
    :root {
      --bg:       #0a0a0a;
      --surface:  #111;
      --border:   #222;
      --accent:   #00ffcc;
      --intake:   #ff6b35;
      --command:  #9b59b6;
      --capture:  #f39c12;
      --danger:   #e74c3c;
      --text:     #e0e0e0;
      --muted:    #666;
      --font:     'Fira Code', 'Consolas', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      font-size: 13px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
      overflow: hidden;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 11px;
      letter-spacing: 0.15em;
      color: var(--muted);
      text-transform: uppercase;
    }
    .logo span { color: var(--accent); }

    /* ── Mode Selector ── */
    .modes {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .mode-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 8px 4px;
      font-family: var(--font);
      font-size: 11px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      border-radius: 3px;
      text-align: center;
      transition: all 0.15s;
    }
    .mode-btn:hover { color: var(--text); border-color: #444; }
    .mode-btn.active[data-mode="dictate"]  { border-color: var(--accent);  color: var(--accent); }
    .mode-btn.active[data-mode="intake"]   { border-color: var(--intake);  color: var(--intake); }
    .mode-btn.active[data-mode="command"]  { border-color: var(--command); color: var(--command); }
    .mode-btn.active[data-mode="capture"]  { border-color: var(--capture); color: var(--capture); }

    /* ── Record Button ── */
    .record-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #recordBtn {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--surface);
      border: 2px solid var(--border);
      color: var(--muted);
      font-size: 28px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    #recordBtn:hover { border-color: var(--accent); color: var(--accent); }
    #recordBtn.recording {
      border-color: var(--danger);
      color: var(--danger);
      animation: pulse 1.2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(231,76,60,0.4); }
      50% { box-shadow: 0 0 0 12px rgba(231,76,60,0); }
    }

    /* ── Status Line ── */
    #statusLine {
      font-size: 11px;
      color: var(--muted);
      text-align: center;
      height: 16px;
      letter-spacing: 0.05em;
    }
    #statusLine.recording { color: var(--danger); }

    /* ── Transcript Box ── */
    #transcript {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 12px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.7;
      min-height: 80px;
    }
    .interim { color: var(--muted); font-style: italic; }
    .final   { color: var(--text); }
    .command-echo {
      font-size: 11px;
      color: var(--accent);
      border-left: 2px solid var(--accent);
      padding-left: 8px;
      margin-top: 4px;
    }

    /* ── Quick Actions ── */
    .quick-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .quick-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 7px 10px;
      font-family: var(--font);
      font-size: 11px;
      cursor: pointer;
      border-radius: 3px;
      text-align: left;
      transition: all 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .quick-btn:hover { color: var(--text); border-color: #444; }

    /* ── Command Reference ── */
    details {
      font-size: 11px;
      color: var(--muted);
    }
    details summary {
      cursor: pointer;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 4px 0;
    }
    details summary:hover { color: var(--text); }
    .cmd-list {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-height: 140px;
      overflow-y: auto;
    }
    .cmd-item {
      display: flex;
      gap: 8px;
    }
    .cmd-phrase {
      color: var(--accent);
      min-width: 130px;
      flex-shrink: 0;
    }
    .cmd-desc { color: var(--muted); }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <span class="logo">⬛ <span>NOIZY</span> VOICE</span>
    <span id="modeBadge" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">DICTATE</span>
  </div>

  <!-- Mode Selector -->
  <div class="modes">
    <button class="mode-btn active" data-mode="dictate"  title="Type at cursor">Dictate</button>
    <button class="mode-btn"        data-mode="intake"   title="Capture to inbox">Intake</button>
    <button class="mode-btn"        data-mode="command"  title="Ask Claude">Command</button>
    <button class="mode-btn"        data-mode="capture"  title="Session capture">Capture</button>
  </div>

  <!-- Record Button -->
  <div class="record-wrap">
    <button id="recordBtn" title="Ctrl+Shift+Space to toggle">🎙</button>
  </div>
  <div id="statusLine">Ready — click to record</div>

  <!-- Live Transcript -->
  <div id="transcript"></div>

  <!-- Quick Actions -->
  <div class="quick-row">
    <button class="quick-btn" id="btnInbox"   title="Open ideas/inbox.md">📥 Open Inbox</button>
    <button class="quick-btn" id="btnCapture" title="Type a quick capture">📝 Quick Capture</button>
    <button class="quick-btn" id="btnGabriel" title="GABRIEL status">⚙ GABRIEL Status</button>
    <button class="quick-btn" id="btnHealth"  title="System health check">🩺 System Health</button>
  </div>

  <!-- Command Reference -->
  <details>
    <summary>Voice Commands ›</summary>
    <div class="cmd-list" id="cmdList"></div>
  </details>

<script nonce="${nonce}">
  // ─── State ────────────────────────────────────────────────────────────────
  const vscode = acquireVsCodeApi();
  let mode = '${defaultMode}';
  let recording = false;
  let recognition = null;
  const LANG = '${lang}';
  const INTERIM = ${interim};

  // ─── Web Speech API ───────────────────────────────────────────────────────
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function initRecognition() {
    if (!SR) {
      setStatus('⚠ Speech API unavailable — try Chrome/Edge engine in VSCode Insiders', true);
      return null;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = INTERIM;
    r.lang = LANG;
    r.maxAlternatives = 1;

    r.onstart  = () => setRecordingState(true);
    r.onend    = () => {
      // Auto-restart if we didn't explicitly stop
      if (recording) { try { r.start(); } catch(_) {} }
      else { setRecordingState(false); }
    };
    r.onerror  = (e) => {
      if (e.error === 'aborted') return;
      setStatus('⚠ ' + e.error, false);
      setRecordingState(false);
    };
    r.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          appendTranscript(text, true);
          vscode.postMessage({ type: 'transcript', text, isFinal: true, confidence: res[0].confidence });
        } else {
          interimText += text;
        }
      }
      if (interimText) showInterim(interimText);
    };
    return r;
  }

  recognition = initRecognition();

  // ─── Recording Controls ───────────────────────────────────────────────────
  function startRecording() {
    if (!recognition) { recognition = initRecognition(); }
    if (!recognition) return;
    clearInterim();
    recording = true;
    try { recognition.start(); }
    catch(e) { recognition = initRecognition(); if(recognition) recognition.start(); }
    setRecordingState(true);
  }

  function stopRecording() {
    recording = false;
    if (recognition) { try { recognition.stop(); } catch(_) {} }
    setRecordingState(false);
  }

  function toggleRecording() {
    if (recording) stopRecording(); else startRecording();
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────
  const recordBtn  = document.getElementById('recordBtn');
  const statusLine = document.getElementById('statusLine');
  const transcript = document.getElementById('transcript');
  const modeBadge  = document.getElementById('modeBadge');

  function setRecordingState(active) {
    recording = active;
    recordBtn.textContent = active ? '⏹' : '🎙';
    recordBtn.classList.toggle('recording', active);
    statusLine.classList.toggle('recording', active);
    statusLine.textContent = active
      ? '● Recording — ' + modeLabel(mode)
      : 'Ready — click to record';
    vscode.postMessage({ type: 'state', recording: active });
  }

  function setStatus(msg, isError) {
    statusLine.textContent = msg;
    statusLine.style.color = isError ? 'var(--danger)' : 'var(--muted)';
    vscode.postMessage({ type: isError ? 'error' : 'status', text: msg });
  }

  let interimEl = null;
  function showInterim(text) {
    if (!interimEl) {
      interimEl = document.createElement('div');
      interimEl.className = 'interim';
      transcript.appendChild(interimEl);
    }
    interimEl.textContent = text + '…';
    transcript.scrollTop = transcript.scrollHeight;
  }
  function clearInterim() {
    if (interimEl) { interimEl.remove(); interimEl = null; }
  }

  function appendTranscript(text, isFinal) {
    clearInterim();
    const el = document.createElement('div');
    el.className = isFinal ? 'final' : 'interim';
    el.textContent = text;
    transcript.appendChild(el);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function modeLabel(m) {
    return ({ dictate: 'Dictate → cursor', intake: 'Intake → inbox', command: 'Command → Claude', capture: 'Capture → session' })[m] || m;
  }

  // ─── Mode Switching ───────────────────────────────────────────────────────
  const modeColors = {
    dictate: 'var(--accent)',
    intake:  'var(--intake)',
    command: 'var(--command)',
    capture: 'var(--capture)',
  };

  function switchMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    modeBadge.textContent = mode.toUpperCase();
    modeBadge.style.color = modeColors[mode] || 'var(--muted)';
    vscode.postMessage({ type: 'modeChange', mode });
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // ─── Record Button ────────────────────────────────────────────────────────
  recordBtn.addEventListener('click', toggleRecording);

  // ─── Quick Actions ────────────────────────────────────────────────────────
  document.getElementById('btnInbox').addEventListener('click', () => {
    vscode.postMessage({ type: 'openInbox' });
  });
  document.getElementById('btnCapture').addEventListener('click', () => {
    const text = prompt('Quick capture:');
    if (text) vscode.postMessage({ type: 'quickCapture', text });
  });
  document.getElementById('btnGabriel').addEventListener('click', () => {
    vscode.postMessage({ type: 'transcript', text: 'gabriel status', isFinal: true });
  });
  document.getElementById('btnHealth').addEventListener('click', () => {
    vscode.postMessage({ type: 'transcript', text: 'system health', isFinal: true });
  });

  // ─── Messages from Extension ──────────────────────────────────────────────
  window.addEventListener('message', (event) => {
    const msg = event.data;
    if      (msg.type === 'toggle')  toggleRecording();
    else if (msg.type === 'start')   { if (!recording) startRecording(); }
    else if (msg.type === 'stop')    { if (recording)  stopRecording(); }
    else if (msg.type === 'setMode') switchMode(msg.mode);
  });

  // ─── Command Reference ────────────────────────────────────────────────────
  const COMMANDS = [
    ['intake [idea]',       'Append to inbox.md'],
    ['ask claude [query]',  'Send to inline chat'],
    ['nerve [note]',        'Insert NERVE annotation'],
    ['nerve map',           'Claude: map to Nerve-to-Note'],
    ['vault this',          'Claude: generate Vault entry'],
    ['gabriel route',       'Claude: scaffold GABRIEL task'],
    ['intake spec',         'Claude: convert to NOIZY spec'],
    ['gabriel status',      'GABRIEL status check'],
    ['gabriel start/stop',  'GABRIEL server control'],
    ['new session',         'Create session file'],
    ['open inbox',          'Open ideas/inbox.md'],
    ['system health',       'Full health check'],
    ['morning report',      'Morning briefing script'],
    ['fix this',            'Quick fix at cursor'],
    ['explain this',        'Claude: explain code'],
    ['kill the noise',      'Emergency stop all'],
    ['save / undo',         'Editor actions'],
  ];
  const cmdList = document.getElementById('cmdList');
  COMMANDS.forEach(([phrase, desc]) => {
    const row = document.createElement('div');
    row.className = 'cmd-item';
    row.innerHTML = '<span class="cmd-phrase">' + phrase + '</span><span class="cmd-desc">' + desc + '</span>';
    cmdList.appendChild(row);
  });

  // ─── Init ─────────────────────────────────────────────────────────────────
  switchMode('${defaultMode}');
</script>
</body>
</html>`;
  }
}
