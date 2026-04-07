import * as vscode from 'vscode';
import { VoicePanel } from './VoicePanel';
import { CommandRouter, VoiceMode } from './CommandRouter';

let panel: VoicePanel | undefined;
let statusBar: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  const router = new CommandRouter();

  // ─── Status Bar ────────────────────────────────────────────────────────────
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  statusBar.text = '$(unmute) NOIZY Voice';
  statusBar.tooltip = 'NOIZY Voice Input — click to open panel';
  statusBar.command = 'noizy-voice.openPanel';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // ─── Panel Factory ─────────────────────────────────────────────────────────
  function getPanel(): VoicePanel {
    if (!panel) {
      panel = new VoicePanel(context, router, statusBar);
      panel.onDispose(() => {
        panel = undefined;
        statusBar.text = '$(unmute) NOIZY Voice';
        statusBar.backgroundColor = undefined;
      });
    }
    return panel;
  }

  // ─── Commands ──────────────────────────────────────────────────────────────
  const commands = [
    // Open / reveal the voice panel
    vscode.commands.registerCommand('noizy-voice.openPanel', () => {
      getPanel().reveal();
    }),

    // Toggle recording (main hotkey: Ctrl+Shift+Space)
    vscode.commands.registerCommand('noizy-voice.toggle', () => {
      getPanel().toggleRecording();
    }),

    // Mode picker with descriptions
    vscode.commands.registerCommand('noizy-voice.setMode', async () => {
      const items = [
        {
          label: '$(edit) Dictate',
          description: 'Type at cursor position',
          detail: 'Every spoken word is typed where your cursor is',
          mode: 'dictate' as VoiceMode,
        },
        {
          label: '$(inbox) Intake',
          description: 'Capture to ideas/inbox.md',
          detail: 'Timestamped entry appended to your NOIZY inbox',
          mode: 'intake' as VoiceMode,
        },
        {
          label: '$(hubot) Command',
          description: 'Send to Claude inline chat',
          detail: 'Spoken query goes straight into Claude',
          mode: 'command' as VoiceMode,
        },
        {
          label: '$(save) Capture',
          description: 'Session capture mode',
          detail: 'Appends to inbox with session context',
          mode: 'capture' as VoiceMode,
        },
      ];

      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select NOIZY Voice mode',
        matchOnDescription: true,
      });

      if (pick) getPanel().setMode(pick.mode);
    }),

    // Quick-launch: Dictate at cursor
    vscode.commands.registerCommand('noizy-voice.dictate', () => {
      const p = getPanel();
      p.setMode('dictate');
      p.reveal();
      p.startRecording();
    }),

    // Quick-launch: Intake to inbox
    vscode.commands.registerCommand('noizy-voice.intake', () => {
      const p = getPanel();
      p.setMode('intake');
      p.reveal();
      p.startRecording();
    }),

    // Quick-launch: Ask Claude
    vscode.commands.registerCommand('noizy-voice.askClaude', () => {
      const p = getPanel();
      p.setMode('command');
      p.reveal();
      p.startRecording();
    }),
  ];

  context.subscriptions.push(...commands);
  context.subscriptions.push({ dispose: () => router.dispose() });

  // ─── Context Key ───────────────────────────────────────────────────────────
  vscode.commands.executeCommand('setContext', 'noizyVoiceActive', true);

  // ─── Config Change Listener ────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('noizyVoice') && panel) {
        panel.refreshConfig();
      }
    })
  );

  console.log('NOIZY Voice extension activated.');
}

export function deactivate(): void {
  panel?.dispose();
}
