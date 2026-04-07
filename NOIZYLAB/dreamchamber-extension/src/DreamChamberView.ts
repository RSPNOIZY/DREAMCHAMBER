import * as vscode from 'vscode';
import { ClaudeClient } from './ClaudeClient';
import { CharacterProfile } from './CharacterManager';
import { Take } from './TakeManager';
import { VaultMetadata } from './VaultExporter';
import { MusicBed } from './MusicBridge';
import { VoiceModel, SplitSummary, HVSReport } from './NoizyVoxRegistry';

export type DcState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'directing' | 'scoring' | 'error';
export type DcMode = 'dictate' | 'intake' | 'command' | 'capture';
export type DcTab = 'voice' | 'characters' | 'takes' | 'vault' | 'noizyvox';

export interface DcMessage {
  role: 'user' | 'assistant' | 'system' | 'director';
  text: string;
  timestamp: number;
}

export type ViewMessage =
  | { type: 'ready' }
  | { type: 'toggleRecording' }
  | { type: 'stop' }
  | { type: 'clearHistory' }
  | { type: 'setMode'; mode: DcMode }
  | { type: 'setTab'; tab: DcTab }
  | { type: 'selectCharacter'; id: string }
  | { type: 'approveTake'; takeId: string; sessionId: string }
  | { type: 'discardTake'; takeId: string; sessionId: string }
  | { type: 'exportTake'; takeId: string; sessionId: string }
  | { type: 'requestDirection' }
  | { type: 'generateMusic' }
  // NOIZYVOX
  | { type: 'nvxRegister'; slug: string; displayName: string; ownerHandle: string }
  | { type: 'nvxClone'; slug: string }
  | { type: 'nvxSynthesize'; slug: string; text: string }
  | { type: 'nvxRefresh' }
  | { type: 'nvxSelectModel'; slug: string }
  | { type: 'nvxGetHvs'; slug: string }
  | { type: 'nvxAnalyzeHvs'; slug: string };

export type ExtensionMessage =
  | { type: 'state'; state: DcState }
  | { type: 'mode'; mode: DcMode }
  | { type: 'tab'; tab: DcTab }
  | { type: 'token'; text: string }
  | { type: 'addMessage'; message: DcMessage }
  | { type: 'clearMessages' }
  | { type: 'error'; text: string }
  | { type: 'transcript'; text: string }
  | { type: 'setCharacters'; characters: CharacterProfile[] }
  | { type: 'setActiveCharacter'; character: CharacterProfile | null }
  | { type: 'setTakes'; takes: Take[] }
  | { type: 'takeScoredOrUpdated'; take: Take }
  | { type: 'setVaultExports'; exports: VaultMetadata[] }
  | { type: 'vaultExported'; metadata: VaultMetadata }
  | { type: 'musicReady'; bed: MusicBed }
  // NOIZYVOX
  | { type: 'nvxModels'; models: VoiceModel[] }
  | { type: 'nvxSplit'; summary: SplitSummary }
  | { type: 'nvxStatus'; online: boolean; xttsAvailable: boolean; device: string }
  | { type: 'nvxBusy'; slug: string; operation: string }
  | { type: 'nvxDone'; slug: string; message: string }
  | { type: 'nvxHvs'; report: HVSReport };

export class DreamChamberView implements vscode.WebviewViewProvider {
  public static readonly viewId = 'dreamchamber.panel';

  private view?: vscode.WebviewView;
  private state: DcState = 'idle';
  private mode: DcMode = 'command';
  private currentTab: DcTab = 'voice';
  private messages: DcMessage[] = [];

  // Wired by extension.ts
  onToggleRecording: () => void = () => {};
  onStop: () => void = () => {};
  onSelectCharacter: (id: string) => void = () => {};
  onApproveTake: (takeId: string, sessionId: string) => void = () => {};
  onDiscardTake: (takeId: string, sessionId: string) => void = () => {};
  onExportTake: (takeId: string, sessionId: string) => void = () => {};
  onRequestDirection: () => void = () => {};
  onGenerateMusic: () => void = () => {};
  // NOIZYVOX
  onNvxRegister: (slug: string, displayName: string, ownerHandle: string) => void = () => {};
  onNvxClone: (slug: string) => void = () => {};
  onNvxSynthesize: (slug: string, text: string) => void = () => {};
  onNvxRefresh: () => void = () => {};
  onNvxSelectModel: (slug: string) => void = () => {};
  onNvxGetHvs: (slug: string) => void = () => {};
  onNvxAnalyzeHvs: (slug: string) => void = () => {};

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly claude: ClaudeClient
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _ctx: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage((msg: ViewMessage) => {
      switch (msg.type) {
        case 'ready':
          this.sendMessage({ type: 'state', state: this.state });
          this.sendMessage({ type: 'mode', mode: this.mode });
          this.sendMessage({ type: 'tab', tab: this.currentTab });
          this.messages.forEach((m) => this.sendMessage({ type: 'addMessage', message: m }));
          break;
        case 'toggleRecording':  this.onToggleRecording(); break;
        case 'stop':             this.onStop(); break;
        case 'clearHistory':     this.clearHistory(); break;
        case 'setMode':          this.setMode(msg.mode); break;
        case 'setTab':           this.currentTab = msg.tab; break;
        case 'selectCharacter':  this.onSelectCharacter(msg.id); break;
        case 'approveTake':      this.onApproveTake(msg.takeId, msg.sessionId); break;
        case 'discardTake':      this.onDiscardTake(msg.takeId, msg.sessionId); break;
        case 'exportTake':       this.onExportTake(msg.takeId, msg.sessionId); break;
        case 'requestDirection': this.onRequestDirection(); break;
        case 'generateMusic':    this.onGenerateMusic(); break;
        // NOIZYVOX
        case 'nvxRegister':    this.onNvxRegister(msg.slug, msg.displayName, msg.ownerHandle); break;
        case 'nvxClone':       this.onNvxClone(msg.slug); break;
        case 'nvxSynthesize':  this.onNvxSynthesize(msg.slug, msg.text); break;
        case 'nvxRefresh':     this.onNvxRefresh(); break;
        case 'nvxSelectModel': this.onNvxSelectModel(msg.slug); break;
        case 'nvxGetHvs':     this.onNvxGetHvs(msg.slug); break;
        case 'nvxAnalyzeHvs': this.onNvxAnalyzeHvs(msg.slug); break;
      }
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  setState(state: DcState): void {
    this.state = state;
    this.sendMessage({ type: 'state', state });
    vscode.commands.executeCommand('setContext', 'dreamchamber.recording', state === 'recording');
  }

  setMode(mode: DcMode): void {
    this.mode = mode;
    this.sendMessage({ type: 'mode', mode });
  }

  setTab(tab: DcTab): void {
    this.currentTab = tab;
    this.sendMessage({ type: 'tab', tab });
  }

  getMode(): DcMode { return this.mode; }
  getTab(): DcTab   { return this.currentTab; }

  pushToken(token: string): void {
    this.sendMessage({ type: 'token', text: token });
  }

  addMessage(role: DcMessage['role'], text: string): void {
    const msg: DcMessage = { role, text, timestamp: Date.now() };
    this.messages.push(msg);
    this.sendMessage({ type: 'addMessage', message: msg });
  }

  showError(text: string): void {
    this.sendMessage({ type: 'error', text });
  }

  showTranscript(text: string): void {
    this.sendMessage({ type: 'transcript', text });
  }

  setCharacters(characters: CharacterProfile[]): void {
    this.sendMessage({ type: 'setCharacters', characters });
  }

  setActiveCharacter(character: CharacterProfile | null): void {
    this.sendMessage({ type: 'setActiveCharacter', character });
  }

  setTakes(takes: Take[]): void {
    this.sendMessage({ type: 'setTakes', takes });
  }

  updateTake(take: Take): void {
    this.sendMessage({ type: 'takeScoredOrUpdated', take });
  }

  setVaultExports(exports: VaultMetadata[]): void {
    this.sendMessage({ type: 'setVaultExports', exports });
  }

  notifyVaultExport(metadata: VaultMetadata): void {
    this.sendMessage({ type: 'vaultExported', metadata });
  }

  notifyMusicReady(bed: MusicBed): void {
    this.sendMessage({ type: 'musicReady', bed });
  }

  // ─── NOIZYVOX public API ──────────────────────────────────────────────────

  setNvxModels(models: VoiceModel[]): void {
    this.sendMessage({ type: 'nvxModels', models });
  }

  setNvxSplit(summary: SplitSummary): void {
    this.sendMessage({ type: 'nvxSplit', summary });
  }

  setNvxStatus(online: boolean, xttsAvailable: boolean, device: string): void {
    this.sendMessage({ type: 'nvxStatus', online, xttsAvailable, device });
  }

  nvxBusy(slug: string, operation: string): void {
    this.sendMessage({ type: 'nvxBusy', slug, operation });
  }

  nvxDone(slug: string, message: string): void {
    this.sendMessage({ type: 'nvxDone', slug, message });
  }

  setNvxHvs(report: HVSReport): void {
    this.sendMessage({ type: 'nvxHvs', report });
  }

  clearHistory(): void {
    this.messages = [];
    this.claude.clearHistory();
    this.sendMessage({ type: 'clearMessages' });
  }

  reveal(): void {
    this.view?.show(true);
  }

  private sendMessage(msg: ExtensionMessage): void {
    this.view?.webview.postMessage(msg);
  }

  // ─── HTML ──────────────────────────────────────────────────────────────────

  private getHtml(): string {
    return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
<title>DreamChamber</title>
<style>
:root{
  --accent:#00ffcc;--intake:#ff6b35;--command:#9b59b6;--dictate:#3498db;
  --capture:#f1c40f;--vault:#e74c3c;--music:#2ecc71;--director:#f39c12;
  --nvx:#f0a500;
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;--muted:#8b949e;--error:#f85149;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);
  display:flex;flex-direction:column;height:100vh;overflow:hidden;font-size:12.5px}
.hdr{display:flex;align-items:center;gap:6px;padding:8px 10px 6px;
  border-bottom:1px solid var(--border);flex-shrink:0}
.logo{font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--accent);text-transform:uppercase}
.badge{font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surface);
  border:1px solid var(--border);color:var(--muted);text-transform:uppercase;
  letter-spacing:.07em;margin-left:auto;transition:all .2s}
.badge.recording{border-color:var(--error);color:var(--error)}
.badge.thinking,.badge.directing,.badge.scoring{border-color:var(--accent);color:var(--accent)}
.badge.speaking{border-color:var(--command);color:var(--command)}
.badge.transcribing{border-color:var(--dictate);color:var(--dictate)}
.tabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0}
.tab{flex:1;padding:6px 2px;border:none;background:transparent;color:var(--muted);
  font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  border-bottom:2px solid transparent;transition:all .15s}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.panel{display:none;flex:1;flex-direction:column;overflow:hidden;min-height:0}
.panel.active{display:flex}
.scroll{flex:1;overflow-y:auto;padding:10px}
.scroll::-webkit-scrollbar{width:3px}
.scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.modes{display:flex;gap:3px;padding:5px 10px;border-bottom:1px solid var(--border);flex-shrink:0}
.mode-btn{flex:1;padding:3px 0;border:1px solid var(--border);border-radius:4px;
  background:transparent;color:var(--muted);font-size:9px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:all .12s}
.mode-btn:hover{border-color:var(--accent);color:var(--accent)}
.mode-btn.active[data-mode=dictate]{border-color:var(--dictate);color:var(--dictate);background:rgba(52,152,219,.08)}
.mode-btn.active[data-mode=intake]{border-color:var(--intake);color:var(--intake);background:rgba(255,107,53,.08)}
.mode-btn.active[data-mode=command]{border-color:var(--command);color:var(--command);background:rgba(155,89,182,.08)}
.mode-btn.active[data-mode=capture]{border-color:var(--capture);color:var(--capture);background:rgba(241,196,15,.08)}
.conversation{flex:1;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:8px;min-height:0}
.conversation::-webkit-scrollbar{width:3px}
.conversation::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.msg{max-width:100%;animation:fi .2s ease}
@keyframes fi{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
.msg-bubble{padding:7px 10px;border-radius:7px;line-height:1.5;word-break:break-word;white-space:pre-wrap;font-size:12px}
.msg.user .msg-bubble{background:rgba(0,255,204,.06);border:1px solid rgba(0,255,204,.18);margin-left:16px}
.msg.assistant .msg-bubble{background:var(--surface);border:1px solid var(--border);margin-right:16px}
.msg.director .msg-bubble{background:rgba(243,156,18,.06);border:1px solid rgba(243,156,18,.3);margin-right:16px;font-style:italic}
.msg.system .msg-bubble{background:transparent;border:none;color:var(--muted);font-size:10.5px;font-style:italic;text-align:center}
.msg-role{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:2px}
.msg.user .msg-role{color:var(--accent);text-align:right}
.msg.assistant .msg-role{color:var(--command)}
.msg.director .msg-role{color:var(--director)}
.streaming-cursor::after{content:'▋';animation:blink .7s step-start infinite;color:var(--accent)}
@keyframes blink{50%{opacity:0}}
.transcript-bar{padding:5px 10px;background:rgba(0,255,204,.04);border-top:1px solid rgba(0,255,204,.1);
  font-size:11px;color:var(--muted);font-style:italic;min-height:24px;
  display:none;align-items:center;gap:5px;flex-shrink:0}
.transcript-bar.vis{display:flex}
.dot{width:5px;height:5px;border-radius:50%;background:var(--error);animation:pulse 1s ease-in-out infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
.controls{padding:8px 10px;display:flex;gap:6px;border-top:1px solid var(--border);flex-shrink:0}
.btn-rec{flex:1;padding:9px;border:2px solid var(--accent);border-radius:7px;background:transparent;
  color:var(--accent);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .15s}
.btn-rec:hover{background:rgba(0,255,204,.08)}
.btn-rec.recording{border-color:var(--error);color:var(--error);animation:rp 1.5s ease-in-out infinite}
@keyframes rp{0%,100%{box-shadow:0 0 0 0 rgba(248,81,73,.4)}50%{box-shadow:0 0 0 5px rgba(248,81,73,0)}}
.btn-sm{padding:9px 12px;border:1px solid var(--border);border-radius:7px;background:transparent;
  color:var(--muted);font-size:11px;cursor:pointer;transition:all .15s}
.btn-sm:hover{border-color:var(--accent);color:var(--accent)}
.music-status{padding:5px 10px;background:rgba(46,204,113,.05);border-top:1px solid rgba(46,204,113,.15);
  font-size:10.5px;color:var(--music);display:none;align-items:center;gap:5px;flex-shrink:0}
.music-status.vis{display:flex}
.section-title{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);padding:6px 0 4px;border-bottom:1px solid var(--border);margin-bottom:8px}
.char-card{padding:8px 10px;background:var(--surface);border:1px solid var(--border);
  border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all .15s}
.char-card:hover{border-color:var(--accent)}
.char-card.active{border-color:var(--accent);background:rgba(0,255,204,.05)}
.char-name{font-weight:700;font-size:12px}
.char-dna{font-size:10px;color:var(--muted);margin-top:2px}
.char-emotions{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}
.emotion-tag{font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(0,255,204,.08);
  border:1px solid rgba(0,255,204,.2);color:var(--accent)}
.char-actions{display:flex;gap:5px;margin-top:6px}
.char-btn{font-size:9px;padding:3px 8px;border:1px solid var(--border);border-radius:4px;
  background:transparent;color:var(--muted);cursor:pointer;transition:all .12s}
.char-btn:hover{border-color:var(--accent);color:var(--accent)}
.take-card{padding:8px 10px;background:var(--surface);border:1px solid var(--border);
  border-radius:6px;margin-bottom:5px}
.take-card.approved{border-color:var(--music)}
.take-card.exported{border-color:var(--vault);opacity:.7}
.take-header{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.take-emotion{font-size:9px;padding:1px 6px;border-radius:3px;
  background:rgba(0,255,204,.1);border:1px solid rgba(0,255,204,.2);color:var(--accent);font-weight:700}
.take-score{font-size:9px;color:var(--muted);margin-left:auto}
.take-score.hi{color:var(--music)}.take-score.mid{color:var(--director)}.take-score.lo{color:var(--error)}
.take-transcript{font-size:11px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.take-actions{display:flex;gap:4px}
.take-btn{font-size:9px;padding:2px 7px;border:1px solid var(--border);border-radius:3px;
  background:transparent;color:var(--muted);cursor:pointer;transition:all .1s}
.take-btn.approve:hover{border-color:var(--music);color:var(--music)}
.take-btn.discard:hover{border-color:var(--error);color:var(--error)}
.take-btn.export:hover{border-color:var(--vault);color:var(--vault)}
.take-btn.ok{border-color:var(--music);color:var(--music)}
.take-btn.vaulted{border-color:var(--vault);color:var(--vault)}
.vault-card{padding:8px 10px;background:var(--surface);border:1px solid rgba(231,76,60,.25);
  border-radius:6px;margin-bottom:5px}
.vault-id{font-size:9px;font-family:monospace;color:var(--vault);letter-spacing:.04em}
.vault-char{font-size:11px;font-weight:700;margin-top:2px}
.vault-meta{font-size:10px;color:var(--muted);margin-top:2px}
.vault-rights{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap}
.rt{font-size:9px;padding:1px 5px;border-radius:3px}
.rt.y{background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.3);color:var(--music)}
.rt.n{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);color:var(--error)}
.ob{margin-top:6px}
.ob-lbl{font-size:9px;color:var(--muted);margin-bottom:3px}
.ob-track{height:4px;background:var(--border);border-radius:2px;overflow:hidden}
.ob-fill{height:100%;background:var(--accent);border-radius:2px}
.empty-state{text-align:center;padding:24px 12px;color:var(--muted);font-size:11px;
  opacity:.6;line-height:1.6}
/* NOIZYVOX */
.nvx-status{display:flex;align-items:center;gap:6px;padding:6px 10px;
  background:rgba(240,165,0,.05);border-bottom:1px solid rgba(240,165,0,.15);
  font-size:9.5px;color:var(--muted);flex-shrink:0}
.nvx-dot{width:6px;height:6px;border-radius:50%;background:var(--border);flex-shrink:0}
.nvx-dot.online{background:var(--nvx)}
.nvx-dot.xtts{background:var(--music)}
.nvx-form{padding:8px 10px;border-bottom:1px solid var(--border);flex-shrink:0}
.nvx-input{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:4px;
  color:var(--text);font-size:11px;padding:5px 8px;margin-bottom:4px;outline:none}
.nvx-input:focus{border-color:var(--nvx)}
.nvx-row{display:flex;gap:4px}
.nvx-btn{padding:5px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;
  color:var(--muted);font-size:9.5px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;cursor:pointer;transition:all .12s;white-space:nowrap}
.nvx-btn:hover{border-color:var(--nvx);color:var(--nvx)}
.nvx-btn.primary{border-color:var(--nvx);color:var(--nvx)}
.nvx-btn.active-voice{border-color:var(--music);color:var(--music)}
.nvx-model-card{padding:8px 10px;background:var(--surface);border:1px solid var(--border);
  border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all .15s}
.nvx-model-card:hover{border-color:var(--nvx)}
.nvx-model-card.active-voice{border-color:var(--music);background:rgba(46,204,113,.04)}
.nvx-model-header{display:flex;align-items:center;gap:6px}
.nvx-model-name{font-weight:700;font-size:12px;flex:1}
.nvx-status-badge{font-size:8.5px;padding:1px 6px;border-radius:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.nvx-status-badge.active{background:rgba(46,204,113,.15);border:1px solid rgba(46,204,113,.4);color:var(--music)}
.nvx-status-badge.training{background:rgba(240,165,0,.1);border:1px solid rgba(240,165,0,.4);color:var(--nvx)}
.nvx-status-badge.pending{background:rgba(139,148,158,.1);border:1px solid var(--border);color:var(--muted)}
.nvx-owner{font-size:10px;color:var(--muted);margin-top:2px}
.nvx-split{font-size:10px;color:var(--nvx);margin-top:3px;font-weight:700}
.nvx-actions{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.nvx-split-panel{padding:8px 10px;background:rgba(240,165,0,.04);
  border:1px solid rgba(240,165,0,.2);border-radius:6px;margin-bottom:8px}
.nvx-split-title{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--nvx);margin-bottom:6px}
.nvx-split-row{display:flex;justify-content:space-between;font-size:10.5px;
  color:var(--muted);padding:2px 0}
.nvx-split-row.total{color:var(--text);font-weight:700;border-top:1px solid var(--border);
  margin-top:4px;padding-top:6px}
.nvx-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:6px}
.nvx-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--nvx),var(--music))}
.nvx-synth-area{padding:8px 10px;border-top:1px solid var(--border);flex-shrink:0}
/* HVS */
.hvs-panel{padding:8px 10px;background:rgba(240,165,0,.03);
  border:1px solid rgba(240,165,0,.15);border-radius:8px;margin:8px 10px}
.hvs-title{font-size:9.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  color:var(--nvx);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.hvs-voice-type{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
.hvs-tag{font-size:9px;padding:2px 7px;border-radius:10px;font-weight:700;
  background:rgba(240,165,0,.1);border:1px solid rgba(240,165,0,.3);color:var(--nvx)}
.hvs-narrative{font-size:11px;line-height:1.65;color:var(--text);
  white-space:pre-wrap;border-top:1px solid rgba(240,165,0,.1);
  padding-top:8px;margin-top:4px;max-height:180px;overflow-y:auto}
.hvs-narrative::-webkit-scrollbar{width:2px}
.hvs-narrative::-webkit-scrollbar-thumb{background:rgba(240,165,0,.3)}
.hvs-health{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px}
.hvs-metric{background:var(--surface);border:1px solid var(--border);
  border-radius:5px;padding:5px 7px}
.hvs-metric-label{font-size:8.5px;color:var(--muted);font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
.hvs-metric-bar{height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:2px}
.hvs-metric-fill{height:100%;border-radius:2px;transition:width .4s ease}
.hvs-metric-fill.good{background:var(--music)}
.hvs-metric-fill.mid{background:var(--nvx)}
.hvs-metric-fill.low{background:var(--error)}
.hvs-metric-value{font-size:9px;color:var(--text);font-weight:700}
.hvs-emotion{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.hvs-emotion-bar{flex:1;min-width:52px}
.hvs-emotion-label{font-size:8.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.hvs-emotion-track{height:3px;background:var(--border);border-radius:2px;margin-top:2px;overflow:hidden}
.hvs-emotion-fill{height:100%;border-radius:2px}
.hvs-drift{padding:6px 8px;border-radius:5px;margin-bottom:8px;font-size:10px;line-height:1.5}
.hvs-drift.LOW{background:rgba(46,204,113,.08);border:1px solid rgba(46,204,113,.3);color:var(--music)}
.hvs-drift.MODERATE{background:rgba(240,165,0,.08);border:1px solid rgba(240,165,0,.3);color:var(--nvx)}
.hvs-drift.HIGH{background:rgba(248,81,73,.08);border:1px solid rgba(248,81,73,.3);color:var(--error)}
.hvs-actions{display:flex;gap:4px;margin-top:6px}
</style>
</head>
<body>
<div class="hdr">
  <div class="logo">DreamChamber</div>
  <div class="badge" id="badge">idle</div>
</div>
<div class="tabs">
  <button class="tab active" data-tab="voice"      onclick="setTab('voice')">🎙 Voice</button>
  <button class="tab"        data-tab="characters" onclick="setTab('characters')">👤 Cast</button>
  <button class="tab"        data-tab="takes"      onclick="setTab('takes')">🎬 Takes</button>
  <button class="tab"        data-tab="vault"      onclick="setTab('vault')">🔐 Vault</button>
  <button class="tab"        data-tab="noizyvox"   onclick="setTab('noizyvox')" style="color:var(--nvx)">💎 VOX</button>
</div>

<!-- VOICE -->
<div class="panel active" id="panel-voice">
  <div class="modes">
    <button class="mode-btn active" data-mode="command" onclick="setMode('command')">CMD</button>
    <button class="mode-btn" data-mode="dictate" onclick="setMode('dictate')">TYPE</button>
    <button class="mode-btn" data-mode="intake" onclick="setMode('intake')">LOG</button>
    <button class="mode-btn" data-mode="capture" onclick="setMode('capture')">CAP</button>
  </div>
  <div class="conversation" id="conversation">
    <div class="empty-state" id="emptyConv">🎙️<br>Ctrl+Shift+Space to record</div>
  </div>
  <div class="transcript-bar" id="tbar"><div class="dot"></div><span id="ttext">Listening…</span></div>
  <div class="controls">
    <button class="btn-rec" id="recBtn" onclick="post('toggleRecording')">🎙 Record</button>
    <button class="btn-sm" onclick="post('requestDirection')" title="Director notes">🎭</button>
    <button class="btn-sm" onclick="post('generateMusic')" title="Generate music bed">🎵</button>
    <button class="btn-sm" onclick="post('clearHistory')" title="Clear">✕</button>
  </div>
  <div class="music-status" id="musicStatus">🎵 <span id="musicText"></span></div>
</div>

<!-- CHARACTERS -->
<div class="panel" id="panel-characters">
  <div class="scroll" id="charList">
    <div class="empty-state">No characters yet.<br>Say "character new [name]" to create one.</div>
  </div>
</div>

<!-- TAKES -->
<div class="panel" id="panel-takes">
  <div class="scroll" id="takeList">
    <div class="empty-state">No takes yet.<br>Start a session and record.</div>
  </div>
</div>

<!-- VAULT -->
<div class="panel" id="panel-vault">
  <div class="scroll" id="vaultList">
    <div class="empty-state">🔐 Vault is empty.<br>Approve takes and export to lock them in.</div>
  </div>
</div>

<!-- NOIZYVOX — 75/25 Voice Ownership -->
<div class="panel" id="panel-noizyvox">
  <div class="nvx-status">
    <div class="nvx-dot" id="nvxApiDot"></div>
    <span id="nvxApiLabel">Platform: offline</span>
    <div class="nvx-dot" id="nvxXttsDot" style="margin-left:8px"></div>
    <span id="nvxXttsLabel">XTTS: –</span>
    <button class="nvx-btn" style="margin-left:auto;padding:2px 7px;font-size:8.5px" onclick="post('nvxRefresh')">↺</button>
  </div>

  <!-- Register form -->
  <div class="nvx-form">
    <div class="section-title" style="margin-bottom:6px">Register Voice Model — 75/25 Locked</div>
    <input class="nvx-input" id="nvxSlug"    placeholder="voice-slug (e.g. rob-voice-001)" />
    <input class="nvx-input" id="nvxName"    placeholder="Display name (e.g. Rob Plowman Voice)" />
    <input class="nvx-input" id="nvxOwner"   placeholder="Owner handle (e.g. @robplowman)" />
    <div class="nvx-row">
      <button class="nvx-btn primary" onclick="nvxRegister()" style="flex:1">+ Register</button>
      <button class="nvx-btn" onclick="setTab('voice')" style="font-size:8.5px">← Back</button>
    </div>
  </div>

  <!-- Model list -->
  <div class="scroll" id="nvxModelList">
    <div class="empty-state">💎<br>No voice models registered yet.<br>Register above to lock in your 75/25 split.</div>
  </div>

  <!-- Synthesize bar -->
  <div class="nvx-synth-area">
    <div class="section-title" style="margin-bottom:5px">Synthesize with Selected Voice</div>
    <input class="nvx-input" id="nvxSynthText" placeholder="Enter text to synthesize…" />
    <div class="nvx-row">
      <button class="nvx-btn primary" onclick="nvxSynthesize()" style="flex:1">▶ Generate</button>
      <span id="nvxSynthStatus" style="font-size:9.5px;color:var(--muted);align-self:center;padding-left:6px"></span>
    </div>
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
let streamEl = null;

function post(type, extra) { vscode.postMessage(Object.assign({type}, extra||{})); }

function setTab(tab) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id==='panel-'+tab));
  post('setTab', {tab});
}
function setMode(m) { post('setMode', {mode:m}); }

window.addEventListener('message', e => {
  const m = e.data;
  if (m.type==='state') applyState(m.state);
  else if (m.type==='mode') applyMode(m.mode);
  else if (m.type==='tab') setTab(m.tab);
  else if (m.type==='token') appendToken(m.text);
  else if (m.type==='addMessage') addMsg(m.message);
  else if (m.type==='clearMessages') clearMsgs();
  else if (m.type==='error') showErr(m.text);
  else if (m.type==='transcript') { document.getElementById('ttext').textContent=m.text||'Listening…'; }
  else if (m.type==='setCharacters') renderChars(m.characters);
  else if (m.type==='setActiveCharacter') highlightChar(m.character);
  else if (m.type==='setTakes') renderTakes(m.takes);
  else if (m.type==='takeScoredOrUpdated') updateTake(m.take);
  else if (m.type==='setVaultExports') renderVault(m.exports);
  else if (m.type==='vaultExported') addVaultCard(m.metadata);
  else if (m.type==='musicReady') {
    const s=document.getElementById('musicStatus');
    s.className='music-status vis';
    document.getElementById('musicText').textContent=m.bed.emotion+' bed ('+m.bed.durationSecs+'s)';
  }
  // NOIZYVOX
  else if (m.type==='nvxModels') renderNvxModels(m.models);
  else if (m.type==='nvxSplit') renderNvxSplit(m.summary);
  else if (m.type==='nvxStatus') applyNvxStatus(m.online, m.xttsAvailable, m.device);
  else if (m.type==='nvxBusy') {
    document.getElementById('nvxSynthStatus').textContent='⏳ '+m.operation+'…';
  }
  else if (m.type==='nvxDone') {
    document.getElementById('nvxSynthStatus').textContent='✓ '+m.message;
    setTimeout(()=>{document.getElementById('nvxSynthStatus').textContent='';},3000);
    post('nvxRefresh');
  }
  else if (m.type==='nvxHvs') renderHvs(m.report);
});

function applyState(s) {
  const b=document.getElementById('badge');
  b.className='badge '+s; b.textContent=s;
  const btn=document.getElementById('recBtn');
  btn.className='btn-rec'+(s==='recording'?' recording':'');
  btn.textContent=s==='recording'?'⏹ Stop':'🎙 Record';
  document.getElementById('tbar').className='transcript-bar'+(s==='recording'?' vis':'');
}
function applyMode(m) {
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
}
function addMsg(msg) {
  hideEmpty(); finishStream();
  const conv=document.getElementById('conversation');
  const d=document.createElement('div'); d.className='msg '+msg.role;
  if(msg.role!=='system'){
    const r=document.createElement('div'); r.className='msg-role';
    r.textContent={user:'You',assistant:'GABRIEL',director:'Director'}[msg.role]||msg.role;
    d.appendChild(r);
  }
  const b=document.createElement('div'); b.className='msg-bubble';
  if(msg.role==='assistant'||msg.role==='director'){streamEl=b;b.classList.add('streaming-cursor');}
  b.textContent=msg.text; d.appendChild(b); conv.appendChild(d);
  conv.scrollTop=conv.scrollHeight;
}
function appendToken(t) {
  if(!streamEl){
    hideEmpty();
    const conv=document.getElementById('conversation');
    const d=document.createElement('div'); d.className='msg assistant';
    const r=document.createElement('div'); r.className='msg-role'; r.textContent='GABRIEL';
    streamEl=document.createElement('div'); streamEl.className='msg-bubble streaming-cursor';
    d.appendChild(r); d.appendChild(streamEl); conv.appendChild(d);
  }
  streamEl.textContent+=t;
  document.getElementById('conversation').scrollTop=9999;
}
function finishStream(){if(streamEl){streamEl.classList.remove('streaming-cursor');streamEl=null;}}
function showErr(t){
  hideEmpty(); finishStream();
  const d=document.createElement('div'); d.className='msg system';
  const b=document.createElement('div'); b.className='msg-bubble'; b.style.color='var(--error)';
  b.textContent='⚠ '+t; d.appendChild(b);
  document.getElementById('conversation').appendChild(d);
}
function clearMsgs(){
  document.getElementById('conversation').innerHTML=
    '<div class="empty-state" id="emptyConv">🎙️<br>Ctrl+Shift+Space to record</div>';
  streamEl=null;
}
function hideEmpty(){const e=document.getElementById('emptyConv');if(e)e.remove();}

// Characters
function renderChars(chars) {
  const el=document.getElementById('charList');
  if(!chars.length){el.innerHTML='<div class="empty-state">No characters yet.</div>';return;}
  el.innerHTML='<div class="section-title">Cast — '+chars.length+'</div>';
  chars.forEach(c=>{
    const d=document.createElement('div');
    d.className='char-card'; d.id='char-'+c.id;
    d.innerHTML='<div class="char-name">'+c.name+'</div>'+
      '<div class="char-dna">'+(c.voiceFingerprint?'DNA: '+c.voiceFingerprint.hash:'No DNA yet')+'</div>'+
      '<div class="char-emotions">'+c.emotionalRange.map(e=>'<span class="emotion-tag">'+e+'</span>').join('')+'</div>'+
      '<div class="char-actions">'+
        '<button class="char-btn" onclick="post(\'selectCharacter\',{id:\''+c.id+'\'})">🎙 Select</button>'+
        '<button class="char-btn" onclick="post(\'requestDirection\')">🎭 Direct</button>'+
        '<button class="char-btn" onclick="post(\'generateMusic\')">🎵 Music</button>'+
      '</div>';
    el.appendChild(d);
  });
}
function highlightChar(c){
  document.querySelectorAll('.char-card').forEach(el=>el.classList.remove('active'));
  if(c){const el=document.getElementById('char-'+c.id);if(el)el.classList.add('active');}
}

// Takes
function renderTakes(ts){
  const el=document.getElementById('takeList');
  if(!ts.length){el.innerHTML='<div class="empty-state">No takes yet.</div>';return;}
  el.innerHTML='<div class="section-title">Session Takes — '+ts.length+'</div>';
  ts.forEach(t=>el.appendChild(mkTake(t)));
}
function updateTake(t){
  const ex=document.getElementById('take-'+t.id);
  const card=mkTake(t);
  if(ex)ex.replaceWith(card);
  else document.getElementById('takeList').appendChild(card);
}
function mkTake(t){
  const sc=t.claudeScore&&t.claudeScore.overall;
  const scClass=sc>=80?'hi':sc>=60?'mid':'lo';
  const d=document.createElement('div');
  d.id='take-'+t.id;
  d.className='take-card'+(t.vaultExported?' exported':t.approved?' approved':'');
  const acts=t.vaultExported
    ?'<span class="take-btn vaulted">🔐 Vaulted</span>'
    :t.approved
      ?'<span class="take-btn ok">✓ Approved</span>'+
       '<button class="take-btn export" onclick="post(\'exportTake\',{takeId:\''+t.id+'\',sessionId:\''+t.sessionId+'\'})">🔐 Vault</button>'
      :'<button class="take-btn approve" onclick="post(\'approveTake\',{takeId:\''+t.id+'\',sessionId:\''+t.sessionId+'\'})">✓ Approve</button>'+
       '<button class="take-btn discard" onclick="post(\'discardTake\',{takeId:\''+t.id+'\',sessionId:\''+t.sessionId+'\'})">✗</button>';
  d.innerHTML='<div class="take-header"><span class="take-emotion">'+t.emotion+'</span>'+
    (sc!=null?'<span class="take-score '+scClass+'">'+sc+'/100</span>':'<span class="take-score">unscored</span>')+
    '</div><div class="take-transcript">'+(t.transcript||'(no transcript)')+'</div>'+
    '<div class="take-actions">'+acts+'</div>';
  return d;
}

// Vault
function renderVault(exps){
  const el=document.getElementById('vaultList');
  if(!exps.length){el.innerHTML='<div class="empty-state">🔐 Vault is empty.</div>';return;}
  el.innerHTML='<div class="section-title">Vault — '+exps.length+'</div>';
  exps.forEach(e=>el.appendChild(mkVault(e)));
}
function addVaultCard(m){
  const el=document.getElementById('vaultList');
  const emp=el.querySelector('.empty-state');if(emp)emp.remove();
  el.prepend(mkVault(m));
}
function mkVault(e){
  const d=document.createElement('div'); d.className='vault-card';
  d.innerHTML='<div class="vault-id">'+e.vaultId+'</div>'+
    '<div class="vault-char">'+e.characterName+' — '+e.emotion.toUpperCase()+'</div>'+
    '<div class="vault-meta">'+e.creator+' · Score: '+(e.claudeScore||'N/A')+' · '+(e.durationMs/1000).toFixed(1)+'s</div>'+
    '<div class="ob"><div class="ob-lbl">'+e.creatorOwnership+'% creator / '+e.platformSplit+'% NOIZY — perpetual royalty</div>'+
    '<div class="ob-track"><div class="ob-fill" style="width:'+e.creatorOwnership+'%"></div></div></div>'+
    '<div class="vault-rights">'+
      '<span class="rt y">✓ Commercial</span>'+
      '<span class="rt '+(e.usageRights.syncLicensing?'y':'n')+'">'+(e.usageRights.syncLicensing?'✓':'✗')+' Sync</span>'+
      '<span class="rt '+(e.usageRights.aiTraining?'y':'n')+'">'+(e.usageRights.aiTraining?'✓':'✗')+' AI Training</span>'+
      '<span class="rt y">♾ Perpetual</span>'+
    '</div>';
  return d;
}

// ─── NOIZYVOX ─────────────────────────────────────────────────────────────
let nvxActiveSlug = '';

function applyNvxStatus(online, xttsAvailable, device) {
  const apiDot = document.getElementById('nvxApiDot');
  const xttsDot = document.getElementById('nvxXttsDot');
  apiDot.className = 'nvx-dot' + (online ? ' online' : '');
  document.getElementById('nvxApiLabel').textContent = online ? 'Platform: online' : 'Platform: offline';
  xttsDot.className = 'nvx-dot' + (xttsAvailable ? ' xtts' : '');
  document.getElementById('nvxXttsLabel').textContent = xttsAvailable ? 'XTTS: ' + device : 'XTTS: not installed';
}

function nvxRegister() {
  const slug  = document.getElementById('nvxSlug').value.trim();
  const name  = document.getElementById('nvxName').value.trim();
  const owner = document.getElementById('nvxOwner').value.trim();
  if (!slug || !name || !owner) { alert('All three fields required'); return; }
  post('nvxRegister', { slug, displayName: name, ownerHandle: owner });
  document.getElementById('nvxSlug').value = '';
  document.getElementById('nvxName').value = '';
  document.getElementById('nvxOwner').value = '';
}

function nvxSynthesize() {
  const text = document.getElementById('nvxSynthText').value.trim();
  if (!nvxActiveSlug) { alert('Select a voice model first'); return; }
  if (!text) { alert('Enter text to synthesize'); return; }
  post('nvxSynthesize', { slug: nvxActiveSlug, text });
  document.getElementById('nvxSynthText').value = '';
}

function renderNvxModels(models) {
  const el = document.getElementById('nvxModelList');
  if (!models.length) {
    el.innerHTML = '<div class="empty-state">💎<br>No voice models yet.<br>Register above to lock in your 75/25.</div>';
    return;
  }
  el.innerHTML = '<div class="section-title" style="padding:6px 10px 4px">Voice Models — ' + models.length + '</div>';
  models.forEach(m => {
    const isActive = m.slug === nvxActiveSlug;
    const d = document.createElement('div');
    d.id = 'nvx-card-' + m.slug;
    d.className = 'nvx-model-card' + (isActive ? ' active-voice' : '');
    const statusCls = m.status === 'active' ? 'active' : m.status === 'training' ? 'training' : 'pending';
    const creatorPct = Math.round(m.creator_share * 100);
    const platformPct = Math.round(m.platform_share * 100);
    d.innerHTML =
      '<div class="nvx-model-header">' +
        '<div class="nvx-model-name">' + m.display_name + '</div>' +
        '<span class="nvx-status-badge ' + statusCls + '">' + m.status + '</span>' +
      '</div>' +
      '<div class="nvx-owner">' + m.owner_handle + ' · ' + m.slug + '</div>' +
      '<div class="nvx-split">💰 ' + creatorPct + '% creator / ' + platformPct + '% NOIZY — perpetual</div>' +
      '<div class="nvx-bar"><div class="nvx-bar-fill" style="width:' + creatorPct + '%"></div></div>' +
      '<div class="nvx-actions">' +
        '<button class="nvx-btn ' + (isActive ? 'active-voice' : '') + '" onclick="nvxSelect(\'' + m.slug + '\')">' +
          (isActive ? '✓ Selected' : '🎤 Use Voice') + '</button>' +
        (m.status === 'pending' || m.status === 'training'
          ? '<button class="nvx-btn" onclick="post(\'nvxClone\',{slug:\'' + m.slug + '\'})">⚡ Clone</button>'
          : '') +
        '<button class="nvx-btn" onclick="nvxShowSplit(\'' + m.slug + '\')">📊 Splits</button>' +
        '<button class="nvx-btn" onclick="post(\'nvxGetHvs\',{slug:\'' + m.slug + '\'})">🧬 HVS</button>' +
      '</div>';
    el.appendChild(d);
  });
}

function nvxSelect(slug) {
  nvxActiveSlug = slug;
  post('nvxSelectModel', { slug });
  // Re-render active state
  document.querySelectorAll('.nvx-model-card').forEach(c => {
    const isActive = c.id === 'nvx-card-' + slug;
    c.classList.toggle('active-voice', isActive);
  });
}

function nvxShowSplit(slug) {
  post('nvxRefresh'); // triggers nvxDone → nvxSplit
}

function renderNvxSplit(s) {
  // Insert a split panel above the model list
  let panel = document.getElementById('nvx-split-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'nvx-split-panel';
    const modelList = document.getElementById('nvxModelList');
    modelList.parentNode.insertBefore(panel, modelList);
  }
  panel.className = 'nvx-split-panel';
  const credits = s.total_credits.toFixed(4);
  const creator = s.creator_total.toFixed(4);
  const platform = s.platform_total.toFixed(4);
  panel.innerHTML =
    '<div class="nvx-split-title">💎 ' + s.voice_model_slug + ' — lifetime splits</div>' +
    '<div class="nvx-split-row"><span>Uses</span><span>' + s.total_uses + '</span></div>' +
    '<div class="nvx-split-row"><span>Total seconds</span><span>' + s.total_seconds.toFixed(1) + 's</span></div>' +
    '<div class="nvx-split-row"><span>Total credits</span><span>' + credits + '</span></div>' +
    '<div class="nvx-split-row total"><span>Creator earned (75%)</span><span style="color:var(--music)">' + creator + '</span></div>' +
    '<div class="nvx-split-row total"><span>Platform (25%)</span><span style="color:var(--nvx)">' + platform + '</span></div>';
}

// ─── HVS Rendering ─────────────────────────────────────────────────────────
function renderHvs(r) {
  // Find or create HVS panel below nvxModelList
  let panel = document.getElementById('nvx-hvs-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'nvx-hvs-panel';
    panel.className = 'hvs-panel';
    const synthArea = document.querySelector('.nvx-synth-area');
    synthArea.parentNode.insertBefore(panel, synthArea);
  }

  const vt = r.voice_type || {};
  const vh = r.vocal_health || {};
  const em = r.emotion_distribution || {};
  const drift = r.drift;
  const alert = drift && drift.alert;

  // Voice type tags
  const tags = [vt.register, vt.character, vt.texture, vt.energy, vt.expressiveness]
    .filter(Boolean)
    .map(t => '<span class="hvs-tag">' + t + '</span>')
    .join('');

  // Health metrics
  const metrics = [
    { label: 'Health', val: vh.health_score || 0 },
    { label: 'Pitch', val: vh.pitch_stability || 0 },
    { label: 'Clarity', val: vh.breathiness || 0 },
    { label: 'HNR', val: vh.hnr_approx || 0 },
    { label: 'Dynamic', val: vh.dynamic_range || 0 },
    { label: 'Fresh', val: 1 - (vh.vocal_fatigue || 0) },
  ].map(m => {
    const pct = Math.round(m.val * 100);
    const cls = pct >= 70 ? 'good' : pct >= 40 ? 'mid' : 'low';
    return '<div class="hvs-metric">' +
      '<div class="hvs-metric-label">' + m.label + '</div>' +
      '<div class="hvs-metric-bar"><div class="hvs-metric-fill ' + cls + '" style="width:' + pct + '%"></div></div>' +
      '<div class="hvs-metric-value">' + pct + '%</div>' +
      '</div>';
  }).join('');

  // Emotion bars
  const emotionColors = { neutral: '#8b949e', happy: '#2ecc71', angry: '#e74c3c', sad: '#3498db' };
  const emotionBars = Object.entries(em).map(([label, val]) => {
    const pct = Math.round(val * 100);
    const color = emotionColors[label] || '#8b949e';
    return '<div class="hvs-emotion-bar">' +
      '<div class="hvs-emotion-label">' + label + ' ' + pct + '%</div>' +
      '<div class="hvs-emotion-track"><div class="hvs-emotion-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '</div>';
  }).join('');

  // Drift alert
  const driftHtml = alert
    ? '<div class="hvs-drift ' + alert.level + '">⚠ DNA Drift ' + alert.level + ' (' + (alert.score * 100).toFixed(1) + '%): ' + alert.message + '</div>'
    : '';

  // Neural embedding badge
  const neuralBadge = r.neural_embedding_available
    ? '<span class="hvs-tag" style="background:rgba(46,204,113,.1);border-color:rgba(46,204,113,.4);color:var(--music)">🧠 WavLM ' + r.neural_embedding_dim + '-dim</span>'
    : '<span class="hvs-tag" style="opacity:.5">🧠 Neural: install transformers</span>';

  // Dominant emotion badge
  const domEm = r.dominant_emotion
    ? '<span class="hvs-tag">' + r.dominant_emotion + ' dominant</span>'
    : '';

  panel.innerHTML =
    '<div class="hvs-title">🧬 Human Voice Signature — ' + r.voice_model_slug + '</div>' +
    '<div class="hvs-voice-type">' + tags + neuralBadge + domEm + '</div>' +
    (driftHtml) +
    (Object.keys(em).length ? '<div class="hvs-emotion">' + emotionBars + '</div>' : '') +
    '<div class="hvs-health">' + metrics + '</div>' +
    '<div class="hvs-actions">' +
      '<button class="nvx-btn" onclick="post(\'nvxGetHvs\',{slug:\'' + r.voice_model_slug + '\'})">↺ Refresh</button>' +
      '<button class="nvx-btn" onclick="post(\'nvxAnalyzeHvs\',{slug:\'' + r.voice_model_slug + '\'})">📁 New Samples</button>' +
      '<span style="font-size:9px;color:var(--muted);align-self:center;padding-left:6px">' + r.samples_analyzed + ' samples · ' + (new Date(r.generated_at)).toLocaleDateString() + '</span>' +
    '</div>' +
    (r.narrative ? '<div class="hvs-narrative">' + r.narrative + '</div>' : '');
}

post('ready');
</script>
</body>
</html>`;
  }
}
