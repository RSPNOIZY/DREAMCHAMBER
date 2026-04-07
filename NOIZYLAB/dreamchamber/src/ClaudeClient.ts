/**
 * ClaudeClient — Anthropic SDK streaming integration
 * Streams responses token-by-token, calls onToken callback for live display
 */
import * as vscode from "vscode";
import Anthropic from "@anthropic-ai/sdk";

export interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (err: Error) => void;
}

// NOIZY system prompt — the platform's creative philosophy baked in
const NOIZY_SYSTEM = `You are embedded inside NOIZY DreamChamber — Robert Plowman's adaptive creative IDE.
Robert is a musician who survived a diving accident with permanent nerve damage.
The tech restores his hands. Responses are concise, direct, and craft-focused.
You understand: Nerve-to-Note engine, Vault of Self attribution, GABRIEL orchestration, LifeLUV tokens.
When asked about code, NOIZY platform, or creative work — answer as a trusted collaborator, not a tool.`;

export class ClaudeClient {
  private client: Anthropic;
  private model: string;
  private conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  constructor() {
    this.client = new Anthropic(); // uses ANTHROPIC_API_KEY env var
    const cfg = vscode.workspace.getConfiguration("dreamchamber");
    this.model = cfg.get<string>("claudeModel") ?? "claude-sonnet-4-20250514";
  }

  // ─── Single streaming request ──────────────────────────────────────────────
  async ask(userText: string, opts: ClaudeOptions = {}): Promise<string> {
    const {
      system = NOIZY_SYSTEM,
      maxTokens = 1024,
      onToken,
      onComplete,
      onError,
    } = opts;

    // Add to conversation history
    this.conversationHistory.push({ role: "user", content: userText });

    // Keep last 10 turns to avoid token overflow
    const messages = this.conversationHistory.slice(-10);

    let fullText = "";

    try {
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: maxTokens,
        system,
        messages,
      });

      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          const token = chunk.delta.text;
          fullText += token;
          onToken?.(token);
        }
      }

      // Add assistant response to history
      this.conversationHistory.push({ role: "assistant", content: fullText });

      onComplete?.(fullText);
      return fullText;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      vscode.window.showErrorMessage(`DreamChamber Claude: ${error.message}`);
      throw error;
    }
  }

  // ─── Quick one-shot (no history) ──────────────────────────────────────────
  async quickAsk(
    userText: string,
    onToken?: (t: string) => void,
  ): Promise<string> {
    let full = "";
    try {
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: 512,
        system: NOIZY_SYSTEM,
        messages: [{ role: "user", content: userText }],
      });
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          full += chunk.delta.text;
          onToken?.(chunk.delta.text);
        }
      }
      return full;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      vscode.window.showErrorMessage(`DreamChamber quickAsk: ${error.message}`);
      throw error;
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  refreshConfig(): void {
    const cfg = vscode.workspace.getConfiguration("dreamchamber");
    this.model = cfg.get<string>("claudeModel") ?? "claude-sonnet-4-20250514";
  }
}
