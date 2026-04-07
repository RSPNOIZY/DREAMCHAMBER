// ============================================================================
//  GABRIEL — Master Orchestrator
//  The NOIZY.AI Multi-Mode AI Agent System
//
//  Modes:
//    🔍 METABEAST   — Scan, catalog, organize audio & video files
//    🧪 TESTBEAST   — Test pipelines, analyze performance, auto-fix
//    📡 COMMS       — Slack & Discord integration, status reports
//    🧠 MENTORBEAST — AI guide, teacher & coding mentor for Rob
//    🎨 CREATIVE    — Marketing asset generation (future)
//
//  "GORUNFREE!!" — R.S. Plowman
// ============================================================================

import { runWorkflow as runMetaBeast } from "./gabriel-metabeast";
import { runTestBeast } from "./gabriel-testbeast";
import { runComms, handleSlackEvent, handleDiscordMessage, broadcastResults } from "./gabriel-comms";
import { runMentor } from "./gabriel-mentor";

// ─────────────────────────────────────────────────────────────────────────────
// GABRIEL MASTER
// ─────────────────────────────────────────────────────────────────────────────

type GabrielCommand = {
  mode: "metabeast" | "testbeast" | "comms" | "mentor" | "auto";
  action: string;
  input: string;
  options?: Record<string, any>;
  notify?: boolean; // Send results to Slack/Discord?
};

export const gabriel = async (command: GabrielCommand) => {
  console.log("══════════════════════════════════════════");
  console.log("🤖 GABRIEL — NOIZY.AI Agent System");
  console.log(`   Mode: ${command.mode.toUpperCase()}`);
  console.log(`   Action: ${command.action}`);
  console.log("══════════════════════════════════════════\n");

  let result: any;

  switch (command.mode) {
    // ── METABEAST: Media Organization ──────────────────────────────
    case "metabeast":
      result = await runMetaBeast({ input_as_text: command.input });
      break;

    // ── TESTBEAST: Testing & Fixing ───────────────────────────────
    case "testbeast":
      result = await runTestBeast({
        mode: (command.options?.testMode as any) || "full",
        input_as_text: command.input,
        pipeline_output: command.options?.pipelineOutput,
      });
      break;

    // ── MENTORBEAST: Teaching & Coding Mentor ──────────────────────
    case "mentor":
      result = await runMentor({
        mode: (command.options?.mentorMode as any) || "full",
        input_as_text: command.input,
        code_to_review: command.options?.code,
      });
      break;

    // ── COMMS: Slack & Discord ────────────────────────────────────
    case "comms":
      if (command.action === "status") {
        result = await runComms({ action: "status_check" });
      } else if (command.action === "parse") {
        result = await runComms({
          action: "parse_command",
          source_platform: command.options?.platform || "slack",
          source_channel: command.options?.channel || "general",
          source_user: command.options?.user || "rob",
          message: command.input,
        });
      } else {
        result = await runComms({
          action: "send_notification",
          pipeline_result: command.input,
          notification_type: command.action,
        });
      }
      break;

    // ── AUTO: Let GABRIEL decide ──────────────────────────────────
    case "auto":
      // Parse the command first via COMMS
      const parsed = await runComms({
        action: "parse_command",
        source_platform: "slack",
        source_channel: "gabriel-auto",
        source_user: "rob",
        message: command.input,
      });

      const intent = (parsed as any)?.parsed_command?.intent;
      const mode = (parsed as any)?.parsed_command?.gabriel_mode;

      console.log(`\n🤖 [AUTO] Detected intent: ${intent} → mode: ${mode}\n`);

      // Route to the right mode
      if (mode === "metabeast" || ["scan", "organize", "search", "tag", "backup"].includes(intent)) {
        result = await runMetaBeast({ input_as_text: command.input });
      } else if (mode === "testbeast" || ["test", "fix"].includes(intent)) {
        result = await runTestBeast({
          mode: intent === "fix" ? "fix_only" : "full",
          input_as_text: command.input,
        });
      } else if (mode === "mentor" || ["learn", "teach", "explain", "how_to"].includes(intent)) {
        result = await runMentor({
          mode: intent === "explain" ? "teach" : intent === "how_to" ? "code" : "full",
          input_as_text: command.input,
        });
      } else {
        result = await runComms({ action: "status_check" });
      }
      break;

    default:
      throw new Error(`Unknown GABRIEL mode: ${command.mode}`);
  }

  // ── OPTIONAL: Broadcast results to Slack/Discord ────────────────
  if (command.notify) {
    console.log("\n📡 Broadcasting results to Slack & Discord...");
    await broadcastResults(result, `${command.mode}_${command.action}`);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("🤖 GABRIEL — COMPLETE");
  console.log("══════════════════════════════════════════");

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — For external integrations
// ─────────────────────────────────────────────────────────────────────────────

export { runMetaBeast } from "./gabriel-metabeast";
export { runTestBeast } from "./gabriel-testbeast";
export { runComms, handleSlackEvent, handleDiscordMessage, broadcastResults } from "./gabriel-comms";
export { runMentor } from "./gabriel-mentor";

// ─────────────────────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = (args[0] || "auto") as GabrielCommand["mode"];
  const input = args.slice(1).join(" ") || "gabriel status";

  gabriel({
    mode,
    action: "run",
    input,
    notify: args.includes("--notify"),
  })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("💥 GABRIEL ERROR:", err.message);
      process.exit(1);
    });
}
