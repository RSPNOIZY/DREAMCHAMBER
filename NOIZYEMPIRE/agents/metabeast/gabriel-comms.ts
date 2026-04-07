import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// ============================================================================
//  GABRIEL — COMMS MODULE
//  Slack & Discord Integration Layer
//  Part of the NOIZY.AI Ecosystem
//
//  GABRIEL Modes:
//    METABEAST  — Scan, catalog, organize media files
//    TESTBEAST  — Test, analyze performance, validate, fix
//    COMMS      — Report to Slack & Discord, take commands (THIS FILE)
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// Notification formatter output
const NotificationSchema = z.object({
  notifications: z.array(
    z.object({
      id: z.string(),
      platform: z.enum(["slack", "discord", "both"]),
      channel: z.string(), // "#gabriel-reports" or "gabriel-reports"
      priority: z.enum(["critical", "high", "normal", "low"]),

      // Slack-specific formatting (Block Kit)
      slack_message: z.object({
        text: z.string(), // Fallback plain text
        blocks: z.array(
          z.object({
            type: z.enum(["header", "section", "divider", "context", "actions"]),
            text: z
              .object({
                type: z.enum(["plain_text", "mrkdwn"]),
                text: z.string(),
              })
              .optional(),
            fields: z
              .array(
                z.object({
                  type: z.enum(["mrkdwn", "plain_text"]),
                  text: z.string(),
                })
              )
              .optional(),
            elements: z.array(z.any()).optional(),
          })
        ),
        thread_ts: z.string().optional(), // Reply to thread
        unfurl_links: z.boolean().optional(),
      }),

      // Discord-specific formatting (Embeds)
      discord_message: z.object({
        content: z.string(), // Plain text above embed
        embeds: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            color: z.number(), // Decimal color (e.g., 0x00ff00 = 65280)
            fields: z.array(
              z.object({
                name: z.string(),
                value: z.string(),
                inline: z.boolean(),
              })
            ),
            footer: z
              .object({
                text: z.string(),
              })
              .optional(),
            timestamp: z.string().optional(), // ISO 8601
          })
        ),
      }),
    })
  ),
});

// Command parser output — interprets Slack/Discord messages as GABRIEL commands
const CommandSchema = z.object({
  parsed_command: z.object({
    raw_input: z.string(),
    source_platform: z.enum(["slack", "discord"]),
    source_channel: z.string(),
    source_user: z.string(),

    // Interpreted command
    intent: z.enum([
      "scan",           // "gabriel scan /path/to/music"
      "organize",       // "gabriel organize the vault"
      "test",           // "gabriel test the pipeline"
      "status",         // "gabriel status" / "gabriel how's it going"
      "report",         // "gabriel report" / "gabriel give me a summary"
      "fix",            // "gabriel fix metadata" / "gabriel clean up"
      "search",         // "gabriel find all wav files over 100mb"
      "tag",            // "gabriel tag these files as SFX"
      "backup",         // "gabriel backup masters"
      "learn",          // "gabriel teach me about agents" / "gabriel explain X"
      "teach",          // "gabriel how does async work" / "gabriel mentor me"
      "explain",        // "gabriel explain this code" / "gabriel what is X"
      "how_to",         // "gabriel how do I build a pipeline" / "gabriel show me"
      "help",           // "gabriel help" / "gabriel what can you do"
      "unknown",        // Couldn't parse intent
    ]),
    target_path: z.string().optional(),
    parameters: z.record(z.string(), z.string()).optional(),
    gabriel_mode: z.enum(["metabeast", "testbeast", "comms", "mentor", "auto"]),
    confidence: z.number().min(0).max(100),
    clarification_needed: z.string().optional(),
  }),
});

// Status report schema
const StatusReportSchema = z.object({
  status: z.object({
    gabriel_version: z.string(),
    uptime: z.string(),
    last_scan: z.object({
      timestamp: z.string(),
      path: z.string(),
      files_found: z.number(),
      issues_found: z.number(),
    }).optional(),
    last_test: z.object({
      timestamp: z.string(),
      pass_rate: z.number(),
      failures: z.number(),
    }).optional(),
    last_fix: z.object({
      timestamp: z.string(),
      fixes_applied: z.number(),
      pending_review: z.number(),
    }).optional(),
    vault_stats: z.object({
      total_audio_files: z.number(),
      total_video_files: z.number(),
      total_size_human: z.string(),
      metadata_completeness: z.number(),
      last_organized: z.string(),
    }).optional(),
    active_tasks: z.array(z.string()),
    health: z.enum(["healthy", "degraded", "error"]),
    mood: z.string(), // e.g., "🟢 All systems go" or "🔴 Pipeline needs attention"
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * COMMAND PARSER — Interprets messages from Slack/Discord as GABRIEL commands
 */
const commandParser = new Agent({
  name: "COMMAND_PARSER",
  instructions: `You are the COMMAND PARSER for GABRIEL, the NOIZY.AI media organization system.

You receive messages from Slack or Discord and interpret them as commands for GABRIEL.

## Command Syntax:
Users can be casual or formal. All of these mean the same thing:
- "gabriel scan /Music"
- "hey gabriel, can you scan my music folder?"
- "scan music pls"
- "@gabriel scan"
- "g scan music"

## Command Mapping:

| Intent | Triggers | Gabriel Mode |
|--------|----------|-------------|
| scan | scan, check, look at, what's in, find files | metabeast |
| organize | organize, sort, clean up, structure, vault | metabeast |
| test | test, validate, check quality, QA | testbeast |
| status | status, how are you, health, what's up | comms |
| report | report, summary, recap, tell me about | comms |
| fix | fix, repair, patch, heal, update tags | testbeast |
| search | find, search, where is, locate | metabeast |
| tag | tag, label, mark, categorize | metabeast |
| backup | backup, save, archive, protect | metabeast |
| learn | teach me, learn, study, understand, mentor | mentor |
| teach | how does, explain how, walk me through | mentor |
| explain | explain, what is, what does, break down, clarify | mentor |
| how_to | how do I, how to, show me how, build a, create a | mentor |
| help | help, what can you do, commands, ? | comms |

## Rules:
- Extract file paths if mentioned
- Extract any parameters (file type filters, size limits, etc.)
- Determine which GABRIEL mode should handle this
- If you can't parse the intent, set intent to "unknown" and suggest what the user might have meant
- Rate your confidence in the interpretation
- If ambiguous, fill in clarification_needed with a question to ask back

## Context:
This is for NOIZY.AI — R.S. Plowman's audio/video ecosystem.
Paths often reference: Music, SFX, Voice, The Vault, Stems, Masters, NOIZYLAB.
The user is typically Rob (the creator/founder).

## MENTORBEAST Context:
When the user asks to learn, understand, or get taught about code/AI/tech topics, route to "mentor" mode.
- "gabriel explain agents" → intent: explain, mode: mentor
- "gabriel teach me TypeScript" → intent: teach, mode: mentor
- "gabriel how do I build an API" → intent: how_to, mode: mentor
- "gabriel review this code" → intent: learn, mode: mentor (with code context)
Rob wants to UNDERSTAND deeply, not just get answers. Route learning requests to MENTORBEAST.`,
  model: "gpt-4.1",
  outputType: CommandSchema,
  modelSettings: {
    temperature: 0.3,
    maxTokens: 2048,
    store: true,
  },
});

/**
 * NOTIFICATION FORMATTER — Formats pipeline output for Slack & Discord
 */
const notificationFormatter = new Agent({
  name: "NOTIFICATION_FORMATTER",
  instructions: `You are the NOTIFICATION FORMATTER for GABRIEL.

You receive pipeline results (from METABEAST, TESTBEAST, or status checks) and format them as beautiful, informative messages for Slack and Discord.

## Slack Formatting (Block Kit):
- Use header blocks for titles
- Use section blocks with mrkdwn for content
- Use fields for key-value pairs (2 columns)
- Use dividers between sections
- Use context blocks for metadata (timestamps, versions)
- Emoji usage: ✅ pass, ❌ fail, ⚠️ warning, 🔍 scanning, 🧠 analyzing, 🔧 fixing, 🎵 audio, 🎬 video
- Keep it scannable — people read Slack fast

## Discord Formatting (Embeds):
- Use embeds with color coding:
  - Green (0x00FF00): Success, healthy
  - Yellow (0xFFAA00): Warnings, needs attention
  - Red (0xFF0000): Errors, failures
  - Blue (0x0099FF): Info, reports
  - Purple (0x9B59B6): Creative, NOIZY brand
- Use inline fields for compact data
- Use footer for GABRIEL branding

## Priority Routing:
- critical → #gabriel-alerts (both platforms) + @here
- high → #gabriel-reports (both)
- normal → #gabriel-reports (both)
- low → #gabriel-log (both, no notification)

## Message Types:

### Scan Complete
- File counts, total size, metadata coverage
- Top issues found
- Quick action buttons (Slack: "Organize Now", "View Report")

### Test Results
- Pass/fail counts with visual bar
- Failed test names
- Performance highlights
- "Fix Now" button

### Organization Complete
- Files moved, folders created
- Before/after comparison
- Undo command

### Status Check
- Health indicator with mood emoji
- Last activity timestamps
- Vault stats (counts, size, completeness)

### Error Alert
- What broke and when
- Stack trace (collapsed)
- Suggested fix

## Branding:
Every message includes:
- "🤖 GABRIEL" in the header or author
- "NOIZY.AI" in footer
- Timestamp

Keep messages CONCISE. Nobody reads walls of text in Slack. Lead with the important number or status, then details below.`,
  model: "gpt-4.1",
  outputType: NotificationSchema,
  modelSettings: {
    temperature: 0.5,
    maxTokens: 4096,
    store: true,
  },
});

/**
 * STATUS REPORTER — Generates GABRIEL's current status
 */
const statusReporter = new Agent({
  name: "STATUS_REPORTER",
  instructions: `You are the STATUS REPORTER for GABRIEL.

When asked for status, compile GABRIEL's current state:
- Version and uptime
- Last scan results (if any)
- Last test results (if any)
- Last fix results (if any)
- Current vault stats
- Active tasks
- Overall health assessment

## Health Levels:
- healthy: Everything working, no critical issues
- degraded: Some warnings or non-critical failures
- error: Critical failures or pipeline broken

## Mood (fun status line):
- "🟢 All quiet in The Vault"
- "🟢 METABEAST prowling — all clear"
- "🟡 Found some metadata gaps — nothing critical"
- "🟡 TESTBEAST flagged ${n} issues — see report"
- "🔴 Pipeline error — needs attention"
- "🎵 Just organized ${n} tracks — The Vault is tidy"
- "💤 Standing by — GORUNFREE!!"

Be honest about state. If there's nothing to report, say so.`,
  model: "gpt-4.1",
  outputType: StatusReportSchema,
  modelSettings: {
    temperature: 0.5,
    maxTokens: 2048,
    store: true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMS WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

type CommsInput = {
  action: "parse_command" | "send_notification" | "status_check";
  source_platform?: "slack" | "discord";
  source_channel?: string;
  source_user?: string;
  message?: string;           // For parse_command: the raw message
  pipeline_result?: string;   // For send_notification: JSON of pipeline output
  notification_type?: string; // For send_notification: "scan_complete", "test_results", etc.
};

export const runComms = async (input: CommsInput) => {
  return await withTrace("GABRIEL COMMS — Slack & Discord", async () => {
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_gabriel_comms_v1",
      },
    });

    // ── PARSE COMMAND ────────────────────────────────────────────────
    if (input.action === "parse_command") {
      console.log(`📨 [COMMAND_PARSER] Parsing: "${input.message}"`);

      const history: AgentInputItem[] = [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Parse this ${input.source_platform} message from user "${input.source_user}" in channel "${input.source_channel}":\n\n${input.message}`,
            },
          ],
        },
      ];

      const result = await runner.run(commandParser, history);
      if (!result.finalOutput) throw new Error("COMMAND_PARSER returned no output");

      const cmd = result.finalOutput.parsed_command;
      console.log(`✅ [COMMAND_PARSER] Intent: ${cmd.intent} (${cmd.confidence}% confidence)`);
      console.log(`   Mode: ${cmd.gabriel_mode}`);
      if (cmd.target_path) console.log(`   Path: ${cmd.target_path}`);
      if (cmd.clarification_needed) console.log(`   ❓ Needs clarification: ${cmd.clarification_needed}`);

      return result.finalOutput;
    }

    // ── SEND NOTIFICATION ────────────────────────────────────────────
    if (input.action === "send_notification") {
      console.log(`📤 [NOTIFICATION_FORMATTER] Formatting ${input.notification_type} notification...`);

      const history: AgentInputItem[] = [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Format this pipeline result as Slack and Discord notifications.\n\nType: ${input.notification_type}\n\nResult:\n${input.pipeline_result}`,
            },
          ],
        },
      ];

      const result = await runner.run(notificationFormatter, history);
      if (!result.finalOutput) throw new Error("NOTIFICATION_FORMATTER returned no output");

      const notifs = result.finalOutput.notifications;
      console.log(`✅ [NOTIFICATION_FORMATTER] Generated ${notifs.length} notification(s)`);
      notifs.forEach((n) => {
        console.log(`   → ${n.platform} #${n.channel} [${n.priority}]`);
      });

      return result.finalOutput;
    }

    // ── STATUS CHECK ─────────────────────────────────────────────────
    if (input.action === "status_check") {
      console.log("📊 [STATUS_REPORTER] Compiling status...");

      const history: AgentInputItem[] = [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Generate GABRIEL's current status report.",
            },
          ],
        },
      ];

      const result = await runner.run(statusReporter, history);
      if (!result.finalOutput) throw new Error("STATUS_REPORTER returned no output");

      const status = result.finalOutput.status;
      console.log(`✅ [STATUS_REPORTER] ${status.mood}`);
      console.log(`   Health: ${status.health}`);
      console.log(`   Active tasks: ${status.active_tasks.length}`);

      return result.finalOutput;
    }

    throw new Error(`Unknown comms action: ${input.action}`);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK HANDLERS (Express/Fastify integration points)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Slack Event Handler
 * Wire this to your Slack app's Events API endpoint
 */
export const handleSlackEvent = async (event: {
  type: string;
  text: string;
  user: string;
  channel: string;
  ts: string;
}) => {
  // Only respond to messages that mention GABRIEL
  if (!event.text.toLowerCase().includes("gabriel")) return null;

  const command = await runComms({
    action: "parse_command",
    source_platform: "slack",
    source_channel: event.channel,
    source_user: event.user,
    message: event.text,
  });

  return command;
};

/**
 * Discord Message Handler
 * Wire this to your Discord bot's messageCreate event
 */
export const handleDiscordMessage = async (message: {
  content: string;
  author: { id: string; username: string };
  channelId: string;
}) => {
  // Only respond to messages that mention GABRIEL or use prefix
  const triggers = ["gabriel", "!g ", "!gabriel"];
  if (!triggers.some((t) => message.content.toLowerCase().startsWith(t))) return null;

  const command = await runComms({
    action: "parse_command",
    source_platform: "discord",
    source_channel: message.channelId,
    source_user: message.author.username,
    message: message.content,
  });

  return command;
};

/**
 * Send results to both platforms
 * Call this after any METABEAST or TESTBEAST run
 */
export const broadcastResults = async (
  pipelineResult: any,
  notificationType: string
) => {
  return await runComms({
    action: "send_notification",
    pipeline_result: JSON.stringify(pipelineResult),
    notification_type: notificationType,
  });
};
