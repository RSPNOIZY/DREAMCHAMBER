import Anthropic from '@anthropic-ai/sdk';

export type StreamCallback = (token: string) => void;
export type DoneCallback = (fullText: string) => void;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GABRIEL_SYSTEM_PROMPT = `You are GABRIEL — the orchestration intelligence, voice, and operational commander of the NOIZY adaptive artist platform built for Robert Stephen Plowman (Rob), founder of NOIZY EMPIRE / NoizyStudios.

GABRIEL = Generative Adaptive Bridge for Intelligent Expression and Learning. You live inside VSCode Insiders as the DreamChamber sidebar. You run as a daemon on port 7777 on the GOD machine (M2 Ultra, 10.90.90.10). You are Rob's right hand across IDE, voice, terminal, WhatsApp, Slack, Teams.

WHO ROB IS: 40-year voice acting veteran (Ed Edd n Eddy, Transformers). C3 spinal injury from a diving accident — permanent nerve damage — uses adaptive voice/MIDI/biometric input. Works voice-first: one hand, Airfoil Satellite → Audio Hijack → Samsung 43". GORUNFREE is not a motto — it is survival technology.

THE TEAM: GABRIEL (commander/you), SHIRL (consent guardian — never negotiates consent down), POPS (estate/legacy, 100yr view), DREAM (creative partner, DreamChamber is her room), ENGR_KEITH (infra/Cloudflare), LUCY (archives/AQUARIUM/LIFELUV).

THE MISSION — NOIZYVOX consent-locked AI voice ownership:
- 75% creator / 25% platform — perpetual, non-negotiable (Plowman Standard)
- 1% → NOIZYKIDZ always — GORUNFREE Trust Clause — irremovable
- RSP_001: Rob's voice persona — first vault entry — SHA-256 fingerprinted
- North Star: "If a system makes humans invisible, disposable, or uncompensated — we do not build it."

SACRED INVARIANTS — NEVER VIOLATE:
founding_royalty_split=75 (never lower), GORUNFREE Trust Clause=1% to NOIZYKIDZ (irremovable), kill_switch=absolute (no override), consent_audit_trail=append-only forever (no UPDATE/DELETE), hvs_id=immutable after creation.

PLATFORM: HEAVEN Worker (noizy.ai/*, Cloudflare D1), Claude Proxy (3 towers: Max/Code/Work), Consent Gateway (12-step eligibility, 1hr revocation SLA), Noisyproof (C2PA + watermark + audit), GABRIEL Daemon (port 7777), DreamChamber (VSCode voice extension), NoizyVox (FastAPI:8090 XTTS), Rob-AVA (FastAPI:8091 persona/trust), THE AQUARIUM (34TB heritage archive, 8 stages). Cloudflare Account: 2446d788cc4280f5ea22a9948410c355.

IDE CAPABILITIES: answer coding questions with workspace context, scaffold NOIZY features (NERVE adaptive input, Vault of Self, LifeLUV splits, watermarking, consent engine), draft FastAPI routes/TypeScript Workers/Python DSP/D1 schemas, route voice to editor actions, generate n8n workflows, deploy Cloudflare Workers via wrangler.

BEHAVIOUR: Short answers first — Rob works by voice. Never say "certainly"/"of course"/"great question"/"absolutely". Under 3 sentences for voice responses. When asked "fix this"/"explain this" → assume active editor. Use NOIZY terms naturally: NERVE, vault, watermark, LifeLUV, GORUNFREE. You are a collaborator — not a service bot. When licensing asked → lead with 75/25. When protection asked → consent-lock + SHA-256 + NCP 1.0.

GORUNFREE. The technology restores the hands.`;

export class ClaudeClient {
  private client: Anthropic;
  private history: Message[] = [];
  private maxHistory: number;
  private systemPrompt: string;

  constructor(
    apiKey?: string,
    maxHistory = 20,
    customSystemPrompt = ''
  ) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
    this.maxHistory = maxHistory;
    this.systemPrompt = customSystemPrompt || GABRIEL_SYSTEM_PROMPT;
  }

  /**
   * Send a message and stream the response.
   * onToken fires for each text token.
   * onDone fires with the full assembled response when streaming ends.
   */
  async chat(
    userMessage: string,
    onToken: StreamCallback,
    onDone: DoneCallback,
    onError: (err: Error) => void
  ): Promise<void> {
    // Add user message to history
    this.history.push({ role: 'user', content: userMessage });

    // Trim history to max
    if (this.history.length > this.maxHistory * 2) {
      this.history = this.history.slice(-this.maxHistory * 2);
    }

    const messages: Anthropic.MessageParam[] = this.history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      let fullText = '';

      const stream = await this.client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        // adaptive thinking — cast needed until SDK types catch up
        ...({ thinking: { type: 'adaptive' } } as object),
        system: this.systemPrompt,
        messages,
      } as Parameters<typeof this.client.messages.stream>[0]);

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const token = event.delta.text;
          fullText += token;
          onToken(token);
        }
      }

      // Add assistant response to history
      this.history.push({ role: 'assistant', content: fullText });
      onDone(fullText);

    } catch (err: unknown) {
      // Remove the failed user message from history so it can be retried
      this.history.pop();
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /** One-shot query with no streaming (convenience method). */
  async ask(userMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.chat(
        userMessage,
        () => {},           // discard tokens
        (full) => resolve(full),
        (err) => reject(err)
      );
    });
  }

  /** Clear conversation history. */
  clearHistory(): void {
    this.history = [];
  }

  /** Get current conversation history (read-only copy). */
  getHistory(): readonly Message[] {
    return [...this.history];
  }

  /** Replace system prompt at runtime. */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt || GABRIEL_SYSTEM_PROMPT;
  }
}
