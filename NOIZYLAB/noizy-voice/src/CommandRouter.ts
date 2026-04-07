import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import WebSocket from "ws";

export type VoiceMode = "dictate" | "intake" | "command" | "capture";

// ── GABRIEL WebSocket Bridge ──────────────────────────────────────────────────
// Maintains a persistent connection to the GABRIEL daemon at ws://10.90.90.10:7777/voice
// Forwards all final transcripts. GABRIEL responses surface in VS Code.
class GabrielBridge {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly url: string;
  private readonly out: vscode.OutputChannel;
  private disposed = false;

  constructor(url: string, out: vscode.OutputChannel) {
    this.url = url;
    this.out = out;
    this.connect();
  }

  private connect(): void {
    if (this.disposed) return;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.on("open", () => {
        this.out.appendLine(`[GABRIEL] Connected → ${this.url}`);
        vscode.window.setStatusBarMessage("$(radio-tower) GABRIEL voice channel open", 3000);
      });

      this.ws.on("message", (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString()) as { type: string; text: string };
          if (msg.type === "gabriel" && msg.text) {
            this.out.appendLine(`[GABRIEL] ${msg.text}`);
            this.out.show(true);
            vscode.window.setStatusBarMessage(`$(hubot) ${msg.text.slice(0, 80)}`, 6000);
          }
        } catch { /* ignore malformed frames */ }
      });

      this.ws.on("close", () => {
        if (!this.disposed) {
          this.out.appendLine("[GABRIEL] Disconnected — reconnecting in 5s");
          this.reconnectTimer = setTimeout(() => this.connect(), 5000);
        }
      });

      this.ws.on("error", (e: Error) => {
        this.out.appendLine(`[GABRIEL] Socket error: ${e.message}`);
      });
    } catch (e) {
      this.out.appendLine(`[GABRIEL] Connect failed: ${(e as Error).message}`);
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  send(text: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "transcript", text }));
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

interface NoizyCommand {
  patterns: RegExp[];
  description: string;
  action: (match: RegExpMatchArray, fullText: string) => Promise<void>;
}

export class CommandRouter {
  private readonly gabriel: GabrielBridge;
  private readonly gabrielOut: vscode.OutputChannel;

  constructor() {
    this.gabrielOut = vscode.window.createOutputChannel("GABRIEL");
    const config = vscode.workspace.getConfiguration("noizyVoice");
    const gabrielUrl = config.get<string>("gabrielUrl") ?? "ws://10.90.90.10:7777/voice";
    this.gabriel = new GabrielBridge(gabrielUrl, this.gabrielOut);
  }

  dispose(): void {
    this.gabriel.dispose();
    this.gabrielOut.dispose();
  }

  // ─── Named NOIZY Commands ─────────────────────────────────────────────────
  // These trigger regardless of current mode when the phrase is spoken.
  private readonly namedCommands: NoizyCommand[] = [
    // ── Intake / Capture ──
    {
      patterns: [/^(?:intake|capture)\s+(.+)/i, /^log\s+(?:idea|note)\s+(.+)/i],
      description: "Append to NOIZY ideas inbox",
      action: async (m) => this.appendToInbox(m[1]),
    },
    {
      patterns: [/^new session$/i, /^start session$/i],
      description: "Create new timestamped session file",
      action: async () => this.runTask("INTAKE: New Session File"),
    },
    {
      patterns: [/^open inbox$/i, /^show inbox$/i],
      description: "Open ideas/inbox.md",
      action: async () => this.runTask("INTAKE: Open Inbox"),
    },

    // ── Claude / AI ──
    {
      patterns: [/^(?:ask claude|claude|ai)\s+(.+)/i],
      description: "Send to Claude inline chat",
      action: async (m) => this.openInlineChat(m[1]),
    },
    {
      patterns: [/^(?:nerve map|map nerve)$/i],
      description: "Claude: map to Nerve-to-Note engine",
      action: async () =>
        this.openInlineChatWithPrompt(
          "Map this to the Nerve-to-Note adaptive input engine. What biometric signals or MIDI transforms are needed?",
        ),
    },
    {
      patterns: [/^vault this$/i, /^vault it$/i],
      description: "Claude: generate Vault of Self attribution",
      action: async () =>
        this.openInlineChatWithPrompt(
          "Generate a Vault of Self attribution entry for this. Include human lineage, AI assistance percentage, and a fingerprint placeholder.",
        ),
    },
    {
      patterns: [/^gabriel route$/i, /^make gabriel task$/i],
      description: "Claude: scaffold GABRIEL task",
      action: async () =>
        this.openInlineChatWithPrompt(
          "Scaffold this as a GABRIEL orchestration task with async handler, trigger event, and dispatch output.",
        ),
    },
    {
      patterns: [/^intake spec$/i, /^make spec$/i],
      description: "Claude: convert to NOIZY spec",
      action: async () =>
        this.openInlineChatWithPrompt(
          "Convert this into a NOIZY spec document with Problem, Signal, Solution, Components, and Acceptance Criteria sections.",
        ),
    },

    // ── GABRIEL Control ──
    {
      patterns: [/^gabriel status$/i, /^check gabriel$/i],
      description: "GABRIEL status check",
      action: async () => this.runTask("GABRIEL: Status"),
    },
    {
      patterns: [/^gabriel start$/i, /^start gabriel$/i],
      description: "Start GABRIEL server",
      action: async () => this.runTask("GABRIEL: Start Server"),
    },
    {
      patterns: [/^gabriel stop$/i, /^stop gabriel$/i, /^kill the noise$/i],
      description: "Stop all GABRIEL/NOIZY servers",
      action: async () => this.runTask("GABRIEL: Stop All Servers"),
    },
    {
      patterns: [/^gabriel health$/i, /^gabriel check$/i],
      description: "GABRIEL health check",
      action: async () => this.runTask("GABRIEL: Health Check"),
    },

    // ── System ──
    {
      patterns: [/^system health$/i, /^noizy health$/i],
      description: "Full system health check",
      action: async () => this.runTask("NOIZY: System Health"),
    },
    {
      patterns: [/^morning report$/i],
      description: "Run morning briefing",
      action: async () => this.runShell("bash GABRIEL/AI_MORNING_NEWS.sh"),
    },

    // ── Editor / Code ──
    {
      patterns: [/^nerve\s+(.+)/i],
      description: "Insert NERVE annotation at cursor",
      action: async (m) => this.insertAtCursor(`# NERVE: ${m[1]}\n`),
    },
    {
      patterns: [/^fix this$/i, /^claude fix$/i],
      description: "Quick fix at cursor",
      action: async () =>
        vscode.commands.executeCommand("editor.action.quickFix"),
    },
    {
      patterns: [/^explain this$/i, /^claude explain$/i],
      description: "Claude: explain selected code",
      action: async () =>
        this.openInlineChatWithPrompt(
          "Explain this code clearly and concisely.",
        ),
    },
    {
      patterns: [/^(?:format|format this)$/i],
      description: "Format document",
      action: async () =>
        vscode.commands.executeCommand("editor.action.formatDocument"),
    },
    {
      patterns: [/^save$/i, /^save file$/i],
      description: "Save active file",
      action: async () =>
        vscode.commands.executeCommand("workbench.action.files.save"),
    },
    {
      patterns: [/^undo$/i],
      description: "Undo last action",
      action: async () => vscode.commands.executeCommand("undo"),
    },
    {
      patterns: [/^close panel$/i, /^close tab$/i],
      description: "Close active editor",
      action: async () =>
        vscode.commands.executeCommand("workbench.action.closeActiveEditor"),
    },
  ];

  // ─── Route a transcription ──────────────────────────────────────────────────
  async route(text: string, mode: VoiceMode, isFinal: boolean): Promise<void> {
    if (!text.trim()) return;

    // Interim: only show in dictate mode (live preview), no final action
    if (!isFinal) {
      if (mode === "dictate") {
        // Interim results handled by VoicePanel UI — no side effects yet
      }
      return;
    }

    const trimmed = text.trim();

    // Always forward final transcripts to GABRIEL — she hears everything
    this.gabriel.send(trimmed);

    // Check named commands first — always wins regardless of mode
    for (const cmd of this.namedCommands) {
      for (const pat of cmd.patterns) {
        const m = trimmed.match(pat);
        if (m) {
          await cmd.action(m, trimmed);
          vscode.window.setStatusBarMessage(`NOIZY: ${cmd.description}`, 3000);
          return;
        }
      }
    }

    // Fall through to mode-based routing
    switch (mode) {
      case "dictate":
        await this.typeAtCursor(trimmed);
        break;
      case "intake":
        await this.appendToInbox(trimmed);
        break;
      case "command":
        await this.openInlineChat(trimmed);
        break;
      case "capture":
        await this.appendToInbox(trimmed);
        break;
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  private async typeAtCursor(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage(
        "NOIZY Voice: No active editor for dictation",
      );
      return;
    }
    const config = vscode.workspace.getConfiguration("noizyVoice");
    let out = text;
    if (config.get<boolean>("autoCapitalize")) {
      out = out.charAt(0).toUpperCase() + out.slice(1);
    }
    await editor.edit((edit) => {
      for (const sel of editor.selections) {
        edit.insert(sel.active, out + " ");
      }
    });
  }

  async appendToInbox(text: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("noizyVoice");
    const inboxRel = config.get<string>("inboxPath") || "ideas/inbox.md";
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      vscode.window.showErrorMessage("NOIZY Voice: No workspace folder open");
      return;
    }
    const inboxPath = path.join(folder.uri.fsPath, inboxRel);
    // Ensure parent exists
    fs.mkdirSync(path.dirname(inboxPath), { recursive: true });
    if (!fs.existsSync(inboxPath)) {
      fs.writeFileSync(inboxPath, "# NOIZY Idea Inbox\n\n", "utf8");
    }
    const ts = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const entry = `\n## ${ts}\n${text}\n`;
    fs.appendFileSync(inboxPath, entry, "utf8");
    vscode.window.setStatusBarMessage(`NOIZY: Captured → ${inboxRel}`, 4000);
  }

  private async openInlineChat(text: string): Promise<void> {
    await this.openInlineChatWithPrompt(text);
  }

  private async openInlineChatWithPrompt(prompt: string): Promise<void> {
    await vscode.commands.executeCommand("inlineChat.start");
    await new Promise((r) => setTimeout(r, 250));
    // Preserve the user's clipboard content
    const previousClipboard = await vscode.env.clipboard.readText();
    await vscode.env.clipboard.writeText(prompt);
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    // Restore original clipboard
    await vscode.env.clipboard.writeText(previousClipboard);
  }

  private async insertAtCursor(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    await editor.edit((edit) => {
      edit.insert(editor.selection.active, text);
    });
  }

  private async runTask(label: string): Promise<void> {
    await vscode.commands.executeCommand(
      "workbench.action.tasks.runTask",
      label,
    );
  }

  private async runShell(command: string): Promise<void> {
    const terminal = vscode.window.createTerminal("NOIZY Shell");
    terminal.sendText(command);
    terminal.show(true);
  }
}
