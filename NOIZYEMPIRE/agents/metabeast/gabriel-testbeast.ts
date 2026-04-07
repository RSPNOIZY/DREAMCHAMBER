import { OpenAI } from "openai";
import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// ============================================================================
//  GABRIEL — TESTBEAST MODE
//  Pipeline Tester, Performance Analyst & Auto-Fixer
//  Part of the NOIZY.AI Ecosystem
//
//  GABRIEL has multiple modes:
//    METABEAST  — Scan, catalog, organize media files
//    TESTBEAST  — Test, analyze performance, validate, fix (THIS FILE)
//    (Future: MIXBEAST, DREAMBEAST, etc.)
// ============================================================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// Test Runner output — validates pipeline function
const TestRunnerSchema = z.object({
  test_suite: z.object({
    suite_name: z.string(),
    timestamp: z.string(),
    environment: z.object({
      node_version: z.string(),
      os: z.string(),
      available_memory_mb: z.number(),
      cpu_cores: z.number(),
    }),
    tests: z.array(
      z.object({
        test_id: z.string(),
        test_name: z.string(),
        category: z.enum([
          "unit",          // Individual function works
          "integration",   // Agents chain correctly
          "schema",        // Output matches schema
          "performance",   // Speed/resource benchmarks
          "edge_case",     // Unusual inputs handled
          "regression",    // Previously fixed bugs stay fixed
        ]),
        status: z.enum(["pass", "fail", "warn", "skip"]),
        duration_ms: z.number(),
        input_summary: z.string(),
        expected_behavior: z.string(),
        actual_behavior: z.string(),
        error_message: z.string().optional(),
        stack_trace: z.string().optional(),
      })
    ),
    summary: z.object({
      total: z.number(),
      passed: z.number(),
      failed: z.number(),
      warnings: z.number(),
      skipped: z.number(),
      pass_rate: z.number(), // 0-100
      total_duration_ms: z.number(),
    }),
  }),
});

// Performance Analyst output — benchmarks and bottleneck detection
const PerformanceAnalystSchema = z.object({
  performance_report: z.object({
    report_name: z.string(),
    timestamp: z.string(),

    // Per-agent timing
    agent_benchmarks: z.array(
      z.object({
        agent_name: z.string(),
        model: z.string(),
        avg_latency_ms: z.number(),
        p50_latency_ms: z.number(),
        p95_latency_ms: z.number(),
        p99_latency_ms: z.number(),
        tokens_input_avg: z.number(),
        tokens_output_avg: z.number(),
        cost_per_call_usd: z.number(),
        error_rate_pct: z.number(),
        runs_sampled: z.number(),
      })
    ),

    // Pipeline-level metrics
    pipeline_metrics: z.object({
      total_pipeline_avg_ms: z.number(),
      total_pipeline_p95_ms: z.number(),
      total_cost_per_run_usd: z.number(),
      bottleneck_agent: z.string(),
      bottleneck_reason: z.string(),
    }),

    // Token efficiency
    token_analysis: z.object({
      total_input_tokens_avg: z.number(),
      total_output_tokens_avg: z.number(),
      wasted_tokens_estimate: z.number(), // Tokens that didn't contribute to output
      optimization_suggestions: z.array(
        z.object({
          suggestion: z.string(),
          estimated_savings_pct: z.number(),
          agent_affected: z.string(),
        })
      ),
    }),

    // Quality of output
    output_quality: z.object({
      schema_compliance_rate: z.number(), // % of outputs matching schema perfectly
      hallucination_risk: z.enum(["low", "medium", "high"]),
      completeness_score: z.number(), // 0-100 — are all fields filled?
      consistency_score: z.number(),  // 0-100 — same input = similar output?
    }),

    // Recommendations
    recommendations: z.array(
      z.object({
        priority: z.enum(["critical", "high", "medium", "low"]),
        category: z.enum(["speed", "cost", "quality", "reliability"]),
        recommendation: z.string(),
        expected_impact: z.string(),
      })
    ),
  }),
});

// Fixer output — auto-repair and optimization actions
const FixerSchema = z.object({
  fix_report: z.object({
    report_name: z.string(),
    timestamp: z.string(),

    // Issues found and fixed
    fixes_applied: z.array(
      z.object({
        fix_id: z.string(),
        issue_type: z.enum([
          "metadata_repair",      // Fixed broken/missing metadata
          "schema_correction",    // Fixed output schema violations
          "prompt_optimization",  // Improved agent instructions
          "error_handling",       // Added missing error handling
          "performance_tune",     // Adjusted model settings for speed/quality
          "token_reduction",      // Reduced unnecessary token usage
          "file_repair",          // Fixed corrupt/incomplete files
          "dedup_cleanup",        // Removed confirmed duplicates
          "format_conversion",    // Converted to better format
          "naming_fix",           // Fixed file naming issues
        ]),
        description: z.string(),
        before_state: z.string(),
        after_state: z.string(),
        confidence: z.enum(["certain", "high", "medium", "needs_review"]),
        reversible: z.boolean(),
        undo_command: z.string().optional(),
      })
    ),

    // Issues found but NOT auto-fixed (need human decision)
    needs_human_review: z.array(
      z.object({
        issue: z.string(),
        reason_not_auto_fixed: z.string(),
        options: z.array(
          z.object({
            option: z.string(),
            risk: z.enum(["safe", "moderate", "risky"]),
          })
        ),
      })
    ),

    // Code patches (actual code changes to improve the pipeline)
    code_patches: z.array(
      z.object({
        file: z.string(),
        description: z.string(),
        diff: z.string(), // unified diff format
        category: z.enum(["bugfix", "performance", "feature", "refactor"]),
      })
    ),

    summary: z.object({
      total_issues_found: z.number(),
      auto_fixed: z.number(),
      needs_review: z.number(),
      code_patches_generated: z.number(),
      estimated_improvement: z.string(), // e.g., "~30% faster, 15% cheaper"
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEST RUNNER — The Validator
 * Runs a comprehensive test suite against the pipeline.
 */
const testRunner = new Agent({
  name: "TEST_RUNNER",
  instructions: `You are TEST_RUNNER, GABRIEL's quality assurance engine.

Your mission: Validate that every agent in the pipeline works correctly.

## Test Categories:

### UNIT TESTS
- Does each agent produce valid output for normal input?
- Does each schema validate correctly?
- Do edge cases crash or gracefully degrade?

### INTEGRATION TESTS
- Does data flow correctly between SCANNER → SARAH → GABRIEL?
- Is conversation history preserved and useful?
- Do agents reference upstream output correctly?

### SCHEMA TESTS
- Does every output field match its Zod schema?
- Are optional fields handled correctly?
- Do enum values match the defined options?

### PERFORMANCE TESTS
- How long does each agent take?
- How many tokens are consumed?
- What's the cost per pipeline run?

### EDGE CASE TESTS
- Empty file list (no audio/video found)
- Massive file list (10,000+ files)
- Corrupt metadata / unreadable files
- Mixed encodings in filenames
- Unicode and special characters in paths
- Files with no extension
- Extremely long file paths

### REGRESSION TESTS
- Re-run any previously failing scenarios
- Verify fixes haven't broken other things

## Test Output Rules:
- Every test gets a clear pass/fail/warn/skip
- Failed tests include the actual error and expected behavior
- Performance tests include timing in milliseconds
- Be brutally honest — no false passes

Report EVERYTHING. A passing test suite with hidden failures is worse than knowing what's broken.`,
  model: "gpt-4.1",
  outputType: TestRunnerSchema,
  modelSettings: {
    temperature: 0.2, // Deterministic testing
    maxTokens: 8192,
    store: true,
  },
});

/**
 * PERFORMANCE ANALYST — The Profiler
 * Benchmarks the entire pipeline and finds bottlenecks.
 */
const performanceAnalyst = new Agent({
  name: "PERFORMANCE_ANALYST",
  instructions: `You are PERFORMANCE_ANALYST, GABRIEL's efficiency optimizer.

You receive test results from TEST_RUNNER and analyze:

## 1. AGENT BENCHMARKS
For each agent (SCANNER, SARAH, GABRIEL, and any sub-agents):
- Average latency, P50, P95, P99
- Token consumption (input + output)
- Cost per call (based on model pricing)
- Error rate

## 2. PIPELINE BOTTLENECK DETECTION
- Which agent is the slowest?
- Which agent uses the most tokens?
- Where is the highest cost?
- Is the conversation history growing too large? (context window bloat)

## 3. TOKEN EFFICIENCY
- Are agents receiving too much irrelevant context?
- Could instructions be more concise without losing quality?
- Are schemas forcing unnecessary output?
- Estimate "wasted" tokens that don't contribute to the final result

## 4. OUTPUT QUALITY METRICS
- Schema compliance: Do outputs match schemas perfectly?
- Hallucination risk: Is any agent inventing data not in the input?
- Completeness: Are optional fields being filled or left empty?
- Consistency: Does the same input produce similar outputs across runs?

## 5. ACTIONABLE RECOMMENDATIONS
For each issue found, provide:
- Priority (critical/high/medium/low)
- Category (speed/cost/quality/reliability)
- Specific recommendation
- Expected impact

## Model Pricing Reference (approximate):
- gpt-4.1: ~$2/M input, ~$8/M output
- gpt-5: ~$5/M input, ~$20/M output
- gpt-5.2: ~$10/M input, ~$40/M output

Factor these into cost analysis. If GABRIEL on gpt-5.2 could produce equal quality on gpt-5, that's a huge cost saving.

Be precise with numbers. Vague analysis is useless analysis.`,
  model: "gpt-5",
  outputType: PerformanceAnalystSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    store: true,
  },
});

/**
 * FIXER — The Auto-Repair Engine
 * Takes test results + performance analysis and FIXES what it can.
 */
const fixer = new Agent({
  name: "FIXER",
  instructions: `You are FIXER, GABRIEL's auto-repair and optimization engine.

You receive:
- Test results (from TEST_RUNNER)
- Performance analysis (from PERFORMANCE_ANALYST)
- The original pipeline output (from METABEAST mode)

## YOUR MISSION: Fix everything you safely can. Flag everything else.

### AUTO-FIX (do it):
- Metadata repair: Fill in missing fields from filename patterns, folder names, file properties
- Schema corrections: Adjust outputs that don't match schemas
- Naming standardization: Fix filenames that don't match the naming convention
- Duplicate marking: Flag confirmed duplicates for review
- Error handling gaps: Generate try/catch wrappers for uncaught errors

### PROMPT OPTIMIZATION (suggest it):
- Rewrite agent instructions to be more token-efficient
- Remove redundant context from conversation history
- Adjust temperature/effort settings based on quality vs. speed needs

### CODE PATCHES (generate diffs):
- Generate actual unified diffs for code improvements
- Each patch should be independently applicable
- Categories: bugfix, performance, feature, refactor

### NEEDS HUMAN (flag it):
- Ambiguous duplicates (same name but different content)
- Files that might be important but look like junk
- Decisions that affect the creative catalog (never auto-delete music)
- Configuration choices (folder names, naming conventions)

## PRINCIPLES:
- NEVER auto-delete creative content
- ALWAYS provide undo commands for reversible fixes
- Rate your confidence on every fix
- If it's not CERTAIN, flag it for review
- Speed improvements that sacrifice quality need human approval
- Cost savings that sacrifice reliability need human approval

Generate real, executable fixes. Not suggestions — actual commands and code.

GORUNFREE!!`,
  model: "gpt-5.2",
  outputType: FixerSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    maxTokens: 16384,
    store: true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// TESTBEAST WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

type TestBeastInput = {
  mode: "full" | "test_only" | "analyze_only" | "fix_only";
  pipeline_output?: string; // JSON string of METABEAST output to validate
  input_as_text: string;
};

export const runTestBeast = async (input: TestBeastInput) => {
  return await withTrace("GABRIEL TESTBEAST — Test, Analyze & Fix", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `[TESTBEAST MODE]\n\nMode: ${input.mode}\n\nPipeline context:\n${input.input_as_text}\n\n${input.pipeline_output ? `Pipeline output to validate:\n${input.pipeline_output}` : "No pipeline output provided — run tests against pipeline definition."}`,
          },
        ],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_gabriel_testbeast_v1",
      },
    });

    let testResult: any = null;
    let analysisResult: any = null;
    let fixResult: any = null;

    // ── STAGE 1: TEST RUNNER ──────────────────────────────────────────
    if (input.mode === "full" || input.mode === "test_only") {
      console.log("🧪 [TEST_RUNNER] Running test suite...");
      const testRunnerResult = await runner.run(testRunner, [...conversationHistory]);
      conversationHistory.push(
        ...testRunnerResult.newItems.map((item) => item.rawItem)
      );

      if (!testRunnerResult.finalOutput) {
        throw new Error("TEST_RUNNER returned no output");
      }

      testResult = testRunnerResult.finalOutput;
      const summary = testResult.test_suite.summary;
      console.log(`✅ [TEST_RUNNER] Suite complete: ${summary.passed}/${summary.total} passed (${summary.pass_rate}%)`);
      if (summary.failed > 0) {
        console.log(`   ⚠️  ${summary.failed} FAILED`);
      }
      if (summary.warnings > 0) {
        console.log(`   ⚡ ${summary.warnings} warnings`);
      }
      console.log(`   ⏱  Total time: ${summary.total_duration_ms}ms`);
    }

    // ── STAGE 2: PERFORMANCE ANALYST ──────────────────────────────────
    if (input.mode === "full" || input.mode === "analyze_only") {
      console.log("📊 [PERFORMANCE_ANALYST] Benchmarking pipeline...");
      const perfResult = await runner.run(performanceAnalyst, [...conversationHistory]);
      conversationHistory.push(
        ...perfResult.newItems.map((item) => item.rawItem)
      );

      if (!perfResult.finalOutput) {
        throw new Error("PERFORMANCE_ANALYST returned no output");
      }

      analysisResult = perfResult.finalOutput;
      const metrics = analysisResult.performance_report.pipeline_metrics;
      console.log(`✅ [PERFORMANCE_ANALYST] Analysis complete:`);
      console.log(`   Avg pipeline time: ${metrics.total_pipeline_avg_ms}ms`);
      console.log(`   Cost per run: $${metrics.total_cost_per_run_usd.toFixed(4)}`);
      console.log(`   Bottleneck: ${metrics.bottleneck_agent} — ${metrics.bottleneck_reason}`);
      console.log(`   Recommendations: ${analysisResult.performance_report.recommendations.length}`);
    }

    // ── STAGE 3: FIXER ────────────────────────────────────────────────
    if (input.mode === "full" || input.mode === "fix_only") {
      console.log("🔧 [FIXER] Auto-repairing issues...");
      const fixerResult = await runner.run(fixer, [...conversationHistory]);
      conversationHistory.push(
        ...fixerResult.newItems.map((item) => item.rawItem)
      );

      if (!fixerResult.finalOutput) {
        throw new Error("FIXER returned no output");
      }

      fixResult = fixerResult.finalOutput;
      const fixSummary = fixResult.fix_report.summary;
      console.log(`✅ [FIXER] Repair complete:`);
      console.log(`   Issues found: ${fixSummary.total_issues_found}`);
      console.log(`   Auto-fixed: ${fixSummary.auto_fixed}`);
      console.log(`   Needs review: ${fixSummary.needs_review}`);
      console.log(`   Code patches: ${fixSummary.code_patches_generated}`);
      console.log(`   Estimated improvement: ${fixSummary.estimated_improvement}`);
    }

    // ── RETURN ────────────────────────────────────────────────────────
    return {
      tests: testResult,
      performance: analysisResult,
      fixes: fixResult,
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK TEST ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  runTestBeast({
    mode: "full",
    input_as_text:
      "Test the GABRIEL METABEAST pipeline for organizing audio/video files. Validate all schemas, check performance, and fix any issues found.",
  })
    .then((result) => {
      console.log("\n══════════════════════════════════════════");
      console.log("GABRIEL TESTBEAST — COMPLETE");
      console.log("══════════════════════════════════════════");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(console.error);
}
