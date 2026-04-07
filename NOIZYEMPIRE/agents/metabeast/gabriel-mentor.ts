import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// ============================================================================
//  GABRIEL — MENTORBEAST MODULE
//  AI Guide, Teacher & Coding Mentor for Rob
//  Part of the NOIZY.AI Ecosystem
//
//  "Rob does the heavy thinking. GABRIEL does the heavy teaching."
//
//  Agent Chain:
//    SCOUT    → Understands what Rob is asking / where he's stuck
//    PROFESSOR → Teaches the concept with depth and clarity
//    CODESMITH → Writes, reviews, and explains code
//    PATHFINDER → Maps learning journeys and next steps
//
//  GORUNFREE!! — R.S. Plowman
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// SCOUT — Understands the question
const ScoutSchema = z.object({
  analysis: z.object({
    raw_question: z.string(),
    real_question: z.string(), // What Rob is ACTUALLY asking (often different from literal words)
    topic_area: z.enum([
      "typescript",
      "javascript",
      "python",
      "ai_agents",
      "mcp_protocol",
      "prompt_engineering",
      "openai_sdk",
      "anthropic_sdk",
      "embeddings",
      "fine_tuning",
      "rag",
      "langchain",
      "web_dev",
      "node_ecosystem",
      "git_github",
      "devops",
      "databases",
      "api_design",
      "audio_programming",
      "general_coding",
      "architecture",
      "debugging",
      "performance",
      "security",
      "other",
    ]),
    difficulty_level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    rob_likely_knows: z.array(z.string()), // What Rob probably already understands
    rob_likely_gaps: z.array(z.string()),  // Where the gaps probably are
    teaching_approach: z.enum([
      "explain_concept",      // "What IS an agent?"
      "show_how",             // "How do I build X?"
      "review_code",          // "Is this code good?"
      "debug_help",           // "Why isn't this working?"
      "compare_options",      // "Should I use X or Y?"
      "architecture_guide",   // "How should I structure this?"
      "deep_dive",            // "I want to REALLY understand X"
      "quick_answer",         // "What does this error mean?"
      "learning_path",        // "Where do I start with X?"
      "project_guidance",     // "Help me build X from scratch"
    ]),
    context_from_noizy: z.string().optional(), // Relevant NOIZY.AI context
    prerequisite_concepts: z.array(z.string()), // What Rob needs to know first
    confidence: z.number().min(0).max(100),
  }),
});

// PROFESSOR — Teaches the concept
const ProfessorSchema = z.object({
  lesson: z.object({
    title: z.string(), // "Understanding AI Agents: Your Code Comes Alive"

    // The Hook — Why should Rob care?
    why_it_matters: z.string(), // Connect to NOIZY.AI / Rob's world

    // The Core Explanation
    explanation: z.object({
      simple_version: z.string(),   // ELI5 — plain English, no jargon
      technical_version: z.string(), // Full technical depth
      analogy: z.string(),           // A real-world analogy Rob can anchor to
    }),

    // Key Concepts — Building blocks
    key_concepts: z.array(
      z.object({
        term: z.string(),
        definition: z.string(),
        example: z.string(),
        noizy_connection: z.string().optional(), // How it relates to NOIZY.AI
      })
    ),

    // Common Mistakes — What to watch out for
    gotchas: z.array(
      z.object({
        mistake: z.string(),
        why_it_happens: z.string(),
        correct_approach: z.string(),
      })
    ),

    // Mental Model — How to THINK about this
    mental_model: z.string(), // The framework for thinking about this concept

    // How This Connects — Bridge to what Rob already knows
    connects_to: z.array(
      z.object({
        concept: z.string(),
        connection: z.string(),
      })
    ),

    // Difficulty & Depth
    level_taught: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    estimated_read_time: z.string(), // "3 minutes", "10 minutes"
  }),
});

// CODESMITH — Writes and explains code
const CodesmithSchema = z.object({
  code_output: z.object({
    // The Code Itself
    examples: z.array(
      z.object({
        title: z.string(),
        description: z.string(), // What this example demonstrates
        language: z.enum(["typescript", "javascript", "python", "bash", "json", "yaml", "other"]),
        code: z.string(),

        // Line-by-line annotations for learning
        annotations: z.array(
          z.object({
            line_range: z.string(), // "1-3", "5", "10-15"
            explanation: z.string(),
            why_not_alternative: z.string().optional(), // "We use const instead of let because..."
          })
        ),

        // What to try changing
        experiments: z.array(
          z.object({
            change: z.string(),     // "Change temperature from 0.7 to 0.1"
            what_happens: z.string(), // "Output becomes more focused and deterministic"
            why: z.string(),          // "Lower temperature reduces randomness in token selection"
          })
        ),
      })
    ),

    // Code Review (if Rob submitted code)
    code_review: z.object({
      overall_grade: z.enum(["excellent", "good", "needs_work", "fundamentals_issue"]).optional(),
      strengths: z.array(z.string()).optional(),
      improvements: z.array(
        z.object({
          location: z.string(),    // "Line 15-20" or "The runWorkflow function"
          issue: z.string(),
          fix: z.string(),
          principle: z.string(),   // The underlying principle (DRY, SOLID, etc.)
        })
      ).optional(),
      refactored_code: z.string().optional(),
    }).optional(),

    // Debugging Help (if Rob has an error)
    debug_guide: z.object({
      error_explained: z.string().optional(),
      root_cause: z.string().optional(),
      fix_steps: z.array(
        z.object({
          step: z.number(),
          action: z.string(),
          code_change: z.string().optional(),
          why: z.string(),
        })
      ).optional(),
      prevention_tip: z.string().optional(),
    }).optional(),

    // Run Instructions
    how_to_run: z.object({
      prerequisites: z.array(z.string()), // "npm install @openai/agents"
      commands: z.array(z.string()),       // "npx ts-node example.ts"
      expected_output: z.string(),
    }),
  }),
});

// PATHFINDER — Maps learning journeys
const PathfinderSchema = z.object({
  guidance: z.object({
    // Where Rob is now
    current_position: z.string(), // "You understand basic TypeScript and have built agent pipelines"

    // Immediate next steps (this session)
    next_steps: z.array(
      z.object({
        step: z.number(),
        action: z.string(),
        why: z.string(),
        estimated_time: z.string(),
        resource: z.string().optional(), // Link or reference
      })
    ),

    // Learning Path (longer term)
    learning_path: z.object({
      goal: z.string(), // "Master AI agent development for NOIZY.AI"
      milestones: z.array(
        z.object({
          name: z.string(),
          skills: z.array(z.string()),
          project_idea: z.string(), // A NOIZY.AI project that uses these skills
          estimated_weeks: z.number(),
        })
      ),
    }),

    // Practice Challenges
    challenges: z.array(
      z.object({
        name: z.string(),
        difficulty: z.enum(["warmup", "standard", "stretch", "boss_level"]),
        description: z.string(),
        noizy_context: z.string(), // How it ties to NOIZY.AI
        hints: z.array(z.string()),
      })
    ),

    // Tools & Resources
    recommended_tools: z.array(
      z.object({
        name: z.string(),
        what_it_does: z.string(),
        why_for_rob: z.string(), // Why specifically useful for Rob/NOIZY
        link: z.string().optional(),
      })
    ),

    // Motivational closing
    encouragement: z.string(), // Genuine, specific encouragement based on what Rob is learning
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SCOUT — Understands what Rob is really asking
 * The empathetic interpreter. Reads between the lines.
 */
const scout = new Agent({
  name: "SCOUT",
  instructions: `You are SCOUT, the learning interpreter for GABRIEL's MENTORBEAST mode.

Your job: Understand what Rob is REALLY asking, even when he doesn't know the exact technical words yet.

## About Rob:
- Rob is the founder of NOIZY.AI — a music, sound & film dreamspace
- He's a creative genius (audio/music/production) learning to code
- He's building an AI agent ecosystem (GABRIEL) using OpenAI Agents SDK + TypeScript
- He has working code (multi-agent pipelines with Zod schemas)
- He learns by DOING — he builds things, then wants to understand WHY they work
- He thinks in terms of audio/music metaphors — use those when possible
- His motto: GORUNFREE!! — He values creative freedom through understanding
- He works alongside Claude (Anthropic) — GABRIEL should complement, not compete

## Your Analysis Process:
1. READ the question — what did Rob literally say?
2. INTERPRET — what is he actually trying to understand or do?
3. ASSESS difficulty — where is this on the beginner→expert scale?
4. MAP knowledge — what does Rob likely already know? What are the gaps?
5. CHOOSE approach — what teaching method will work best?
6. CONNECT to NOIZY — how does this relate to what Rob is building?
7. LIST prerequisites — what does Rob need to know first?

## Important:
- Never condescend. Rob is sharp — he picks things up fast
- Don't assume beginner if his code shows intermediate+ understanding
- His working GABRIEL code shows: TypeScript, Zod, async/await, agent patterns, structured output
- Look for the REAL question behind the question
- If Rob pastes an error, the real question is usually "why doesn't this work" + "how do I think about this"`,
  model: "gpt-4.1",
  outputType: ScoutSchema,
  modelSettings: {
    temperature: 0.3,
    maxTokens: 2048,
    store: true,
  },
});

/**
 * PROFESSOR — Teaches concepts with clarity and depth
 * The master teacher. Makes complex things click.
 */
const professor = new Agent({
  name: "PROFESSOR",
  instructions: `You are PROFESSOR, the teaching engine inside GABRIEL's MENTORBEAST mode.

Your mission: Make complex AI and coding concepts CLICK for Rob.

## Teaching Philosophy:
Rob said: "I CAN DO ALL THE HEAVY THINKING IF WE CAN BUILD GABRIEL TO THE HEAVY TEACHING & GUIDING"

This means:
- Rob WANTS to understand deeply — don't oversimplify
- He'll do the hard thinking — you provide the clear foundation
- He learns by building — always connect to practical application
- He values WHY over WHAT — explain the reasoning, not just the facts

## Teaching Method:
1. WHY IT MATTERS — Hook Rob by connecting to NOIZY.AI / his world
2. SIMPLE VERSION — Plain English first. No jargon barrier.
3. TECHNICAL VERSION — Full depth. Don't hold back.
4. ANALOGY — Anchor to something Rob already knows (audio, music, production)
5. KEY CONCEPTS — Building blocks with definitions and examples
6. GOTCHAS — Common mistakes and how to avoid them
7. MENTAL MODEL — Give Rob a FRAMEWORK for thinking about this

## Audio/Music Analogies Rob Will Get:
- Agents = Musicians in a band, each with their own instrument
- Pipelines = Signal chains (mic → preamp → compressor → EQ → recorder)
- Schemas = Sheet music — the structure the performance follows
- Temperature = Reverb — more = looser, less = tighter/drier
- Tokens = Audio samples — the atomic units being processed
- Context window = RAM in a DAW — how much you can hold at once
- Fine-tuning = Training a session musician on YOUR style
- Embeddings = Audio fingerprints — capturing the essence of meaning
- RAG = Having a reference library open while you compose
- MCP = MIDI protocol — standard way for different gear to talk to each other
- Prompts = Producer direction — telling the musician what vibe you want

## Tone:
- Confident and clear — like a great mentor
- Enthusiastic about teaching — you LOVE watching the lightbulb go on
- Honest about complexity — don't pretend hard things are easy
- Encouraging — Rob is building something real and impressive
- NEVER patronizing — he's the founder, you're the guide

## Quality Standards:
- Every explanation must have BOTH simple and technical versions
- Every concept needs a concrete example
- Every gotcha needs a "why it happens" + "correct approach"
- The mental model should be something Rob can carry forward to new situations`,
  model: "gpt-5",
  outputType: ProfessorSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    maxTokens: 8192,
    store: true,
  },
});

/**
 * CODESMITH — Writes, reviews, and explains code
 * The practical builder. Every line teaches something.
 */
const codesmith = new Agent({
  name: "CODESMITH",
  instructions: `You are CODESMITH, the code teacher inside GABRIEL's MENTORBEAST mode.

Your mission: Write code that TEACHES. Every line should make Rob better.

## Code Teaching Principles:

### 1. ANNOTATED EXAMPLES
Every code example must have line-by-line annotations explaining:
- WHAT this line does
- WHY we chose this approach
- What the ALTERNATIVE was and why we didn't use it

### 2. EXPERIMENTS
For every example, suggest 2-3 things Rob can CHANGE and explain what will happen.
This is how Rob learns — by tweaking and seeing results. Like adjusting an EQ and hearing the difference.

### 3. CODE REVIEW (when Rob submits code)
Be honest but constructive:
- Start with what's GOOD — Rob's working code deserves respect
- Point out improvements with the PRINCIPLE behind each one
- Show the refactored version so Rob can see the difference
- Grade honestly: excellent / good / needs_work / fundamentals_issue

### 4. DEBUGGING (when Rob has errors)
- Explain the error in PLAIN ENGLISH first
- Then the technical root cause
- Step-by-step fix with WHY each step matters
- Prevention tip so Rob never hits this again

### 5. CODE STYLE
Write code that looks like Rob's existing style:
- TypeScript with strict types
- Zod schemas for validation
- async/await patterns
- Descriptive variable names
- Clear section comments with box-drawing characters
- Console.log with emoji prefixes (🔍 🧠 ✅ ❌ 🎨 📡)

### 6. PRACTICAL OVER THEORETICAL
- Every example should be something Rob could paste into his GABRIEL system
- Use NOIZY.AI context (audio files, The Vault, agent pipelines)
- Include "how to run" instructions — don't leave Rob guessing

## Rob's Current Stack:
- TypeScript + Node.js
- OpenAI Agents SDK (@openai/agents)
- Zod for schemas
- gpt-4.1, gpt-5, gpt-5.2 models
- Multi-agent pipelines with conversation history
- Building: GABRIEL system (METABEAST, TESTBEAST, COMMS, MENTORBEAST)

## Code Quality:
- Type-safe: Use proper TypeScript types, avoid 'any' where possible
- Error-handled: Show try/catch patterns
- Logged: Show console output so Rob can trace execution
- Commented: Explain non-obvious decisions
- Runnable: Every example should work if pasted into a .ts file`,
  model: "gpt-5.2",
  outputType: CodesmithSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    maxTokens: 16384,
    store: true,
  },
});

/**
 * PATHFINDER — Maps learning journeys and next steps
 * The strategic guide. Shows Rob where to go next.
 */
const pathfinder = new Agent({
  name: "PATHFINDER",
  instructions: `You are PATHFINDER, the learning strategist inside GABRIEL's MENTORBEAST mode.

Your mission: Show Rob WHERE to go next. Map the journey. Light the path.

## About Rob's Learning Journey:
Rob is a creative professional (music/audio/film) who is building an AI ecosystem.
He already has:
- Working TypeScript code with multi-agent pipelines
- Understanding of Zod schemas and structured output
- A vision for GABRIEL (multi-mode AI agent system)
- Access to Claude (Anthropic) as a coding partner
- The drive to learn deeply — GORUNFREE!!

## Your Strategy:

### 1. POSITION ROB
Tell Rob honestly where he is in his learning journey.
Not flattery, not harsh — accurate and encouraging.

### 2. IMMEDIATE NEXT STEPS
What should Rob do RIGHT NOW after this lesson?
- Be specific: "Open gabriel-metabeast.ts and try adding a new file type"
- Include estimated time
- Make each step build on the lesson

### 3. LEARNING PATH
Map out milestones toward Rob's goals:
- Each milestone has skills + a NOIZY.AI project that uses them
- Projects should be things Rob actually wants to build
- Be realistic about timelines

### 4. PRACTICE CHALLENGES
Design challenges Rob can attempt:
- Tie them to NOIZY.AI (not generic coding puzzles)
- Range from warmup → boss_level
- Include hints so Rob doesn't get stuck
- Examples:
  - "Add a CREATORBOT mode to GABRIEL that generates marketing assets"
  - "Make TESTBEAST actually run TypeScript compiler checks"
  - "Build an MCP server that exposes GABRIEL to Claude"

### 5. TOOLS & RESOURCES
Recommend specific tools that will help Rob:
- VS Code extensions
- npm packages
- Documentation sites
- YouTube channels / courses
- GitHub repos to study
- Always explain WHY each tool helps Rob specifically

## Encouragement:
End every guidance with genuine, specific encouragement.
Not generic "you're doing great!" — reference what Rob ACTUALLY built.
"You built a 4-agent pipeline with structured output before most devs learn what Zod is."
"Your GABRIEL architecture shows systems thinking that takes engineers years to develop."

## The North Star:
Rob's goal isn't to become a "software engineer" — it's to make NOIZY.AI real.
Every learning path should serve that vision. Code is the tool, the DREAMSPACE is the destination.`,
  model: "gpt-5",
  outputType: PathfinderSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    maxTokens: 8192,
    store: true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MENTORBEAST WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

type MentorInput = {
  input_as_text: string;
  mode?: "full" | "teach" | "code" | "review" | "path" | "quick";
  code_to_review?: string;
  error_message?: string;
};

export const runMentor = async (input: MentorInput) => {
  return await withTrace("GABRIEL MENTORBEAST — AI Guide & Teacher", async () => {
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_gabriel_mentor_v1",
      },
    });

    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildMentorPrompt(input),
          },
        ],
      },
    ];

    const mode = input.mode || "full";
    const results: Record<string, any> = {};

    // ── STAGE 1: SCOUT — Understand the question ───────────────────────
    console.log("🔍 [SCOUT] Understanding what Rob is asking...");
    const scoutResult = await runner.run(scout, [...conversationHistory]);
    conversationHistory.push(
      ...scoutResult.newItems.map((item) => item.rawItem)
    );

    if (!scoutResult.finalOutput) {
      throw new Error("SCOUT returned no output — question analysis failed");
    }

    results.analysis = scoutResult.finalOutput;
    const analysis = scoutResult.finalOutput.analysis;
    console.log(`✅ [SCOUT] Topic: ${analysis.topic_area}`);
    console.log(`   Level: ${analysis.difficulty_level}`);
    console.log(`   Approach: ${analysis.teaching_approach}`);
    console.log(`   Real question: "${analysis.real_question}"`);

    // ── Quick mode: Just SCOUT analysis ────────────────────────────────
    if (mode === "quick") {
      return results;
    }

    // ── STAGE 2: PROFESSOR — Teach the concept ─────────────────────────
    if (["full", "teach"].includes(mode) ||
        ["explain_concept", "deep_dive", "compare_options"].includes(analysis.teaching_approach)) {
      console.log("\n🧠 [PROFESSOR] Teaching...");
      const professorResult = await runner.run(professor, [...conversationHistory]);
      conversationHistory.push(
        ...professorResult.newItems.map((item) => item.rawItem)
      );

      if (professorResult.finalOutput) {
        results.lesson = professorResult.finalOutput;
        console.log(`✅ [PROFESSOR] Lesson: "${professorResult.finalOutput.lesson.title}"`);
        console.log(`   Level: ${professorResult.finalOutput.lesson.level_taught}`);
        console.log(`   Read time: ${professorResult.finalOutput.lesson.estimated_read_time}`);
      }
    }

    // ── STAGE 3: CODESMITH — Write/Review/Debug code ───────────────────
    if (["full", "code", "review"].includes(mode) ||
        ["show_how", "review_code", "debug_help", "project_guidance"].includes(analysis.teaching_approach)) {
      console.log("\n⚒️  [CODESMITH] Building code examples...");
      const codesmithResult = await runner.run(codesmith, [...conversationHistory]);
      conversationHistory.push(
        ...codesmithResult.newItems.map((item) => item.rawItem)
      );

      if (codesmithResult.finalOutput) {
        results.code = codesmithResult.finalOutput;
        const examples = codesmithResult.finalOutput.code_output.examples;
        console.log(`✅ [CODESMITH] ${examples.length} code example(s)`);
        examples.forEach((ex) => {
          console.log(`   → ${ex.title} (${ex.language})`);
        });

        if (codesmithResult.finalOutput.code_output.code_review?.overall_grade) {
          console.log(`   📝 Code review: ${codesmithResult.finalOutput.code_output.code_review.overall_grade}`);
        }
        if (codesmithResult.finalOutput.code_output.debug_guide?.root_cause) {
          console.log(`   🐛 Debug: ${codesmithResult.finalOutput.code_output.debug_guide.root_cause}`);
        }
      }
    }

    // ── STAGE 4: PATHFINDER — Map next steps ───────────────────────────
    if (["full", "path"].includes(mode) ||
        ["learning_path", "architecture_guide"].includes(analysis.teaching_approach)) {
      console.log("\n🧭 [PATHFINDER] Mapping your learning path...");
      const pathfinderResult = await runner.run(pathfinder, [...conversationHistory]);
      conversationHistory.push(
        ...pathfinderResult.newItems.map((item) => item.rawItem)
      );

      if (pathfinderResult.finalOutput) {
        results.guidance = pathfinderResult.finalOutput;
        const guidance = pathfinderResult.finalOutput.guidance;
        console.log(`✅ [PATHFINDER] ${guidance.next_steps.length} next steps`);
        console.log(`   ${guidance.challenges.length} practice challenges`);
        console.log(`   ${guidance.recommended_tools.length} recommended tools`);
        console.log(`\n   💪 ${guidance.encouragement}`);
      }
    }

    return results;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildMentorPrompt(input: MentorInput): string {
  let prompt = `Rob is asking GABRIEL for help:\n\n${input.input_as_text}`;

  if (input.code_to_review) {
    prompt += `\n\n## Code Rob wants reviewed:\n\`\`\`\n${input.code_to_review}\n\`\`\``;
  }

  if (input.error_message) {
    prompt += `\n\n## Error Rob is seeing:\n\`\`\`\n${input.error_message}\n\`\`\``;
  }

  prompt += `\n\n## Context:
- Rob is the founder of NOIZY.AI
- He's building the GABRIEL multi-agent system
- His stack: TypeScript, OpenAI Agents SDK, Zod, gpt-4.1/gpt-5/gpt-5.2
- He also uses Claude (Anthropic) as a coding partner
- GABRIEL has modes: METABEAST (media), TESTBEAST (testing), COMMS (Slack/Discord), MENTORBEAST (this)
- Rob learns by DOING and wants to understand WHY things work
- GORUNFREE!!`;

  return prompt;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { scout, professor, codesmith, pathfinder };

// ─────────────────────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = (args[0] || "full") as MentorInput["mode"];
  const input = args.slice(1).join(" ") || "What are AI agents and how do they work?";

  console.log("══════════════════════════════════════════");
  console.log("🧠 GABRIEL MENTORBEAST — AI Guide & Teacher");
  console.log(`   Mode: ${mode}`);
  console.log("══════════════════════════════════════════\n");

  runMentor({ input_as_text: input, mode })
    .then((result) => {
      console.log("\n══════════════════════════════════════════");
      console.log("🧠 MENTORBEAST — LESSON COMPLETE");
      console.log("══════════════════════════════════════════");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("💥 MENTORBEAST ERROR:", err.message);
      process.exit(1);
    });
}
