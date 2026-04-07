import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DcMode } from './DreamChamberView';

export interface RouteResult {
  handled: boolean;       // true = named command was executed
  inlinePrompt?: string;  // prompt to inject into Claude inline chat
  dictateText?: string;   // text to type at cursor
  intakeText?: string;    // text to append to inbox
}

interface NamedCommand {
  pattern: RegExp;
  label: string;
  execute: (match: RegExpMatchArray, text: string) => Promise<RouteResult>;
}

export class CommandRouter {
  private commands: NamedCommand[];

  constructor() {
    this.commands = this.buildCommands();
  }

  /**
   * Route transcribed text based on current mode.
   * Named GABRIEL commands always take priority over mode routing.
   */
  async route(text: string, mode: DcMode): Promise<RouteResult> {
    const lower = text.toLowerCase().trim();

    // Try named commands first
    for (const cmd of this.commands) {
      const match = lower.match(cmd.pattern);
      if (match) {
        return cmd.execute(match, text);
      }
    }

    // Fall back to mode routing
    switch (mode) {
      case 'dictate':
        return { handled: true, dictateText: text };

      case 'intake':
        return { handled: true, intakeText: text };

      case 'capture':
        return { handled: true, intakeText: `[CAPTURE] ${text}` };

      case 'command':
        // Pass through to Claude (handled by extension.ts)
        return { handled: false };
    }
  }

  /** Append text to the NOIZY ideas inbox file. */
  async appendToInbox(text: string, inboxRelPath = 'ideas/inbox.md'): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders?.length) {
      throw new Error('No workspace open — cannot append to inbox');
    }

    const inboxPath = path.join(workspaceFolders[0].uri.fsPath, inboxRelPath);
    const dir = path.dirname(inboxPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const entry = `\n## ${timestamp}\n${text}\n`;

    fs.appendFileSync(inboxPath, entry, 'utf8');

    // Open in editor if not already open
    const doc = await vscode.workspace.openTextDocument(inboxPath);
    await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true });
  }

  /** Type text at the current cursor position. */
  async dictateAtCursor(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    await editor.edit((editBuilder) => {
      const position = editor.selection.active;
      editBuilder.insert(position, text + ' ');
    });
  }

  /** Open Claude inline chat with a pre-filled prompt. */
  async openInlineChatWithPrompt(prompt: string): Promise<void> {
    await vscode.commands.executeCommand('inlineChat.start');
    await new Promise((r) => setTimeout(r, 300));
    await vscode.env.clipboard.writeText(prompt);
    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
  }

  // ─── Named Commands ─────────────────────────────────────────────────────────

  private buildCommands(): NamedCommand[] {
    return [
      // ── GABRIEL control ──
      {
        label: 'gabriel status',
        pattern: /^gabriel (status|stat)$/,
        execute: async () => {
          await this.runTask('GABRIEL: Status');
          return { handled: true };
        },
      },
      {
        label: 'gabriel start',
        pattern: /^gabriel start$/,
        execute: async () => {
          await this.runTask('GABRIEL: Start Server');
          return { handled: true };
        },
      },
      {
        label: 'gabriel stop / kill the noise',
        pattern: /^(gabriel stop|kill the noise|kill noise)$/,
        execute: async () => {
          await this.runTask('GABRIEL: Stop All Servers');
          return { handled: true };
        },
      },
      {
        label: 'gabriel health',
        pattern: /^gabriel health$/,
        execute: async () => {
          await this.runTask('GABRIEL: Health Check');
          return { handled: true };
        },
      },
      {
        label: 'gabriel bridge',
        pattern: /^gabriel bridge$/,
        execute: async () => {
          await this.runTask('GABRIEL: Start Bridge');
          return { handled: true };
        },
      },

      // ── Intake / session ──
      {
        label: 'new session',
        pattern: /^new session$/,
        execute: async () => {
          await this.runTask('INTAKE: New Session File');
          return { handled: true };
        },
      },
      {
        label: 'open inbox',
        pattern: /^open (inbox|ideas)$/,
        execute: async () => {
          await this.runTask('INTAKE: Open Inbox');
          return { handled: true };
        },
      },
      {
        label: 'intake [text]',
        pattern: /^intake (.+)$/,
        execute: async (match) => {
          return { handled: true, intakeText: match[1] };
        },
      },

      // ── Claude code actions ──
      {
        label: 'fix this',
        pattern: /^(fix this|claude fix)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Fix the issue with this code');
          return { handled: true };
        },
      },
      {
        label: 'explain this',
        pattern: /^(explain this|claude explain)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Explain this code clearly and concisely');
          return { handled: true };
        },
      },
      {
        label: 'claude test',
        pattern: /^(test this|claude test)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Write a pytest test for this function using arrange/act/assert');
          return { handled: true };
        },
      },
      {
        label: 'claude refactor',
        pattern: /^(refactor this|claude refactor)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Refactor this for clarity and correctness. Keep it minimal.');
          return { handled: true };
        },
      },
      {
        label: 'claude simplify',
        pattern: /^(simplify this|claude simplify)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Simplify this. Remove any over-engineering.');
          return { handled: true };
        },
      },
      {
        label: 'claude document',
        pattern: /^(document this|claude document|add docs)$/,
        execute: async () => {
          await this.openInlineChatWithPrompt('Add a concise docstring to this function');
          return { handled: true };
        },
      },

      // ── NOIZY Platform ──
      {
        label: 'nerve map',
        pattern: /^nerve map$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Map this to the NOIZY Nerve-to-Note adaptive input engine. What biometric signals or MIDI transforms are needed?'
          );
          return { handled: true };
        },
      },
      {
        label: 'vault this',
        pattern: /^vault this$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Generate a Vault of Self attribution entry for this asset. Include human lineage, AI assistance percentage, and a fingerprint hash.'
          );
          return { handled: true };
        },
      },
      {
        label: 'gabriel route',
        pattern: /^gabriel route$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Scaffold this as a GABRIEL orchestration task with FastAPI router, async handler, and typed Pydantic input/output models.'
          );
          return { handled: true };
        },
      },
      {
        label: 'intake spec',
        pattern: /^intake spec$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Convert this into a full NOIZY spec document with Problem, Signal (NERVE), Solution, Components, and Acceptance Criteria.'
          );
          return { handled: true };
        },
      },
      {
        label: 'watermark this',
        pattern: /^watermark this$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Add adversarial spectral watermarking to this audio pipeline using the NOIZY Sovereign Creative Protocol.'
          );
          return { handled: true };
        },
      },
      {
        label: 'federate this',
        pattern: /^federate this$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Implement federated learning for this — raw biometric data stays on device, only learned intent is uploaded. BIPA/GDPR compliant.'
          );
          return { handled: true };
        },
      },
      {
        label: 'lifeluv token',
        pattern: /^lifeluv token$/,
        execute: async () => {
          await this.openInlineChatWithPrompt(
            'Integrate LifeLUV token micro-split logic into this. Include recursive split calculation and legacy vault allocation.'
          );
          return { handled: true };
        },
      },

      // ── Editor ──
      {
        label: 'save all',
        pattern: /^save (all|everything)$/,
        execute: async () => {
          await vscode.commands.executeCommand('workbench.action.files.saveAll');
          return { handled: true };
        },
      },
      {
        label: 'format file',
        pattern: /^format (file|this|document)$/,
        execute: async () => {
          await vscode.commands.executeCommand('editor.action.formatDocument');
          return { handled: true };
        },
      },
      {
        label: 'system health',
        pattern: /^system health$/,
        execute: async () => {
          await this.runTask('NOIZY: System Health');
          return { handled: true };
        },
      },
    ];
  }

  private async runTask(taskName: string): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.tasks.runTask', taskName);
  }
}
