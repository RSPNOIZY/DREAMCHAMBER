/**
 * DreamChamberProvider — ActivityBar sidebar WebviewViewProvider
 * Renders the full NOIZY voice + Claude panel in the VSCode sidebar.
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AudioBridge } from './AudioBridge';
import { ASRClient } from './ASRClient';
import { TTSClient } from './TTSClient';
import { ClaudeClient } from './ClaudeClient';
import { CommandRouter } from './CommandRouter';

export type DCMode = 'dictate' | 'intake' | 'claude' | 'cowrite';

export class DreamChamberProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'dreamchamber.panel';

  private _view?: vscode.WebviewView;
  private audio: AudioBridge;
  private asr: ASRClient;
  private tts: TTSClient;
  private claude: ClaudeClient;
  private router: CommandRouter;
  private mode: DCMode = 'dictate';
  private statusItem: vscode.StatusBarItem;

  constructor(
    private readonly context: vscode.ExtensionContext,
    statusItem: vscode.StatusBarItem
  ) {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    this.statusItem = statusItem;

    this.audio = new AudioBridge({
      sampleRate: 16000,
      silenceDuration: cfg.get<number>('silenceDuration', 1200),
    });

    this.asr = new ASRClient();
    this.tts = new TTSClient();

    this.claude = new ClaudeClient();

    this.router = new CommandRouter(this);

    this.mode = cfg.get<DCMode>('defaultMode', 'dictate');

    // Wire audio → ASR → dispatch
    this.audio.onAudio(async (buf, sr) => {
      try {
        const result = await this.asr.transcribe(buf, sr);
        if (result.text.trim()) {
          this._post({ type: 'transcript', text: result.text, confidence: result.confidence });
          await this.dispatch(result.text);
        }
      } catch (e) {
        this._post({ type: 'asrError', message: String(e) });
      }
    });

    this.audio.onStateChange((recording) => {
      this._post({ type: 'recordingState', recording });
      this.updateStatusBar(recording);
    });
  }

  // ─── WebviewViewProvider ─────────────────────────────────────────────────────
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHTML(webviewView.webview);

    // Messages from webview
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'toggle':        this.audio.toggle(); break;
        case 'setMode':       this.setMode(msg.mode); break;
        case 'webspeechText': await this.dispatch(msg.text); break;
        case 'askClaude':     await this.handleClaude(msg.text); break;
        case 'clearHistory':  this.claude.clearHistory(); this._post({ type: 'historyCleared' }); break;
        case 'stopTTS':       this.tts.stopSpeaking(); break;
        case 'ready':         this._post({ type: 'init', mode: this.mode, backend: this.audio.currentBackend }); break;
      }
    });
  }

  // ─── Public API used by extension commands ───────────────────────────────────
  toggle(): void { this.audio.toggle(); }

  setMode(mode: DCMode): void {
    this.mode = mode;
    this._post({ type: 'modeChange', mode });
    vscode.window.setStatusBarMessage(`DreamChamber: ${mode.toUpperCase()} mode`, 2000);
  }

  async askClaude(text?: string): Promise<void> {
    const input = text ?? await vscode.window.showInputBox({ prompt: 'Ask Claude...' });
    if (input) await this.handleClaude(input);
  }

  // ─── Core dispatch ────────────────────────────────────────────────────────────
  async dispatch(text: string): Promise<void> {
    this._post({ type: 'userText', text });

    // Try named command first
    const handled = await this.router.handle(text);
    if (handled) return;

    switch (this.mode) {
      case 'dictate':   this.insertAtCursor(text); break;
      case 'intake':    await this.appendToInbox(text); break;
      case 'claude':    await this.handleClaude(text); break;
      case 'cowrite':   await this.handleCowrite(text); break;
    }
  }

  // ─── Claude streaming ─────────────────────────────────────────────────────────
  async handleClaude(text: string): Promise<void> {
    this._post({ type: 'claudeThinking' });
    try {
      let full = '';
      const response = await this.claude.quickAsk(text, (token) => {
        full += token;
        this._post({ type: 'claudeToken', token });
      });
      this._post({ type: 'claudeDone', text: response });

      const cfg = vscode.workspace.getConfiguration('dreamchamber');
      if (cfg.get('speakResponses', true)) {
        await this.tts.speak(response);
      }
    } catch (e) {
      this._post({ type: 'claudeError', message: String(e) });
    }
  }

  // ─── Co-write: inject into active editor with Claude context ─────────────────
  private async handleCowrite(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const context = editor
      ? `[File: ${path.basename(editor.document.fileName)}]\n${editor.document.getText(editor.selection)}`
      : '';
    const prompt = context ? `${context}\n\n---\n${text}` : text;
    await this.handleClaude(prompt);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  insertAtCursor(text: string): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((eb) => eb.insert(editor.selection.active, text + ' '));
    }
  }

  async appendToInbox(text: string): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('dreamchamber');
    const relPath = cfg.get<string>('inboxPath', 'ideas/inbox.md');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
    const inboxPath = path.isAbsolute(relPath) ? relPath : path.join(workspaceRoot, relPath);

    const dir = path.dirname(inboxPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const entry = `\n- [${stamp}] ${text}`;
    fs.appendFileSync(inboxPath, entry, 'utf8');

    this._post({ type: 'intakeSaved', path: inboxPath });
    vscode.window.setStatusBarMessage(`📥 Intake saved → ${relPath}`, 3000);
  }

  private updateStatusBar(recording: boolean): void {
    if (recording) {
      this.statusItem.text = '$(record) NOIZY •';
      this.statusItem.tooltip = 'DreamChamber recording — click to stop';
      this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else {
      this.statusItem.text = '$(unmute) NOIZY';
      this.statusItem.tooltip = 'DreamChamber — click to record';
      this.statusItem.backgroundColor = undefined;
    }
  }

  private _post(msg: object): void {
    this._view?.webview.postMessage(msg);
  }

  dispose(): void {
    this.audio.dispose();
    this.tts.stopSpeaking();
  }

  // ─── HTML ─────────────────────────────────────────────────────────────────────
  private getHTML(webview: vscode.Webview): string {
    const nonce = Math.random().toString(36).slice(2);
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DreamChamber</title>
<style>
  :root {
    --bg:      #0d0d0f;
    --panel:   #141418;
    --border:  #2a2a35;
    --accent:  #00ffcc;
    --warn:    #ff6b35;
    --claude:  #9b59b6;
    --text:    #e8e8f0;
    --muted:   #666688;
    --record:  #e74c3c;
    --green:   #27ae60;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Menlo','Consolas',monospace; font-size: 12px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* Header */
  #header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid var(--border); background: var(--panel); flex-shrink: 0; }
  #logo { color: var(--accent); font-size: 13px; font-weight: bold; letter-spacing: 2px; }
  #backend-badge { font-size: 9px; color: var(--muted); border: 1px solid var(--border); padding: 1px 5px; border-radius: 3px; }

  /* Mode tabs */
  #modes { display: flex; gap: 2px; padding: 6px 8px; background: var(--panel); border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .mode-btn { flex: 1; padding: 4px 2px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 10px; font-family: inherit; border-radius: 3px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all .15s; }
  .mode-btn:hover { border-color: var(--accent); color: var(--accent); }
  .mode-btn.active { background: var(--accent)22; border-color: var(--accent); color: var(--accent); }

  /* Transcript + response feed */
  #feed { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; min-height: 0; }
  .msg { padding: 6px 8px; border-radius: 4px; line-height: 1.5; word-break: break-word; font-size: 11.5px; }
  .msg.user    { background: #1a1a2e; border-left: 2px solid var(--accent); }
  .msg.claude  { background: #1a1020; border-left: 2px solid var(--claude); }
  .msg.intake  { background: #1a1208; border-left: 2px solid var(--warn); }
  .msg.system  { color: var(--muted); font-size: 10px; text-align: center; }
  .msg.error   { background: #2a0a0a; border-left: 2px solid var(--record); color: #ff8888; }
  .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .msg.user .label    { color: var(--accent); }
  .msg.claude .label  { color: var(--claude); }
  .msg.intake .label  { color: var(--warn); }
  #thinking { color: var(--claude); font-size: 10px; padding: 4px 8px; animation: pulse 1s infinite; display: none; }
  @keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }

  /* Record button */
  #record-area { padding: 10px 8px 6px; flex-shrink: 0; }
  #rec-btn { width: 100%; padding: 10px; border: none; border-radius: 6px; background: var(--border); color: var(--text); font-family: inherit; font-size: 12px; font-weight: bold; cursor: pointer; letter-spacing: 2px; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  #rec-btn:hover { background: var(--accent)33; border: 1px solid var(--accent); }
  #rec-btn.recording { background: var(--record)22; border: 1px solid var(--record); color: var(--record); animation: pulse 1.5s infinite; }
  #rec-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted); }
  #rec-btn.recording #rec-dot { background: var(--record); }

  /* Input row */
  #input-row { display: flex; gap: 4px; padding: 0 8px 8px; flex-shrink: 0; }
  #text-input { flex: 1; background: var(--panel); border: 1px solid var(--border); border-radius: 4px; color: var(--text); padding: 5px 8px; font-family: inherit; font-size: 11px; outline: none; }
  #text-input:focus { border-color: var(--claude); }
  #send-btn { padding: 5px 10px; background: var(--claude)33; border: 1px solid var(--claude); color: var(--claude); font-family: inherit; font-size: 10px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
  #send-btn:hover { background: var(--claude)55; }

  /* Quick actions */
  #quick-actions { display: flex; flex-wrap: wrap; gap: 3px; padding: 0 8px 8px; flex-shrink: 0; }
  .qa-btn { padding: 3px 7px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: inherit; font-size: 9px; border-radius: 3px; cursor: pointer; text-transform: uppercase; }
  .qa-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* Scrollbar */
  #feed::-webkit-scrollbar { width: 4px; }
  #feed::-webkit-scrollbar-track { background: transparent; }
  #feed::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
</style>
</head>
<body>

<div id="header">
  <span id="logo">◈ DREAMCHAMBER</span>
  <span id="backend-badge">LOADING</span>
</div>

<div id="modes">
  <button class="mode-btn active" data-mode="dictate">DICTATE</button>
  <button class="mode-btn" data-mode="intake">INTAKE</button>
  <button class="mode-btn" data-mode="claude">CLAUDE</button>
  <button class="mode-btn" data-mode="cowrite">CO-WRITE</button>
</div>

<div id="feed">
  <div class="msg system">DreamChamber ready — say something or type below</div>
</div>
<div id="thinking">◉ Claude thinking...</div>

<div id="record-area">
  <button id="rec-btn">
    <span id="rec-dot"></span>
    <span id="rec-label">HOLD TO SPEAK</span>
  </button>
</div>

<div id="input-row">
  <input id="text-input" type="text" placeholder="Type or speak..." autocomplete="off" spellcheck="false">
  <button id="send-btn">ASK ⌘</button>
</div>

<div id="quick-actions">
  <button class="qa-btn" data-cmd="intake">📥 Intake</button>
  <button class="qa-btn" data-cmd="nerve">🧠 Nerve</button>
  <button class="qa-btn" data-cmd="vault">🔐 Vault</button>
  <button class="qa-btn" data-cmd="gabriel">⚡ Gabriel</button>
  <button class="qa-btn" data-cmd="clear">✕ Clear</button>
</div>

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
let isRecording = false;
let currentMode = 'dictate';
let useWebSpeech = false;
let recognition = null;
let claudeBuffer = '';

// ── Web Speech API setup ────────────────────────────────────────────────────
function setupWebSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;
  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        const text = e.results[i][0].transcript.trim();
        if (text) vscode.postMessage({ type: 'webspeechText', text });
      }
    }
  };
  recognition.onerror = (e) => { if (e.error !== 'aborted') addMsg('system', 'Speech: ' + e.error); };
  return true;
}

// ── DOM refs ────────────────────────────────────────────────────────────────
const feed = document.getElementById('feed');
const recBtn = document.getElementById('rec-btn');
const recLabel = document.getElementById('rec-label');
const thinking = document.getElementById('thinking');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const badgeEl = document.getElementById('backend-badge');

// ── Messages from extension ─────────────────────────────────────────────────
window.addEventListener('message', (e) => {
  const msg = e.data;
  switch (msg.type) {
    case 'init':
      currentMode = msg.mode;
      highlightMode(msg.mode);
      useWebSpeech = msg.backend === 'webspeech';
      badgeEl.textContent = msg.backend.toUpperCase();
      if (useWebSpeech) setupWebSpeech();
      break;
    case 'modeChange':
      currentMode = msg.mode;
      highlightMode(msg.mode);
      break;
    case 'recordingState':
      isRecording = msg.recording;
      recBtn.classList.toggle('recording', isRecording);
      recLabel.textContent = isRecording ? 'RECORDING...' : 'HOLD TO SPEAK';
      if (useWebSpeech) {
        if (isRecording && recognition) recognition.start();
        else if (recognition) recognition.stop();
      }
      break;
    case 'transcript':
      addMsg('user', msg.text, msg.confidence ? Math.round(msg.confidence * 100) + '% conf' : null);
      break;
    case 'userText':
      addMsg('user', msg.text);
      break;
    case 'claudeThinking':
      thinking.style.display = 'block';
      claudeBuffer = '';
      break;
    case 'claudeToken':
      claudeBuffer += msg.token;
      updateClaudeStream(claudeBuffer);
      break;
    case 'claudeDone':
      thinking.style.display = 'none';
      finalizeClaudeMsg(msg.text);
      break;
    case 'claudeError':
      thinking.style.display = 'none';
      addMsg('error', '⚡ Claude: ' + msg.message);
      break;
    case 'asrError':
      addMsg('error', '🎙 ASR: ' + msg.message);
      break;
    case 'intakeSaved':
      addMsg('intake', '📥 Saved to inbox');
      break;
    case 'historyCleared':
      addMsg('system', '— history cleared —');
      break;
  }
  feed.scrollTop = feed.scrollHeight;
});

// ── Streaming Claude UI ─────────────────────────────────────────────────────
let streamEl = null;
function updateClaudeStream(text) {
  if (!streamEl) {
    streamEl = document.createElement('div');
    streamEl.className = 'msg claude';
    streamEl.innerHTML = '<div class="label">CLAUDE</div><div class="body"></div>';
    feed.appendChild(streamEl);
  }
  streamEl.querySelector('.body').textContent = text;
  feed.scrollTop = feed.scrollHeight;
}
function finalizeClaudeMsg(text) {
  if (streamEl) { streamEl.querySelector('.body').textContent = text; streamEl = null; }
  else addMsg('claude', text);
  feed.scrollTop = feed.scrollHeight;
}

// ── Feed helpers ────────────────────────────────────────────────────────────
function addMsg(type, text, sub) {
  const d = document.createElement('div');
  d.className = 'msg ' + type;
  const labels = { user: 'YOU', claude: 'CLAUDE', intake: 'INTAKE', system: '', error: 'ERROR' };
  const label = labels[type] ?? type.toUpperCase();
  d.innerHTML = (label ? '<div class="label">' + label + (sub ? ' · ' + sub : '') + '</div>' : '') +
                '<div class="body">' + escHtml(text) + '</div>';
  feed.appendChild(d);
  feed.scrollTop = feed.scrollHeight;
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Highlight active mode ───────────────────────────────────────────────────
function highlightMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
}

// ── Events ──────────────────────────────────────────────────────────────────
recBtn.addEventListener('click', () => vscode.postMessage({ type: 'toggle' }));

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => vscode.postMessage({ type: 'setMode', mode: btn.dataset.mode }));
});

sendBtn.addEventListener('click', sendText);
textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendText(); });

function sendText() {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = '';
  if (currentMode === 'claude' || document.querySelector('.mode-btn[data-mode="claude"]').classList.contains('active')) {
    vscode.postMessage({ type: 'askClaude', text });
  } else {
    vscode.postMessage({ type: 'webspeechText', text });
  }
}

document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    if (cmd === 'clear') { vscode.postMessage({ type: 'clearHistory' }); feed.innerHTML = ''; return; }
    const prompts = {
      intake: 'intake',
      nerve:  'nerve map',
      vault:  'vault this',
      gabriel: 'gabriel status',
    };
    if (prompts[cmd]) vscode.postMessage({ type: 'webspeechText', text: prompts[cmd] });
  });
});

// Request init
vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
  }
}
