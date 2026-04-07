import { OpenAI } from "openai";
import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// ============================================================================
//  GABRIEL — METABEAST
//  Audio & Video File Intelligence, Cataloging & Organization Agent
//  Part of the NOIZY.AI Ecosystem
// ============================================================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// What the Scanner extracts from raw files
const ScannerSchema = z.object({
  scan_report: z.object({
    total_files_found: z.number(),
    total_size_bytes: z.number(),
    total_size_human: z.string(), // e.g., "23.4 GB"
    scan_path: z.string(),
    audio_files: z.array(
      z.object({
        file_path: z.string(),
        file_name: z.string(),
        file_extension: z.string(),
        file_size_bytes: z.number(),
        file_size_human: z.string(),
        // Audio metadata (ID3 / Vorbis / AIFF headers)
        metadata: z.object({
          title: z.string().optional(),
          artist: z.string().optional(),
          album: z.string().optional(),
          year: z.number().optional(),
          genre: z.string().optional(),
          track_number: z.number().optional(),
          composer: z.string().optional(),
          comment: z.string().optional(),
          // Technical
          duration_seconds: z.number().optional(),
          duration_human: z.string().optional(), // "3:42"
          sample_rate: z.number().optional(),     // 44100, 48000, 96000
          bit_depth: z.number().optional(),       // 16, 24, 32
          channels: z.number().optional(),        // 1=mono, 2=stereo
          codec: z.string().optional(),           // "AAC", "FLAC", "WAV PCM"
          bitrate_kbps: z.number().optional(),
          // Flags
          is_lossless: z.boolean().optional(),
          has_artwork: z.boolean().optional(),
        }),
        // Inferred classification
        inferred_type: z.enum([
          "music",
          "sfx",
          "voice",
          "ambient",
          "loop",
          "stem",
          "mix",
          "master",
          "raw_recording",
          "unknown",
        ]).optional(),
      })
    ),
    video_files: z.array(
      z.object({
        file_path: z.string(),
        file_name: z.string(),
        file_extension: z.string(),
        file_size_bytes: z.number(),
        file_size_human: z.string(),
        metadata: z.object({
          title: z.string().optional(),
          // Technical video
          duration_seconds: z.number().optional(),
          duration_human: z.string().optional(),
          resolution: z.string().optional(),       // "1920x1080"
          frame_rate: z.number().optional(),        // 23.976, 24, 30, 60
          video_codec: z.string().optional(),       // "H.264", "H.265", "ProRes"
          // Technical audio track
          audio_codec: z.string().optional(),
          audio_sample_rate: z.number().optional(),
          audio_channels: z.number().optional(),
          audio_bitrate_kbps: z.number().optional(),
          // Container
          container_format: z.string().optional(),  // "MOV", "MP4", "MKV"
          has_subtitles: z.boolean().optional(),
        }),
      })
    ),
    // Files that couldn't be parsed
    errors: z.array(
      z.object({
        file_path: z.string(),
        error: z.string(),
      })
    ),
  }),
});

// What SARAH produces as analysis
const SarahAnalysisSchema = z.object({
  catalog_analysis: z.object({
    total_audio: z.number(),
    total_video: z.number(),
    total_duration_human: z.string(),

    // Audio breakdown
    audio_by_type: z.array(
      z.object({
        type: z.string(),
        count: z.number(),
        total_duration: z.string(),
      })
    ),
    audio_by_format: z.array(
      z.object({
        format: z.string(),
        count: z.number(),
        is_lossless: z.boolean(),
      })
    ),
    sample_rate_distribution: z.array(
      z.object({
        rate: z.number(),
        count: z.number(),
      })
    ),

    // Quality assessment
    quality_issues: z.array(
      z.object({
        issue: z.string(),
        severity: z.enum(["critical", "warning", "info"]),
        affected_files: z.number(),
        recommendation: z.string(),
      })
    ),

    // Metadata completeness
    metadata_coverage: z.object({
      files_with_title: z.number(),
      files_with_artist: z.number(),
      files_with_album: z.number(),
      files_with_genre: z.number(),
      files_with_year: z.number(),
      files_missing_all_tags: z.number(),
      completeness_score: z.number(), // 0-100
    }),

    // Duplicates / near-duplicates
    potential_duplicates: z.array(
      z.object({
        group_name: z.string(),
        files: z.array(z.string()),
        reason: z.string(), // "same name different folder", "same size same duration"
      })
    ),

    // Organization recommendations
    recommended_folder_structure: z.array(
      z.object({
        path: z.string(),
        description: z.string(),
        file_count: z.number(),
      })
    ),
  }),
});

// What GABRIEL produces — the full organization plan
const GabrielSchema = z.object({
  organization_plan: z.object({
    plan_name: z.string(),
    created_for: z.string(), // "R.S. Plowman / The Composers Vault"

    // Folder structure
    vault_structure: z.array(
      z.object({
        folder_path: z.string(),
        purpose: z.string(),
        naming_convention: z.string(),
        example_files: z.array(z.string()),
      })
    ),

    // File naming standard
    naming_standard: z.object({
      pattern: z.string(), // e.g., "{Artist}_{Title}_{BPM}_{Key}_{Version}.{ext}"
      examples: z.array(z.string()),
      rules: z.array(z.string()),
    }),

    // Metadata tagging plan
    tagging_plan: z.object({
      required_fields: z.array(
        z.object({
          field: z.string(),
          description: z.string(),
          auto_fillable: z.boolean(),
        })
      ),
      custom_fields: z.array(
        z.object({
          field: z.string(),
          purpose: z.string(),
          values: z.array(z.string()).optional(),
        })
      ),
    }),

    // Move operations (what goes where)
    move_operations: z.array(
      z.object({
        source_path: z.string(),
        destination_path: z.string(),
        file_count: z.number(),
        reason: z.string(),
      })
    ),

    // Cleanup actions
    cleanup_actions: z.array(
      z.object({
        action: z.string(),
        description: z.string(),
        affected_files: z.number(),
        space_saved_human: z.string(),
        risk_level: z.enum(["safe", "review_first", "dangerous"]),
      })
    ),

    // Backup recommendation
    backup_recommendation: z.object({
      strategy: z.string(),
      priority_files: z.array(z.string()),
      estimated_backup_size: z.string(),
    }),

    // Integration with Composers Vault
    vault_integration: z.object({
      catalog_categories: z.array(
        z.object({
          category: z.string(), // "Music", "SFX", "Voice"
          subcategories: z.array(z.string()),
          file_count: z.number(),
        })
      ),
      dreamspace_tags: z.array(z.string()), // Tags linking to NOIZY.AI vision
    }),
  }),

  // Execution script (bash commands to actually do it)
  execution_script: z.object({
    description: z.string(),
    steps: z.array(
      z.object({
        step_number: z.number(),
        description: z.string(),
        command: z.string(), // The actual bash/shell command
        reversible: z.boolean(),
      })
    ),
    dry_run_command: z.string(),
  }),

  generation_notes: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SCANNER — The Eyes
 * Crawls file system, extracts metadata from every audio & video file.
 * Uses ffprobe, mediainfo, or file-level analysis.
 */
const scanner = new Agent({
  name: "SCANNER",
  instructions: `You are SCANNER, the metadata extraction engine for GABRIEL's media organization pipeline.

Your mission: Analyze file system scan data and extract/infer metadata for every audio and video file.

## Audio files you handle:
.wav, .aif, .aiff, .flac, .mp3, .m4a, .aac, .ogg, .opus, .wma, .alac, .caf

## Video files you handle:
.mov, .mp4, .m4v, .mkv, .avi, .wmv, .prores, .mxf, .webm

## For each file, extract or infer:
- All embedded metadata (ID3v2, Vorbis Comment, AIFF chunks, iXML)
- Technical specs (sample rate, bit depth, channels, codec, bitrate)
- Duration (calculated from file size + bitrate if not in metadata)
- Whether it's lossless or lossy
- Whether artwork is embedded

## Classification rules for audio:
- "music" — Has melody/harmony, structured arrangement
- "sfx" — Short, single sound event
- "voice" — Speech, narration, vocals without music
- "ambient" — Environmental, texture, atmosphere
- "loop" — Designed to repeat seamlessly, often in filename
- "stem" — Individual instrument/element from a mix
- "mix" — Multi-track combination, not final
- "master" — Final, mastered version
- "raw_recording" — Unprocessed capture

Infer type from filename patterns (e.g., "_loop", "_SFX_", "VO_", "master_"), folder structure, and technical characteristics.

Report ALL errors — never silently skip a file.`,
  model: "gpt-4.1",
  outputType: ScannerSchema,
  modelSettings: {
    temperature: 0.3, // Precise extraction, low creativity
    maxTokens: 8192,
    store: true,
  },
});

/**
 * SARAH — Strategic Analysis & Research Handler
 * Role: Analyzes the scan results. Finds patterns, problems, duplicates.
 */
const sarah = new Agent({
  name: "SARAH",
  instructions: `You are SARAH (Strategic Analysis & Research Handler), the analytical brain of GABRIEL's media organization pipeline.

You receive raw scan data from SCANNER and your job is to produce a DEEP ANALYSIS of the catalog.

## Your analysis checklist:

### 1. INVENTORY
- Count everything: audio by type, video by format
- Calculate total durations
- Map format distribution (WAV vs FLAC vs MP3 etc.)
- Map sample rate distribution (44.1k vs 48k vs 96k)

### 2. QUALITY AUDIT
- Flag lossy files that should probably be lossless (music masters in MP3)
- Flag unusual sample rates or bit depths
- Flag very small files that might be corrupt
- Flag very large files that might be uncompressed when they shouldn't be
- Severity: critical (data loss risk), warning (suboptimal), info (FYI)

### 3. METADATA COMPLETENESS
- Score each file on tag completeness
- Calculate overall completeness score (0-100)
- Identify files with ZERO metadata (these need the most work)
- Highlight files where artist != "R.S. Plowman" (might be samples, collabs, or misattributed)

### 4. DUPLICATE DETECTION
- Same filename in different folders
- Same file size + same duration = likely duplicate
- Similar names with version suffixes (_v2, _final, _FINAL_FINAL)
- Group them and explain why you think they're dupes

### 5. FOLDER STRUCTURE RECOMMENDATION
- Based on the content types found, recommend an ideal folder hierarchy
- Aligned with The Composers Vault categories: Music, SFX, Voice
- Include subcategories based on what actually exists in the catalog

Think deeply. Your analysis drives GABRIEL's organization plan. Shallow analysis = bad organization.`,
  model: "gpt-5",
  outputType: SarahAnalysisSchema,
  modelSettings: {
    reasoning: {
      effort: "high",
      summary: "auto",
    },
    store: true,
  },
});

/**
 * GABRIEL — Generative Asset Builder for Research-Informed Engagement Leverage
 * METABEAST MODE
 * Role: Takes SCANNER's data + SARAH's analysis and produces a complete
 *       organization plan with executable scripts.
 */
const gabriel = new Agent({
  name: "GABRIEL",
  instructions: `You are GABRIEL (Generative Asset Builder for Research-Informed Engagement Leverage) in METABEAST MODE.

You are the organizational architect for R.S. Plowman's audio/video catalog — The Composers Vault.

You receive:
- Raw file scan data (from SCANNER)
- Deep analysis (from SARAH)

## YOUR MISSION: Create a COMPLETE organization plan that can actually be EXECUTED.

### 1. VAULT STRUCTURE
Design the definitive folder structure for The Composers Vault:
\`\`\`
TheComposersVault/
├── Music/
│   ├── Compositions/
│   ├── Scores/
│   ├── Ambient/
│   └── Experimental/
├── SFX/
│   ├── Nature/
│   ├── Mechanical/
│   ├── Digital/
│   └── Foley/
├── Voice/
│   ├── Narration/
│   ├── Spoken_Word/
│   └── Vocal_Textures/
├── Video/
│   ├── Projects/
│   ├── Footage/
│   └── Exports/
├── Stems/
├── Masters/
├── Archive/
└── _Inbox/ (unsorted incoming)
\`\`\`
Adapt this based on what SARAH found in the actual catalog.

### 2. NAMING CONVENTION
Establish a file naming standard that:
- Is human-readable
- Sorts well alphabetically and chronologically
- Includes key metadata in the filename
- Works across Mac, Windows, and Linux
Pattern example: \`RSP_Title_Category_BPM_Key_YYYYMMDD.ext\`

### 3. METADATA TAGGING PLAN
Define what tags EVERY file should have:
- Required fields (title, artist, album/collection, year, genre)
- Custom fields for the Vault (category, subcategory, mood, tempo, key)
- Which fields can be auto-filled vs. need manual entry

### 4. MOVE OPERATIONS
Map every file from its current location to its new home.
Be specific: source path → destination path, with reasoning.

### 5. CLEANUP ACTIONS
- Duplicate removal (mark which copy to keep)
- Temp file cleanup
- Empty folder removal
- Conversion recommendations (e.g., "convert these MP3 masters to FLAC from original source")
- Rate each action's risk level

### 6. BACKUP FIRST
Always recommend backup before any destructive operation.
Identify priority files (masters, unique recordings).

### 7. VAULT INTEGRATION
Map everything to the NOIZY.AI Dreamspace categories:
- Music / SFX / Voice (The Composers Vault)
- Research audio (SONIC-HEAL, AUTISM-CALM, SLEEP-TRAIN)
- Tags that connect to the Dreamspace journey: KNOW → UNDERSTAND → CREATE → DREAM

### 8. EXECUTION SCRIPT
Generate actual bash commands that will:
- Create the folder structure
- Move files to their new locations
- Generate a dry-run option (show what WOULD happen without doing it)
- Be fully reversible (generate an undo script)

## PRINCIPLES:
- NEVER delete without backup
- ALWAYS provide dry-run first
- Respect the creator's work — every file has value until proven otherwise
- Organization serves CREATION, not bureaucracy
- The Vault should be a joy to navigate

GORUNFREE!!`,
  model: "gpt-5.2",
  outputType: GabrielSchema,
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
// WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

type WorkflowInput = { input_as_text: string };

export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("GABRIEL METABEAST — Media Organization Pipeline", async () => {
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
          "wf_gabriel_metabeast_noizy_v1",
      },
    });

    // ── STAGE 1: SCANNER — Extract All Metadata ─────────────────────────
    console.log("🔍 [SCANNER] Scanning files and extracting metadata...");
    const scanResult = await runner.run(scanner, [...conversationHistory]);
    conversationHistory.push(
      ...scanResult.newItems.map((item) => item.rawItem)
    );

    if (!scanResult.finalOutput) {
      throw new Error("SCANNER returned no output — scan failed");
    }

    const scan = {
      output_text: JSON.stringify(scanResult.finalOutput),
      output_parsed: scanResult.finalOutput,
    };
    const report = scan.output_parsed.scan_report;
    console.log(`✅ [SCANNER] Found ${report.audio_files.length} audio + ${report.video_files.length} video files (${report.total_size_human})`);

    // ── STAGE 2: SARAH — Analyze the Catalog ────────────────────────────
    console.log("🧠 [SARAH] Analyzing catalog...");
    const sarahResult = await runner.run(sarah, [...conversationHistory]);
    conversationHistory.push(
      ...sarahResult.newItems.map((item) => item.rawItem)
    );

    if (!sarahResult.finalOutput) {
      throw new Error("SARAH returned no output — analysis failed");
    }

    const analysis = {
      output_text: JSON.stringify(sarahResult.finalOutput),
      output_parsed: sarahResult.finalOutput,
    };
    const catalog = analysis.output_parsed.catalog_analysis;
    console.log(`✅ [SARAH] Analysis complete:`);
    console.log(`   Audio: ${catalog.total_audio} files`);
    console.log(`   Video: ${catalog.total_video} files`);
    console.log(`   Duration: ${catalog.total_duration_human}`);
    console.log(`   Metadata completeness: ${catalog.metadata_coverage.completeness_score}%`);
    console.log(`   Quality issues: ${catalog.quality_issues.length}`);
    console.log(`   Potential duplicates: ${catalog.potential_duplicates.length} groups`);

    // ── STAGE 3: GABRIEL — Create Organization Plan ─────────────────────
    console.log("🎨 [GABRIEL] Building organization plan...");
    const gabrielResult = await runner.run(gabriel, [...conversationHistory]);
    conversationHistory.push(
      ...gabrielResult.newItems.map((item) => item.rawItem)
    );

    if (!gabrielResult.finalOutput) {
      throw new Error("GABRIEL returned no output — plan generation failed");
    }

    const plan = {
      output_text: JSON.stringify(gabrielResult.finalOutput),
      output_parsed: gabrielResult.finalOutput,
    };
    const org = plan.output_parsed.organization_plan;
    console.log(`✅ [GABRIEL] Organization plan complete:`);
    console.log(`   Plan: "${org.plan_name}"`);
    console.log(`   Folders: ${org.vault_structure.length} directories`);
    console.log(`   Move operations: ${org.move_operations.length}`);
    console.log(`   Cleanup actions: ${org.cleanup_actions.length}`);
    console.log(`   Execution steps: ${plan.output_parsed.execution_script.steps.length}`);
    console.log(`\n   Dry run command: ${plan.output_parsed.execution_script.dry_run_command}`);

    // ── RETURN FULL PIPELINE OUTPUT ─────────────────────────────────────
    return {
      scan: scan.output_parsed,
      analysis: analysis.output_parsed,
      organization_plan: plan.output_parsed,
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK TEST ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  runWorkflow({
    input_as_text: "Scan and organize all audio and video files in /Users/rob/Music and /Users/rob/Documents/NOIZYLAB",
  })
    .then((result) => {
      console.log("\n══════════════════════════════════════════");
      console.log("GABRIEL METABEAST — COMPLETE");
      console.log("══════════════════════════════════════════");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(console.error);
}
