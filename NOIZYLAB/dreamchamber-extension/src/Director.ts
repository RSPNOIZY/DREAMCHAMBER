import Anthropic from '@anthropic-ai/sdk';
import { CharacterProfile, Emotion } from './CharacterManager';
import { Take, TakeScore } from './TakeManager';

export interface DirectorNote {
  type: 'direction' | 'flag' | 'suggestion' | 'script-variation';
  content: string;
  emotion?: Emotion;
  urgency: 'low' | 'medium' | 'high';
}

export interface ScriptAnalysis {
  totalLines: number;
  characters: string[];
  emotionalArc: string;
  keyMoments: Array<{ line: string; emotion: Emotion; intensity: number }>;
  directorBrief: string;
}

export class Director {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  // ─── Performance Direction ──────────────────────────────────────────────────

  /**
   * Give real-time direction before a take.
   * Returns coaching notes streamed token by token.
   */
  async giveDirection(
    character: CharacterProfile,
    scriptLine: string,
    targetEmotion: Emotion,
    previousTakeNotes: string,
    onToken: (t: string) => void
  ): Promise<string> {
    const prompt = this.buildDirectionPrompt(
      character,
      scriptLine,
      targetEmotion,
      previousTakeNotes
    );

    return this.streamPrompt(prompt, onToken);
  }

  /**
   * Score a completed take against the character brief and target emotion.
   */
  async scoreTake(
    character: CharacterProfile,
    take: Take,
    targetEmotion: Emotion
  ): Promise<TakeScore> {
    const prompt = this.buildScoringPrompt(character, take, targetEmotion);

    let response = '';
    await this.streamPrompt(prompt, (t) => { response += t; });

    return this.parseScoringResponse(response);
  }

  /**
   * Analyze drift — does this take match the character's established DNA?
   * Returns a warning string if drift is detected, null if clean.
   */
  async detectDNADrift(
    character: CharacterProfile,
    take: Take
  ): Promise<string | null> {
    if (!character.voiceFingerprint) { return null; } // no baseline yet

    const prompt = `You are a voice director analyzing a performance take for character drift.

CHARACTER: ${character.name}
BRIEF: ${character.brief}
ESTABLISHED VOICE DNA: ${character.voiceFingerprint.pitchRange}, ${character.voiceFingerprint.toneDescriptors.join(', ')}
DIRECTOR NOTES: ${character.claudeDirectorNotes || 'none'}

TAKE TRANSCRIPT: "${take.transcript}"
TAGGED EMOTION: ${take.emotion}
DURATION: ${(take.durationMs / 1000).toFixed(1)}s

Question: Does this take drift from the established character DNA?
Answer with ONE of:
- CLEAN: [brief note]
- DRIFT: [specific drift description]
- MILD DRIFT: [what's slightly off]`;

    let response = '';
    await this.streamPrompt(prompt, (t) => { response += t; });

    if (response.toLowerCase().includes('drift:') || response.toLowerCase().includes('mild drift:')) {
      return response.replace(/^(mild )?drift:/i, '').trim();
    }
    return null;
  }

  /**
   * Generate script variations on the fly — alternate line readings.
   */
  async generateScriptVariations(
    character: CharacterProfile,
    originalLine: string,
    targetEmotion: Emotion,
    count = 3
  ): Promise<string[]> {
    const prompt = `You are a script writer generating alternate line readings.

CHARACTER: ${character.name}
BRIEF: ${character.brief}
ORIGINAL LINE: "${originalLine}"
TARGET EMOTION: ${targetEmotion}

Generate exactly ${count} alternate readings of this line that express ${targetEmotion} more intensely or from a different angle. Each on its own line, numbered. No preamble.`;

    let response = '';
    await this.streamPrompt(prompt, (t) => { response += t; });

    return response
      .split('\n')
      .filter((l) => /^\d+\./.test(l.trim()))
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .slice(0, count);
  }

  // ─── Script Analysis ────────────────────────────────────────────────────────

  /**
   * Analyze a full script before a session begins.
   */
  async analyzeScript(
    scriptText: string,
    characters: CharacterProfile[]
  ): Promise<ScriptAnalysis> {
    const characterNames = characters.map((c) => c.name).join(', ');

    const prompt = `You are a creative director analyzing a script before a voice recording session.

CHARACTERS: ${characterNames}

SCRIPT:
${scriptText.slice(0, 4000)}

Analyze this script and respond in this exact JSON format:
{
  "totalLines": <number>,
  "characters": ["name1", "name2"],
  "emotionalArc": "<1-2 sentence arc description>",
  "keyMoments": [
    {"line": "<exact line text>", "emotion": "<emotion>", "intensity": <1-10>}
  ],
  "directorBrief": "<2-3 sentence overall directing brief>"
}`;

    let response = '';
    await this.streamPrompt(prompt, (t) => { response += t; });

    try {
      const jsonMatch = response.match(/\{[\s\S]+\}/);
      if (!jsonMatch) { throw new Error('no JSON'); }
      return JSON.parse(jsonMatch[0]) as ScriptAnalysis;
    } catch {
      return {
        totalLines: 0,
        characters: characters.map((c) => c.name),
        emotionalArc: response.slice(0, 200),
        keyMoments: [],
        directorBrief: response.slice(0, 300),
      };
    }
  }

  /**
   * Update Claude's director notes for a character after a session.
   */
  async synthesizeSessionNotes(
    character: CharacterProfile,
    takes: Take[]
  ): Promise<string> {
    const takesSummary = takes
      .map((t, i) =>
        `Take ${i + 1}: emotion=${t.emotion}, score=${t.claudeScore?.overall ?? 'unscored'}, ` +
        `approved=${t.approved}, transcript="${t.transcript.slice(0, 80)}"`
      )
      .join('\n');

    const prompt = `You are a voice director synthesizing notes after a recording session.

CHARACTER: ${character.name}
BRIEF: ${character.brief}
EXISTING DIRECTOR NOTES: ${character.claudeDirectorNotes || 'none'}

SESSION TAKES:
${takesSummary}

Write updated director notes (max 3 sentences) capturing what works, what doesn't, and what to remember for next time. Focus on consistent patterns and key character insights.`;

    let notes = '';
    await this.streamPrompt(prompt, (t) => { notes += t; });
    return notes.trim();
  }

  // ─── Prompt builders ────────────────────────────────────────────────────────

  private buildDirectionPrompt(
    character: CharacterProfile,
    scriptLine: string,
    targetEmotion: Emotion,
    previousTakeNotes: string
  ): string {
    const dna = character.voiceFingerprint
      ? `Voice DNA: ${character.voiceFingerprint.pitchRange}, ${character.voiceFingerprint.toneDescriptors.join(', ')}`
      : 'No voice DNA captured yet';

    return `You are an experienced voice director giving real-time direction before a take.

CHARACTER: ${character.name}
${dna}
BRIEF: ${character.brief}
EMOTIONAL RANGE: ${character.emotionalRange.join(', ')}
${character.claudeDirectorNotes ? `DIRECTOR NOTES: ${character.claudeDirectorNotes}` : ''}

LINE TO PERFORM: "${scriptLine}"
TARGET EMOTION: ${targetEmotion}
${previousTakeNotes ? `PREVIOUS TAKE ISSUES: ${previousTakeNotes}` : ''}

Give direction in 2-3 short punchy sentences. Be specific — tell the actor exactly where to put the weight, what the character is feeling in this moment, what they want. Use the actor's physical experience, not abstract concepts. No preamble.`;
  }

  private buildScoringPrompt(
    character: CharacterProfile,
    take: Take,
    targetEmotion: Emotion
  ): string {
    const dna = character.voiceFingerprint
      ? `Voice DNA: ${character.voiceFingerprint.pitchRange}, ${character.voiceFingerprint.toneDescriptors.join(', ')}`
      : 'No fingerprint';

    return `You are a voice director scoring a performance take.

CHARACTER: ${character.name}
BRIEF: ${character.brief}
${dna}

TAKE:
- Transcript: "${take.transcript}"
- Tagged emotion: ${targetEmotion}
- Duration: ${(take.durationMs / 1000).toFixed(1)}s
- Script line: "${take.scriptLine}"

Score this take and respond in this exact JSON format:
{
  "overall": <0-100>,
  "characterConsistency": <0-100>,
  "emotionalAccuracy": <0-100>,
  "technicalQuality": <0-100>,
  "notes": "<2 sentence qualitative notes>",
  "recommendation": "<approve|retry|discard>"
}`;
  }

  private parseScoringResponse(response: string): TakeScore {
    try {
      const jsonMatch = response.match(/\{[\s\S]+\}/);
      if (!jsonMatch) { throw new Error('no JSON'); }
      const parsed = JSON.parse(jsonMatch[0]) as Omit<TakeScore, 'scoredAt'>;
      return { ...parsed, scoredAt: new Date().toISOString() };
    } catch {
      return {
        overall: 50,
        characterConsistency: 50,
        emotionalAccuracy: 50,
        technicalQuality: 50,
        notes: response.slice(0, 200),
        recommendation: 'retry',
        scoredAt: new Date().toISOString(),
      };
    }
  }

  // ─── Streaming helper ───────────────────────────────────────────────────────

  private async streamPrompt(
    prompt: string,
    onToken: (t: string) => void
  ): Promise<string> {
    let fullText = '';

    const stream = await this.client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    } as Parameters<typeof this.client.messages.stream>[0]);

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullText += event.delta.text;
        onToken(event.delta.text);
      }
    }

    return fullText;
  }
}
