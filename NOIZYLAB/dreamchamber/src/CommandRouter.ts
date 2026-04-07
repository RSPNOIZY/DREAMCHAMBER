/**
 * CommandRouter — named voice command dispatch for DreamChamber
 * Matches spoken text against NOIZY command patterns and routes to VSCode actions.
 */
import * as vscode from 'vscode';
import * as path from 'path';

// Forward-declare to avoid circular import
interface DreamChamberHost {
  insertAtCursor(text: string): void;
  appendToInbox(text: string): Promise<void>;
  handleClaude(text: string): Promise<void>;
  setMode(mode: 'dictate' | 'intake' | 'claude' | 'cowrite'): void;
}

interface VoiceCommand {
  patterns: RegExp[];
  handler: (host: DreamChamberHost, match: RegExpMatchArray) => Promise<void> | void;
  description: string;
}

export class CommandRouter {
  private commands: VoiceCommand[];

  constructor(private host: DreamChamberHost) {
    this.commands = this.buildCommands();
  }

  // Returns true if a command was matched and handled
  async handle(text: string): Promise<boolean> {
    const lower = text.toLowerCase().trim();
    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        const match = lower.match(pattern);
        if (match) {
          await cmd.handler(this.host, match);
          return true;
        }
      }
    }
    return false;
  }

  private buildCommands(): VoiceCommand[] {
    return [
      // ─── Mode switching ────────────────────────────────────────────────────
      {
        patterns: [/^(switch to |go to |set mode |mode )?(dictate|dictation) mode?$/],
        handler: (h) => h.setMode('dictate'),
        description: 'Switch to dictate mode',
      },
      {
        patterns: [/^(switch to |go to |set mode |mode )?intake mode?$/],
        handler: (h) => h.setMode('intake'),
        description: 'Switch to intake mode',
      },
      {
        patterns: [/^(switch to |go to |set mode |mode )?(claude|ask claude) mode?$/],
        handler: (h) => h.setMode('claude'),
        description: 'Switch to Claude mode',
      },
      {
        patterns: [/^(switch to |go to |set mode |mode )?co.?write mode?$/],
        handler: (h) => h.setMode('cowrite'),
        description: 'Switch to co-write mode',
      },

      // ─── Intake ────────────────────────────────────────────────────────────
      {
        patterns: [/^intake[:\s]+(.+)$/i, /^(save |log |capture |note )(this|that)[:\s]*(.*)$/i],
        handler: async (h, m) => {
          const content = m[1] || m[3] || 'untitled idea';
          await h.appendToInbox(content);
        },
        description: 'Save to NOIZY inbox',
      },
      {
        patterns: [/^(open |show )?inbox$/],
        handler: () => runTask('INTAKE: Open Inbox'),
        description: 'Open inbox file',
      },
      {
        patterns: [/^new session(file)?$/],
        handler: () => runTask('INTAKE: New Session File'),
        description: 'Create new session file',
      },

      // ─── GABRIEL control ───────────────────────────────────────────────────
      {
        patterns: [/^gabriel (status|check)$/],
        handler: () => runTask('GABRIEL: Status'),
        description: 'GABRIEL: Status',
      },
      {
        patterns: [/^gabriel start(server)?$/],
        handler: () => runTask('GABRIEL: Start Server'),
        description: 'GABRIEL: Start server',
      },
      {
        patterns: [/^gabriel (bridge|start bridge)$/],
        handler: () => runTask('GABRIEL: Start Bridge'),
        description: 'GABRIEL: Start bridge',
      },
      {
        patterns: [/^gabriel (stop|halt|kill)$/],
        handler: () => runTask('GABRIEL: Stop All Servers'),
        description: 'GABRIEL: Stop all servers',
      },
      {
        patterns: [/^gabriel health$/],
        handler: () => runTask('GABRIEL: Health Check'),
        description: 'GABRIEL: Health check',
      },
      {
        patterns: [/^(kill the noise|kill noise|stop everything)$/],
        handler: () => runTask('GABRIEL: Stop All Servers'),
        description: 'Kill all GABRIEL servers',
      },

      // ─── Claude inline chat prompts ────────────────────────────────────────
      {
        patterns: [/^(ask |hey )?claude[:\s]+(.+)$/i],
        handler: async (h, m) => h.handleClaude(m[2]),
        description: 'Send text to Claude',
      },
      {
        patterns: [/^(claude )?(fix|fix this|fix the bug)$/],
        handler: () => inlineChat('Fix the issue with this code'),
        description: 'Claude fix',
      },
      {
        patterns: [/^(claude )?explain(this)?$/],
        handler: () => inlineChat('Explain this code clearly and concisely'),
        description: 'Claude explain',
      },
      {
        patterns: [/^(claude )?(write |add )?test(s)?$/],
        handler: () => inlineChat('Write a pytest test for this function using arrange/act/assert'),
        description: 'Claude test',
      },
      {
        patterns: [/^(claude )?refactor(this)?$/],
        handler: () => inlineChat('Refactor this for clarity and correctness. Keep it minimal.'),
        description: 'Claude refactor',
      },
      {
        patterns: [/^(claude )?simplify$/],
        handler: () => inlineChat('Simplify this. Remove any over-engineering.'),
        description: 'Claude simplify',
      },
      {
        patterns: [/^(claude )?(add )?types?$/],
        handler: () => inlineChat('Add type hints to this function signature and return type'),
        description: 'Claude types',
      },
      {
        patterns: [/^(claude )?document(this)?$/],
        handler: () => inlineChat('Add a concise docstring to this function'),
        description: 'Claude document',
      },

      // ─── NOIZY Platform prompts ────────────────────────────────────────────
      {
        patterns: [/^nerve map$/],
        handler: () => inlineChat('Map this to the NOIZY Nerve-to-Note adaptive input engine. What biometric signals or MIDI transforms are needed?'),
        description: 'Nerve-to-Note mapping',
      },
      {
        patterns: [/^vault this$/],
        handler: () => inlineChat('Generate a Vault of Self attribution entry for this asset. Include human lineage, AI assistance percentage, and a fingerprint hash.'),
        description: 'Vault of Self entry',
      },
      {
        patterns: [/^gabriel route$/],
        handler: () => inlineChat('Scaffold this as a GABRIEL orchestration task with FastAPI router, async handler, and typed Pydantic input/output models.'),
        description: 'GABRIEL route scaffold',
      },
      {
        patterns: [/^intake spec$/],
        handler: () => inlineChat('Convert this into a full NOIZY spec document with Problem, Signal (NERVE), Solution, Components, and Acceptance Criteria.'),
        description: 'Intake spec',
      },
      {
        patterns: [/^watermark this$/],
        handler: () => inlineChat('Add adversarial spectral watermarking to this audio pipeline using the NOIZY Sovereign Creative Protocol.'),
        description: 'Watermark',
      },
      {
        patterns: [/^federate this$/],
        handler: () => inlineChat('Implement federated learning for this — raw biometric data stays on device, only learned intent is uploaded. BIPA/GDPR compliant.'),
        description: 'Federate',
      },
      {
        patterns: [/^lifeluv token$/],
        handler: () => inlineChat('Integrate LifeLUV token micro-split logic into this. Include recursive split calculation and legacy vault allocation.'),
        description: 'LifeLUV token',
      },

      // ─── System ────────────────────────────────────────────────────────────
      {
        patterns: [/^(system )?health(check)?$/],
        handler: () => runTask('NOIZY: System Health'),
        description: 'System health check',
      },
      {
        patterns: [/^morning report$/],
        handler: () => runTask('CODEMASTER: Morning Report'),
        description: 'Morning report',
      },
      {
        patterns: [/^(format|format file|format this)$/],
        handler: () => vscode.commands.executeCommand('editor.action.formatDocument'),
        description: 'Format document',
      },
      {
        patterns: [/^save all$/],
        handler: () => vscode.commands.executeCommand('workbench.action.files.saveAll'),
        description: 'Save all files',
      },
      {
        patterns: [/^(open |show )?terminal$/],
        handler: () => vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal'),
        description: 'Toggle terminal',
      },
      {
        patterns: [/^zen mode$/],
        handler: () => vscode.commands.executeCommand('workbench.action.toggleZenMode'),
        description: 'Toggle zen mode',
      },
    ];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function inlineChat(prompt: string): Promise<void> {
  await vscode.commands.executeCommand('inlineChat.start');
  await new Promise(r => setTimeout(r, 300));
  await vscode.env.clipboard.writeText(prompt);
  await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
}

async function runTask(taskName: string): Promise<void> {
  const tasks = await vscode.tasks.fetchTasks();
  const task = tasks.find(t => t.name === taskName);
  if (task) {
    await vscode.tasks.executeTask(task);
  } else {
    vscode.window.showWarningMessage(`DreamChamber: Task not found — "${taskName}"`);
  }
}
