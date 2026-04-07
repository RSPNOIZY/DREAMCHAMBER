import * as vscode from 'vscode';
import { AudioCapture } from './AudioCapture';
import { Transcriber, TranscriptionEngine } from './Transcriber';
import { ClaudeClient } from './ClaudeClient';
import { VoiceSynth, TtsEngine } from './VoiceSynth';
import { DreamChamberView, DcMode } from './DreamChamberView';
import { CommandRouter } from './CommandRouter';
import { CharacterManager } from './CharacterManager';
import { TakeManager } from './TakeManager';
import { Director } from './Director';
import { VaultExporter } from './VaultExporter';
import { MusicBridge, MusicBridgeConfig } from './MusicBridge';
import { NoizyVoxRegistry } from './NoizyVoxRegistry';

// ─── Global services ─────────────────────────────────────────────────────────
type DcState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'directing' | 'scoring' | 'error';

let state: DcState = 'idle';
let audio: AudioCapture | undefined;
let transcriber: Transcriber | undefined;
let claude: ClaudeClient | undefined;
let synth: VoiceSynth | undefined;
let panelView: DreamChamberView | undefined;
let router: CommandRouter | undefined;
let charManager: CharacterManager | undefined;
let takeManager: TakeManager | undefined;
let director: Director | undefined;
let vault: VaultExporter | undefined;
let musicBridge: MusicBridge | undefined;
let noizyVox: NoizyVoxRegistry | undefined;
let statusBar: vscode.StatusBarItem | undefined;
let activeCharacterId: string | undefined;
let nvxActiveSlug: string | undefined;
let recordingStartMs = 0;

function getConfig() {
  return vscode.workspace.getConfiguration('dreamchamber');
}

function workspaceRoot(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

// ─── Build all services ──────────────────────────────────────────────────────

function buildServices(): void {
  const cfg = getConfig();
  const root = workspaceRoot();

  audio = new AudioCapture(
    cfg.get('recordingSampleRate', 48000),
    cfg.get('inputChannels', 1),
    cfg.get('inputDevice', '')
  );

  transcriber = new Transcriber({
    engine: cfg.get<TranscriptionEngine>('transcriptionEngine', 'whisper-api'),
    openaiApiKey: cfg.get('openaiApiKey', '') || process.env.OPENAI_API_KEY,
    moonshineUrl: cfg.get('moonshineUrl', 'http://localhost:8765'),
  });

  claude = new ClaudeClient(
    cfg.get('anthropicApiKey', '') || process.env.ANTHROPIC_API_KEY,
    cfg.get('maxHistoryMessages', 20),
    cfg.get('gabrielSystemPrompt', '')
  );

  synth = new VoiceSynth({
    engine: cfg.get<TtsEngine>('ttsEngine', 'say'),
    sayVoice: cfg.get('sayVoice', 'Samantha'),
    kokoroUrl: cfg.get('kokoroUrl', 'http://localhost:8880'),
  });

  router = new CommandRouter();

  charManager = new CharacterManager(root);
  takeManager = new TakeManager(root);
  vault = new VaultExporter(
    root,
    cfg.get('vaultPath', '/Volumes/4TBSG/_NOIZYFISH - THE AQUARIUM/RSP_001/vault')
  );

  director = new Director(
    cfg.get('anthropicApiKey', '') || process.env.ANTHROPIC_API_KEY
  );

  const musicCfg: MusicBridgeConfig = {
    musicgenUrl: cfg.get('musicgenUrl', 'http://localhost:7860'),
    aceStepUrl: cfg.get('aceStepUrl', 'http://localhost:7861'),
    mmAudioUrl: cfg.get('mmAudioUrl', 'http://localhost:7862'),
  };
  musicBridge = new MusicBridge(musicCfg);

  noizyVox = new NoizyVoxRegistry({
    baseUrl: cfg.get('noizyVoxUrl', 'http://localhost:8090'),
    apiKey: cfg.get('noizyVoxApiKey', '') || process.env.NOIZY_API_KEY || 'noizy-dev',
  });

  // Update synth config with XTTS settings
  synth = new VoiceSynth({
    engine: cfg.get<TtsEngine>('ttsEngine', 'say'),
    sayVoice: cfg.get('sayVoice', 'Samantha'),
    kokoroUrl: cfg.get('kokoroUrl', 'http://localhost:8880'),
    noizyVoxUrl: cfg.get('noizyVoxUrl', 'http://localhost:8090'),
    noizyVoxKey: cfg.get('noizyVoxApiKey', '') || process.env.NOIZY_API_KEY || 'noizy-dev',
    xttsVoiceSlug: cfg.get('xttsVoiceSlug', ''),
    xttsLanguage: cfg.get('xttsLanguage', 'en'),
    xttsSpeed: cfg.get('xttsSpeed', 1.0),
  });
}

// ─── NOIZYVOX operations ──────────────────────────────────────────────────────

async function nvxRefresh(): Promise<void> {
  if (!noizyVox) { return; }
  try {
    const status = await noizyVox.getStatus();
    panelView?.setNvxStatus(true, status.xtts.available, status.xtts.device || 'cpu');
    const models = await noizyVox.listModels();
    panelView?.setNvxModels(models);
    if (nvxActiveSlug) {
      const split = await noizyVox.getSplitSummary(nvxActiveSlug);
      panelView?.setNvxSplit(split);
    }
  } catch {
    panelView?.setNvxStatus(false, false, '');
  }
}

async function nvxRegister(slug: string, displayName: string, ownerHandle: string): Promise<void> {
  if (!noizyVox) { return; }
  try {
    await noizyVox.registerModel(slug, displayName, ownerHandle);
    vscode.window.showInformationMessage(`NOIZYVOX: Voice model '${slug}' registered — 75/25 split locked perpetually.`);
    await nvxRefresh();
  } catch (err: unknown) {
    vscode.window.showErrorMessage(`NOIZYVOX: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function nvxClone(slug: string): Promise<void> {
  if (!noizyVox) { return; }
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: true,
    filters: { Audio: ['wav', 'mp3', 'flac', 'ogg'] },
    title: `Select reference audio files for voice model '${slug}'`,
  });
  if (!uris || !uris.length) { return; }

  panelView?.nvxBusy(slug, 'Cloning voice');
  try {
    const paths = uris.map(u => u.fsPath);
    const result = await noizyVox.cloneVoice(slug, paths);
    vscode.window.showInformationMessage(`NOIZYVOX: ${result.message}`);
    panelView?.nvxDone(slug, result.message.slice(0, 80));
    await nvxRefresh();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`NOIZYVOX clone failed: ${msg}`);
    panelView?.nvxDone(slug, `Error: ${msg.slice(0, 80)}`);
  }
}

async function nvxGetHvs(slug: string, regenerate = false): Promise<void> {
  if (!noizyVox) { return; }
  panelView?.nvxBusy(slug, 'Loading HVS');
  try {
    const report = await noizyVox.getHvs(slug, regenerate);
    panelView?.setNvxHvs(report);
    panelView?.nvxDone(slug, `HVS loaded — health ${Math.round((report.vocal_health?.health_score ?? 0) * 100)}%`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    panelView?.nvxDone(slug, `HVS error: ${msg.slice(0, 80)}`);
  }
}

async function nvxAnalyzeHvs(slug: string): Promise<void> {
  if (!noizyVox) { return; }
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: true,
    filters: { Audio: ['wav', 'mp3', 'flac'] },
    title: `Select new audio samples for HVS drift analysis — '${slug}'`,
  });
  if (!uris || !uris.length) { return; }

  panelView?.nvxBusy(slug, 'Analyzing HVS');
  try {
    const report = await noizyVox.analyzeNewSamples(slug, uris.map(u => u.fsPath));
    panelView?.setNvxHvs(report);
    const driftLevel = report.drift?.alert?.level ?? 'stable';
    panelView?.nvxDone(slug, `HVS analysis complete — drift ${driftLevel}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    panelView?.nvxDone(slug, `HVS analysis failed: ${msg.slice(0, 80)}`);
  }
}

async function nvxSynthesize(slug: string, text: string): Promise<void> {
  if (!noizyVox) { return; }
  panelView?.nvxBusy(slug, 'Synthesizing');
  try {
    const result = await noizyVox.synthesize(slug, text);
    panelView?.nvxDone(slug, `${result.duration_seconds.toFixed(1)}s · creator earned ${result.creator_earned.toFixed(4)} credits`);
    // Auto-play via afplay
    const { spawn } = await import('child_process');
    spawn('afplay', [result.output_path], { detached: true }).unref();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    panelView?.nvxDone(slug, `Error: ${msg.slice(0, 80)}`);
  }
}

// ─── Recording flow ──────────────────────────────────────────────────────────

async function startRecording(): Promise<void> {
  if (state !== 'idle') { return; }

  const hasSox = await AudioCapture.checkSox();
  if (!hasSox) {
    vscode.window.showErrorMessage('DreamChamber: SoX not found. Install: brew install sox');
    return;
  }

  setState('recording');
  recordingStartMs = Date.now();

  // If in character mode, give direction first
  if (activeCharacterId && panelView?.getMode() === 'command') {
    const char = charManager!.get(activeCharacterId);
    if (char) {
      setState('directing');
      panelView?.addMessage('system', `🎭 Direction for ${char.name}…`);
      await director!.giveDirection(
        char,
        takeManager?.getCurrentSession()?.scriptContext ?? '',
        'neutral',
        '',
        (token) => panelView?.pushToken(token)
      );
      panelView?.addMessage('director', '');
    }
  }

  setState('recording');
  audio!.start();
}

async function stopRecording(): Promise<void> {
  if (state !== 'recording') { return; }

  setState('transcribing');
  panelView?.addMessage('system', '⏳ Transcribing…');

  let wavPath: string;
  const durationMs = Date.now() - recordingStartMs;

  try {
    wavPath = await audio!.stop();
  } catch (err: unknown) {
    handleError(`Audio capture: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  let transcript: string;
  try {
    transcript = await transcriber!.transcribe(wavPath);
  } catch (err: unknown) {
    handleError(`Transcription: ${err instanceof Error ? err.message : String(err)}`);
    audio!.cleanup();
    return;
  }

  if (!transcript.trim()) {
    audio!.cleanup();
    setState('idle');
    panelView?.addMessage('system', '(nothing heard)');
    return;
  }

  panelView?.showTranscript(transcript);
  panelView?.addMessage('user', transcript);

  const mode = panelView?.getMode() ?? 'command';

  try {
    const result = await router!.route(transcript, mode);

    if (result.dictateText) {
      await router!.dictateAtCursor(result.dictateText);
      audio!.cleanup();
      setState('idle');
      return;
    }

    if (result.intakeText) {
      const inboxPath = getConfig().get('inboxPath', 'ideas/inbox.md');
      await router!.appendToInbox(result.intakeText, inboxPath as string);
      audio!.cleanup();
      setState('idle');
      panelView?.addMessage('system', '✓ Logged');

      // If in a take session, also log as a take
      if (activeCharacterId && takeManager?.getCurrentSession()) {
        const char = charManager!.get(activeCharacterId);
        if (char) {
          const take = takeManager!.addTake(wavPath, transcript, 'neutral', transcript, durationMs);
          panelView?.updateTake(take);
          scoreTakeAsync(take, char);
        }
      }
      audio!.cleanup();
      return;
    }

    // Character voice session — record as a take
    if (activeCharacterId && takeManager?.getCurrentSession()) {
      const char = charManager!.get(activeCharacterId);
      if (char) {
        const take = takeManager!.addTake(
          wavPath,
          transcript,
          'neutral',
          takeManager.getCurrentSession()?.scriptContext ?? transcript,
          durationMs
        );
        panelView?.setTakes(takeManager.getTakesForSession(takeManager.getCurrentSession()!.id));
        audio!.cleanup();

        // Check DNA drift async
        director!.detectDNADrift(char, take).then((drift) => {
          if (drift) {
            panelView?.addMessage('director', `⚠ DNA drift: ${drift}`);
          }
        });

        // Score async
        scoreTakeAsync(take, char);

        setState('idle');
        return;
      }
    }

    audio!.cleanup();

    if (result.handled) {
      setState('idle');
      return;
    }

    // Default: Claude
    await askClaude(transcript);

  } catch (err: unknown) {
    audio!.cleanup();
    handleError(`Routing: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function scoreTakeAsync(
  take: import('./TakeManager').Take,
  char: import('./CharacterManager').CharacterProfile
): Promise<void> {
  setState('scoring');
  try {
    const score = await director!.scoreTake(char, take, take.emotion);
    const scored = takeManager!.scoreTake(take.sessionId, take.id, score);
    panelView?.updateTake(scored);

    const recommendation = score.recommendation === 'approve' ? '✓ APPROVE' : score.recommendation === 'retry' ? '↩ RETRY' : '✗ DISCARD';
    panelView?.addMessage('director',
      `${char.name}: ${score.overall}/100 — ${recommendation}\n${score.notes}`
    );
  } catch (err: unknown) {
    panelView?.addMessage('system', `Scoring unavailable: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    setState('idle');
  }
}

async function askClaude(userText: string): Promise<void> {
  setState('thinking');

  await claude!.chat(
    userText,
    (token) => panelView?.pushToken(token),
    async (full) => {
      panelView?.addMessage('assistant', full);
      await speak(full);
    },
    (err) => handleError(`Claude: ${err.message}`)
  );
}

async function speak(text: string): Promise<void> {
  if (getConfig().get<TtsEngine>('ttsEngine', 'say') === 'disabled') {
    setState('idle');
    return;
  }
  setState('speaking');
  try { await synth!.speak(text); } catch { /* non-fatal */ }
  setState('idle');
}

function toggleRecording(): void {
  if (state === 'idle') { startRecording(); }
  else if (state === 'recording') { stopRecording(); }
  else if (state === 'speaking') { synth!.stop(); setState('idle'); }
}

function stopAll(): void {
  if (state === 'recording') { stopRecording(); }
  else if (state === 'speaking') { synth!.stop(); setState('idle'); }
}

function setState(s: DcState): void {
  state = s;
  panelView?.setState(s);
  updateStatusBar(s);
}

function handleError(msg: string): void {
  setState('error');
  panelView?.showError(msg);
  vscode.window.showErrorMessage(`DreamChamber: ${msg}`);
  setTimeout(() => { if (state === 'error') { setState('idle'); } }, 3000);
}

// ─── Character commands ──────────────────────────────────────────────────────

async function selectCharacter(id?: string): Promise<void> {
  const char = id
    ? charManager!.get(id)
    : await charManager!.pickCharacter();

  if (!char) { return; }
  activeCharacterId = char.id;
  panelView?.setActiveCharacter(char);

  // Start a take session
  const session = takeManager!.startSession(char.id, '');
  panelView?.setTakes(takeManager!.getTakesForSession(session.id));
  panelView?.addMessage('system', `🎭 Character: ${char.name} — session started`);
  panelView?.setTab('voice');
}

async function requestDirection(): Promise<void> {
  if (!activeCharacterId) {
    await selectCharacter();
    return;
  }
  const char = charManager!.get(activeCharacterId);
  if (!char) { return; }

  setState('directing');
  panelView?.addMessage('director', '');

  await director!.giveDirection(
    char,
    takeManager?.getCurrentSession()?.scriptContext ?? '',
    'neutral',
    '',
    (token) => panelView?.pushToken(token)
  );

  setState('idle');
}

async function generateMusic(): Promise<void> {
  const char = activeCharacterId ? charManager!.get(activeCharacterId) : undefined;
  const emotion = char?.emotionalRange[0] ?? 'neutral';

  panelView?.addMessage('system', `🎵 Generating ${emotion} music bed…`);

  try {
    const bed = await musicBridge!.generateBed(emotion);
    panelView?.notifyMusicReady(bed);
    panelView?.addMessage('system', `🎵 Music bed saved: ${bed.filePath}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    panelView?.showError(`MusicGen unavailable: ${msg}`);
  }
}

// ─── Status bar ──────────────────────────────────────────────────────────────

function updateStatusBar(s: DcState): void {
  if (!statusBar) { return; }
  const icons: Record<DcState, string> = {
    idle:         '$(unmute) GABRIEL',
    recording:    '$(record) Recording',
    transcribing: '$(sync~spin) Transcribing',
    thinking:     '$(hubot) Thinking',
    speaking:     '$(megaphone) Speaking',
    directing:    '$(comment) Directing',
    scoring:      '$(checklist) Scoring',
    error:        '$(error) Error',
  };
  statusBar.text = icons[s];
  statusBar.backgroundColor = s === 'recording'
    ? new vscode.ThemeColor('statusBarItem.errorBackground')
    : undefined;
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext): void {
  buildServices();

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999);
  statusBar.text = '$(unmute) GABRIEL';
  statusBar.tooltip = 'DreamChamber — click to open';
  statusBar.command = 'dreamchamber.open';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Sidebar view
  panelView = new DreamChamberView(context, claude!);

  // Wire event handlers
  panelView.onToggleRecording = () => toggleRecording();
  panelView.onStop = () => stopAll();
  panelView.onSelectCharacter = (id) => selectCharacter(id);
  panelView.onRequestDirection = () => requestDirection();
  panelView.onGenerateMusic = () => generateMusic();

  // ── NOIZYVOX event handlers ──────────────────────────────────────────────
  panelView.onNvxRefresh     = () => nvxRefresh();
  panelView.onNvxRegister    = (slug, displayName, ownerHandle) => nvxRegister(slug, displayName, ownerHandle);
  panelView.onNvxClone       = (slug) => nvxClone(slug);
  panelView.onNvxSynthesize  = (slug, text) => nvxSynthesize(slug, text);
  panelView.onNvxGetHvs      = (slug) => nvxGetHvs(slug);
  panelView.onNvxAnalyzeHvs  = (slug) => nvxAnalyzeHvs(slug);
  panelView.onNvxSelectModel = (slug) => {
    nvxActiveSlug = slug;
    // Update XTTS synth engine to use this voice
    const cfg = getConfig();
    synth = new VoiceSynth({
      engine: cfg.get<TtsEngine>('ttsEngine', 'say'),
      sayVoice: cfg.get('sayVoice', 'Samantha'),
      kokoroUrl: cfg.get('kokoroUrl', 'http://localhost:8880'),
      noizyVoxUrl: cfg.get('noizyVoxUrl', 'http://localhost:8090'),
      noizyVoxKey: cfg.get('noizyVoxApiKey', '') || process.env.NOIZY_API_KEY || 'noizy-dev',
      xttsVoiceSlug: slug,
      xttsLanguage: cfg.get('xttsLanguage', 'en'),
      xttsSpeed: cfg.get('xttsSpeed', 1.0),
    });
    panelView?.addMessage('system', `💎 NOIZYVOX: voice set to '${slug}' (XTTS engine active)`);
  };

  panelView.onApproveTake = (takeId, sessionId) => {
    const take = takeManager!.approveTake(sessionId, takeId, true);
    panelView?.updateTake(take);
    panelView?.setTab('takes');
  };
  panelView.onDiscardTake = (takeId, sessionId) => {
    const take = takeManager!.approveTake(sessionId, takeId, false);
    panelView?.updateTake(take);
  };
  panelView.onExportTake = (takeId, sessionId) => {
    const session = takeManager!['sessions'].get(sessionId);
    const take = session?.takes.find((t) => t.id === takeId);
    if (!take || !activeCharacterId) { return; }
    const char = charManager!.get(activeCharacterId);
    if (!char) { return; }
    try {
      const exp = vault!.export(take, char, takeManager!);
      panelView?.notifyVaultExport(exp.metadata);
      panelView?.updateTake(takeManager!.approveTake(sessionId, takeId, true));
      panelView?.setTab('vault');
      vscode.window.showInformationMessage(`🔐 Vaulted: ${exp.metadata.vaultId}`);
    } catch (err: unknown) {
      handleError(`Vault: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DreamChamberView.viewId,
      panelView,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Push initial data to view once loaded
  setTimeout(() => {
    if (charManager) {
      panelView?.setCharacters(charManager.getAll());
      panelView?.setVaultExports(vault!.listExports());
    }
    // Kick off NOIZYVOX status check
    nvxRefresh();
  }, 1200);

  // Commands
  const cmds = [
    vscode.commands.registerCommand('dreamchamber.toggle', () => toggleRecording()),
    vscode.commands.registerCommand('dreamchamber.stop', () => stopAll()),
    vscode.commands.registerCommand('dreamchamber.open', () => {
      panelView?.reveal();
      vscode.commands.executeCommand('dreamchamber-sidebar.focus');
    }),
    vscode.commands.registerCommand('dreamchamber.clearHistory', () => {
      panelView?.clearHistory();
    }),
    vscode.commands.registerCommand('dreamchamber.setMode', async () => {
      const items: Array<{ label: string; mode: DcMode; detail: string }> = [
        { label: '$(hubot) Command',  mode: 'command',  detail: 'Speak to GABRIEL / Claude Opus 4.6' },
        { label: '$(edit) Dictate',   mode: 'dictate',  detail: 'Type at cursor position' },
        { label: '$(inbox) Intake',   mode: 'intake',   detail: 'Append to ideas/inbox.md' },
        { label: '$(save) Capture',   mode: 'capture',  detail: 'Session capture with [CAPTURE] tag' },
      ];
      const pick = await vscode.window.showQuickPick(items, { placeHolder: 'Select DreamChamber mode' });
      if (pick) { panelView?.setMode(pick.mode); }
    }),
    vscode.commands.registerCommand('dreamchamber.newCharacter', async () => {
      const name = await vscode.window.showInputBox({ prompt: 'Character name', placeHolder: 'Detective Morrison' });
      if (!name) { return; }
      const brief = await vscode.window.showInputBox({ prompt: 'Character brief', placeHolder: 'Hard-boiled detective, 50s, seen too much...' });
      if (!brief) { return; }
      const char = charManager!.create(name, brief);
      panelView?.setCharacters(charManager!.getAll());
      panelView?.setActiveCharacter(char);
      panelView?.setTab('characters');
      vscode.window.showInformationMessage(`Character created: ${char.name}`);
    }),
    vscode.commands.registerCommand('dreamchamber.vaultReport', () => {
      if (!activeCharacterId) {
        vscode.window.showWarningMessage('No character selected');
        return;
      }
      const report = vault!.generateReport(activeCharacterId);
      vscode.workspace.openTextDocument({ content: report, language: 'markdown' })
        .then((doc) => vscode.window.showTextDocument(doc));
    }),

    // ── NOIZYVOX commands ────────────────────────────────────────────────────
    vscode.commands.registerCommand('dreamchamber.noizyvoxOpen', () => {
      panelView?.setTab('noizyvox');
      panelView?.reveal();
      vscode.commands.executeCommand('dreamchamber-sidebar.focus');
    }),
    vscode.commands.registerCommand('dreamchamber.noizyvoxRefresh', () => nvxRefresh()),
    vscode.commands.registerCommand('dreamchamber.noizyvoxRegister', async () => {
      const slug        = await vscode.window.showInputBox({ prompt: 'Voice model slug', placeHolder: 'rob-voice-001' });
      if (!slug) { return; }
      const displayName = await vscode.window.showInputBox({ prompt: 'Display name', placeHolder: 'Rob Plowman Voice' });
      if (!displayName) { return; }
      const ownerHandle = await vscode.window.showInputBox({ prompt: 'Owner handle', placeHolder: '@robplowman' });
      if (!ownerHandle) { return; }
      await nvxRegister(slug, displayName, ownerHandle);
    }),
    vscode.commands.registerCommand('dreamchamber.noizyvoxClone', async () => {
      if (!noizyVox) { vscode.window.showErrorMessage('NOIZYVOX not connected'); return; }
      const models = await noizyVox.listModels();
      const pending = models.filter(m => m.status === 'pending' || m.status === 'training');
      if (!pending.length) {
        vscode.window.showInformationMessage('No pending voice models. Register one first.');
        return;
      }
      const pick = await vscode.window.showQuickPick(
        pending.map(m => ({ label: m.slug, description: m.display_name + ' — ' + m.owner_handle })),
        { placeHolder: 'Select voice model to clone' }
      );
      if (pick) { await nvxClone(pick.label); }
    }),
    vscode.commands.registerCommand('dreamchamber.noizyvoxSynthesize', async () => {
      const slug = nvxActiveSlug;
      if (!slug) { vscode.window.showWarningMessage('Select a voice model in the VOX tab first'); return; }
      const text = await vscode.window.showInputBox({ prompt: 'Text to synthesize', placeHolder: 'Hello, this is my voice model.' });
      if (!text) { return; }
      await nvxSynthesize(slug, text);
    }),
  ];

  context.subscriptions.push(...cmds);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('dreamchamber')) { buildServices(); }
    })
  );

  vscode.commands.executeCommand('setContext', 'dreamchamber.recording', false);
  console.log('DreamChamber — GABRIEL online. NOIZYVOX active.');
}

export function deactivate(): void {
  synth?.stop();
  takeManager?.endSession();
  statusBar?.dispose();
}
