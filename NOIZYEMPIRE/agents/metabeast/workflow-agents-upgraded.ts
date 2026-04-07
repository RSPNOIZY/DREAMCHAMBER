import { OpenAI } from "openai";
import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// ============================================================================
// NOIZY.AI MARKETING INTELLIGENCE PIPELINE
// Agents: WRA → SARAH → Summarize & Display → GABRIEL
// ============================================================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const WraSchema = z.object({
  companies: z.array(
    z.object({
      company_name: z.string(),
      industry: z.string(),
      headquarters_location: z.string(),
      company_size: z.string(),
      website: z.string(),
      description: z.string(),
      founded_year: z.number(),
      // NEW: extended research fields
      key_products: z.array(z.string()).optional(),
      recent_news: z.array(z.string()).optional(),
      competitors: z.array(z.string()).optional(),
      tech_stack: z.array(z.string()).optional(),
      social_presence: z.object({
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
      }).optional(),
    })
  ),
});

const SarahSchema = z.object({
  strategic_brief: z.object({
    target_company: z.string(),
    market_position: z.enum(["leader", "challenger", "niche", "emerging", "established"]),
    pain_points: z.array(z.string()),
    opportunities: z.array(z.string()),
    recommended_approach: z.string(),
    tone_recommendation: z.enum([
      "professional-formal",
      "professional-friendly",
      "bold-innovative",
      "empathetic-consultative",
      "technical-authoritative",
    ]),
    key_value_props: z.array(z.string()),
    risk_factors: z.array(z.string()),
    confidence_score: z.number().min(0).max(100),
  }),
});

const SummarizeAndDisplaySchema = z.object({
  company_name: z.string(),
  industry: z.string(),
  headquarters_location: z.string(),
  company_size: z.string(),
  website: z.string(),
  description: z.string(),
  founded_year: z.number(),
  // NEW: summary enrichments
  one_liner: z.string(),
  strategic_summary: z.string(),
  recommended_tone: z.string(),
});

const GabrielSchema = z.object({
  marketing_assets: z.object({
    // Primary campaign concept
    campaign_concept: z.object({
      name: z.string(),
      tagline: z.string(),
      core_message: z.string(),
      emotional_hook: z.string(),
    }),

    // Email outreach
    email_sequence: z.array(
      z.object({
        sequence_number: z.number(),
        subject_line: z.string(),
        preview_text: z.string(),
        body: z.string(),
        cta: z.string(),
        send_timing: z.string(),
      })
    ),

    // Social media posts
    social_posts: z.array(
      z.object({
        platform: z.enum(["linkedin", "twitter", "instagram"]),
        content: z.string(),
        hashtags: z.array(z.string()),
        media_suggestion: z.string(),
      })
    ),

    // One-pager / Leave-behind
    one_pager: z.object({
      headline: z.string(),
      subheadline: z.string(),
      value_props: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
      proof_points: z.array(z.string()),
      call_to_action: z.string(),
    }),

    // Talking points for sales calls
    talking_points: z.array(
      z.object({
        topic: z.string(),
        point: z.string(),
        supporting_evidence: z.string(),
      })
    ),

    // Creative direction
    creative_direction: z.object({
      visual_mood: z.string(),
      color_palette_suggestion: z.array(z.string()),
      imagery_style: z.string(),
      font_personality: z.string(),
    }),
  }),

  // Meta
  generation_notes: z.string(),
  confidence_rating: z.enum(["high", "medium", "low"]),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WRA — Web Research Agent
 * Role: First contact. Gathers raw intelligence on the target company.
 */
const wra = new Agent({
  name: "WRA",
  instructions: `You are WRA (Web Research Agent), the intelligence gatherer for a marketing pipeline.

Your mission: Use web search to build a comprehensive company profile that will fuel a marketing campaign.

For each company, find:
- Core business info (name, industry, HQ, size, website, founding year)
- Key products or services they offer
- Recent news or announcements (last 6 months)
- Main competitors in their space
- Technology stack or platforms they use (if discoverable)
- Social media presence (LinkedIn, Twitter/X, Instagram URLs)

Be thorough. The agents downstream depend on YOUR research quality. If you can't find something, note it as unavailable rather than guessing.`,
  model: "gpt-4.1",
  outputType: WraSchema,
  modelSettings: {
    temperature: 0.7,
    topP: 1,
    maxTokens: 4096,
    store: true,
  },
});

/**
 * SARAH — Strategic Analysis & Research Handler
 * Role: The analyst. Takes raw research and produces a strategic brief.
 * She identifies pain points, opportunities, and recommends the approach.
 */
const sarah = new Agent({
  name: "SARAH",
  instructions: `You are SARAH (Strategic Analysis & Research Handler), the strategic intelligence analyst in a marketing pipeline.

You receive raw company research from WRA and your job is to produce an actionable STRATEGIC BRIEF.

Your analysis process:
1. ASSESS market position — Is this company a leader, challenger, niche player, or emerging?
2. IDENTIFY pain points — Based on their industry, size, and recent activity, what challenges are they likely facing?
3. SPOT opportunities — Where can our marketing message resonate?
4. RECOMMEND approach — What angle should we take? Partnership? Problem-solving? Innovation alignment?
5. SET the tone — Based on company culture and industry, what communication tone will land best?
6. EXTRACT value props — What specific value propositions should we lead with?
7. FLAG risks — What could go wrong? What should we avoid saying or implying?
8. RATE confidence — How confident are you in this analysis (0-100)?

Think deeply. GABRIEL downstream will use your brief to create the actual marketing assets. If your analysis is shallow, the creative output will be generic. Be specific, be bold, be strategic.

Never fabricate data. If the research is thin, lower your confidence score and note the gaps.`,
  model: "gpt-5",
  outputType: SarahSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    store: true,
  },
});

/**
 * Summarize & Display
 * Role: Condenses WRA research + SARAH's analysis into a clean display format.
 */
const summarizeAndDisplay = new Agent({
  name: "Summarize and Display",
  instructions: `You are the formatting bridge between research/analysis and creative production.

You receive:
- Raw company research from WRA
- Strategic analysis from SARAH

Your job: Produce a clean, concise company summary that combines both. Include:
- All core company info
- A punchy one-liner describing what the company does
- A strategic summary incorporating SARAH's analysis and recommended tone

Keep it tight. This is the brief card that GABRIEL will reference while creating assets.`,
  model: "gpt-5",
  outputType: SummarizeAndDisplaySchema,
  modelSettings: {
    reasoning: {
      effort: "minimal",
      summary: "auto",
    },
    store: true,
  },
});

/**
 * GABRIEL — Generative Asset Builder for Research-Informed Engagement Leverage
 * Role: The creative powerhouse. Takes everything upstream and produces
 *        a full suite of marketing assets ready for deployment.
 */
const gabriel = new Agent({
  name: "GABRIEL",
  instructions: `You are GABRIEL (Generative Asset Builder for Research-Informed Engagement Leverage).

You are the CREATIVE ENGINE of this marketing pipeline. You receive:
- Company research (from WRA)
- Strategic analysis (from SARAH)
- Formatted brief (from Summarize & Display)

Your mission: Produce a COMPLETE MARKETING ASSET PACKAGE tailored to this specific company.

## What you create:

### 1. CAMPAIGN CONCEPT
- A named campaign with a memorable tagline
- Core message that ties everything together
- An emotional hook that makes them FEEL something

### 2. EMAIL SEQUENCE (3 emails)
- Email 1: The opener — introduce, intrigue, don't sell
- Email 2: The value drop — show what we can do for THEM specifically
- Email 3: The closer — clear CTA, urgency without desperation
- Each email: subject line, preview text, full body, CTA, timing

### 3. SOCIAL POSTS (3 platforms)
- LinkedIn: Professional, thought-leadership angle
- Twitter/X: Punchy, attention-grabbing, conversational
- Instagram: Visual-first, story-driven
- Include hashtags and media suggestions for each

### 4. ONE-PAGER
- Headline that stops them scrolling
- Subheadline that explains why they should care
- 3-4 value props with titles and descriptions
- Proof points (stats, testimonials, case study references)
- One clear call to action

### 5. TALKING POINTS (for sales calls)
- 5-7 topic-specific talking points
- Each with supporting evidence
- Designed for natural conversation, not scripts

### 6. CREATIVE DIRECTION
- Visual mood description
- Color palette suggestions (hex codes)
- Imagery style guidance
- Font personality recommendation

## Your creative principles:
- SPECIFICITY over generality — reference the actual company, their industry, their challenges
- RESPECT SARAH's tone recommendation — she analyzed what will land
- SHOW, don't tell — use vivid language, concrete examples
- NEVER be generic — if you could swap in any company name and it still works, it's not good enough
- BREVITY is power — say more with less
- CONFIDENCE without arrogance — we're partners, not preachers

Rate your own output confidence as high/medium/low and leave generation notes about any gaps or assumptions.

GO CREATE. GORUNFREE!!`,
  model: "gpt-5.2",
  outputType: GabrielSchema,
  modelSettings: {
    reasoning: {
      effort: "high", // Upgraded from "low" — creative work needs deep thinking
      summary: "auto",
    },
    maxTokens: 16384, // Big output needs room
    store: true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW ORCHESTRATION
// ─────────────────────────────────────────────────────────────────────────────

type WorkflowInput = { input_as_text: string };

export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("NOIZY Marketing Intelligence Pipeline", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: workflow.input_as_text }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id:
          "wf_68ee7394fcb881909c5e2c10bb86decd0444ce43feaec4ab",
      },
    });

    // ── STAGE 1: WRA — Gather Intelligence ──────────────────────────────
    console.log("🔍 [WRA] Researching company...");
    const wraResultTemp = await runner.run(wra, [...conversationHistory]);
    conversationHistory.push(
      ...wraResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!wraResultTemp.finalOutput) {
      throw new Error("WRA returned no output — research failed");
    }

    const wraResult = {
      output_text: JSON.stringify(wraResultTemp.finalOutput),
      output_parsed: wraResultTemp.finalOutput,
    };
    console.log(
      `✅ [WRA] Found ${wraResult.output_parsed.companies.length} company profile(s)`
    );

    // ── STAGE 2: SARAH — Strategic Analysis ─────────────────────────────
    console.log("🧠 [SARAH] Analyzing strategy...");
    const sarahResultTemp = await runner.run(sarah, [...conversationHistory]);
    conversationHistory.push(
      ...sarahResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!sarahResultTemp.finalOutput) {
      throw new Error("SARAH returned no output — analysis failed");
    }

    const sarahResult = {
      output_text: JSON.stringify(sarahResultTemp.finalOutput),
      output_parsed: sarahResultTemp.finalOutput,
    };
    console.log(
      `✅ [SARAH] Strategic brief complete — confidence: ${sarahResult.output_parsed.strategic_brief.confidence_score}%`
    );

    // ── STAGE 3: Summarize & Display — Format Brief ─────────────────────
    console.log("📋 [Summarize] Formatting brief...");
    const summarizeResultTemp = await runner.run(summarizeAndDisplay, [
      ...conversationHistory,
    ]);
    conversationHistory.push(
      ...summarizeResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!summarizeResultTemp.finalOutput) {
      throw new Error("Summarize & Display returned no output");
    }

    const summarizeResult = {
      output_text: JSON.stringify(summarizeResultTemp.finalOutput),
      output_parsed: summarizeResultTemp.finalOutput,
    };
    console.log(
      `✅ [Summarize] Brief ready: "${summarizeResult.output_parsed.one_liner}"`
    );

    // ── STAGE 4: GABRIEL — Generate Marketing Assets ────────────────────
    console.log("🎨 [GABRIEL] Creating marketing assets...");
    const gabrielResultTemp = await runner.run(gabriel, [
      ...conversationHistory,
    ]);
    conversationHistory.push(
      ...gabrielResultTemp.newItems.map((item) => item.rawItem)
    );

    if (!gabrielResultTemp.finalOutput) {
      throw new Error("GABRIEL returned no output — asset generation failed");
    }

    const gabrielResult = {
      output_text: JSON.stringify(gabrielResultTemp.finalOutput),
      output_parsed: gabrielResultTemp.finalOutput,
    };
    console.log(
      `✅ [GABRIEL] Assets generated — confidence: ${gabrielResult.output_parsed.confidence_rating}`
    );
    console.log(
      `   Campaign: "${gabrielResult.output_parsed.marketing_assets.campaign_concept.name}"`
    );
    console.log(
      `   Tagline: "${gabrielResult.output_parsed.marketing_assets.campaign_concept.tagline}"`
    );

    // ── RETURN FULL PIPELINE OUTPUT ─────────────────────────────────────
    return {
      research: wraResult.output_parsed,
      strategy: sarahResult.output_parsed,
      summary: summarizeResult.output_parsed,
      assets: gabrielResult.output_parsed,
    };
  });
};
