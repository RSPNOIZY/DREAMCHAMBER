/**
 * DreamChamber — main extension entry point
 * Wires ActivityBar sidebar, statusbar, commands, and config watcher.
 */
import * as vscode from 'vscode';
import { DreamChamberProvider, DCMode } from './DreamChamberProvider';

let provider: DreamChamberProvider | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // ── Status bar ──────────────────────────────────────────────────────────────
  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusItem.text = '$(unmute) NOIZY';
  statusItem.tooltip = 'DreamChamber — click to toggle recording';
  statusItem.command = 'dreamchamber.toggle';
  statusItem.show();
  context.subscriptions.push(statusItem);

  // ── Provider ────────────────────────────────────────────────────────────────
  provider = new DreamChamberProvider(context, statusItem);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      DreamChamberProvider.viewId,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // ── Commands ────────────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('dreamchamber.toggle', () => {
      provider?.toggle();
    }),

    vscode.commands.registerCommand('dreamchamber.open', () => {
      vscode.commands.executeCommand('workbench.view.extension.dreamchamber');
    }),

    vscode.commands.registerCommand('dreamchamber.setMode', async () => {
      const pick = await vscode.window.showQuickPick(
        [
          { label: 'DICTATE',  description: 'Transcribe speech to cursor', mode: 'dictate' },
          { label: 'INTAKE',   description: 'Append to ideas/inbox.md',    mode: 'intake'  },
          { label: 'CLAUDE',   description: 'Chat with Claude',             mode: 'claude'  },
          { label: 'CO-WRITE', description: 'Claude with editor context',   mode: 'cowrite' },
        ],
        { placeHolder: 'Select DreamChamber mode' }
      );
      if (pick) provider?.setMode(pick.mode as DCMode);
    }),

    vscode.commands.registerCommand('dreamchamber.askClaude', async () => {
      await provider?.askClaude();
    }),

    vscode.commands.registerCommand('dreamchamber.startASR', () => {
      runTask('DreamChamber: Start ASR Server');
    }),

    vscode.commands.registerCommand('dreamchamber.startTTS', () => {
      runTask('DreamChamber: Start TTS Server');
    })
  );

  // ── Config watcher ──────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('dreamchamber')) {
        vscode.window.showInformationMessage(
          'DreamChamber: Config changed — reload window to apply.',
          'Reload'
        ).then((choice) => {
          if (choice === 'Reload') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        });
      }
    })
  );

  vscode.window.setStatusBarMessage('◈ DreamChamber activated', 3000);
}

export function deactivate(): void {
  provider?.dispose();
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function runTask(taskName: string): Promise<void> {
  const tasks = await vscode.tasks.fetchTasks();
  const task = tasks.find(t => t.name === taskName);
  if (task) {
    await vscode.tasks.executeTask(task);
  } else {
    vscode.window.showWarningMessage(`DreamChamber: Task "${taskName}" not found in tasks.json`);
  }
}
