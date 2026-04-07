#!/usr/bin/env node
/**
 * NOIZY Claude — Hot-rodded utility MCP server.
 *
 * Every major Anthropic API capability exposed as MCP tools:
 *   noizy_ask       — General purpose (model, effort, system prompt, caching)
 *   noizy_think     — Extended thinking for complex reasoning
 *   noizy_search    — Web-search-powered answers with citations
 *   noizy_code      — Sandboxed code execution
 *   noizy_extract   — Structured JSON extraction (guaranteed schema)
 *   noizy_vision    — Image + PDF analysis
 *   noizy_summarize — Summarize with source citations
 *   noizy_batch     — Submit batch jobs for bulk processing
 *   noizy_models    — List available Claude models
 *   noizy_tokens    — Count tokens before sending
 */

import Anthropic from "@anthropic-ai/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MODELS = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
] as const;

type ModelId = (typeof MODELS)[number] | string;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickModel(model?: string): ModelId {
  if (model && MODELS.includes(model as any)) return model;
  if (model) return model; // allow arbitrary model strings
  return DEFAULT_MODEL;
}

function textFromResponse(response: Anthropic.Message): string {
  const parts: string[] = [];
  for (const block of response.content) {
    if (block.type === "text") parts.push(block.text);
    if (block.type === "thinking" && "thinking" in block)
      parts.push(`<thinking>\n${(block as any).thinking}\n</thinking>`);
  }
  return parts.join("\n\n");
}

function usageString(response: Anthropic.Message): string {
  const u = response.usage;
  const cached = (u as any).cache_read_input_tokens ?? 0;
  const cacheCreated = (u as any).cache_creation_input_tokens ?? 0;
  return [
    `tokens: ${u.input_tokens} in → ${u.output_tokens} out`,
    cached ? `(${cached} cached read)` : "",
    cacheCreated ? `(${cacheCreated} cache write)` : "",
    `model: ${response.model}`,
    `stop: ${response.stop_reason}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({
  name: "noizy-claude",
  version: "1.0.0",
});

// ===== noizy_ask =====
server.tool(
  "noizy_ask",
  "General-purpose Claude query with full control — model, effort, system prompt, prompt caching. Your Swiss Army knife.",
  {
    prompt: z.string().describe("The user prompt to send to Claude"),
    system: z
      .string()
      .optional()
      .describe("System prompt to set Claude's behavior"),
    model: z
      .string()
      .optional()
      .describe(
        "Model ID (default: claude-sonnet-4-6). Options: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001",
      ),
    effort: z
      .enum(["low", "medium", "high", "max"])
      .optional()
      .describe(
        "Effort level — low (fast/cheap), medium (balanced), high (default), max (full power)",
      ),
    max_tokens: z
      .number()
      .optional()
      .describe("Max output tokens (default: 4096)"),
    temperature: z
      .number()
      .optional()
      .describe("Temperature 0.0-1.0 (default: 1.0)"),
    cache: z
      .boolean()
      .optional()
      .describe(
        "Enable automatic prompt caching (saves cost on repeated prefixes)",
      ),
  },
  async ({ prompt, system, model, effort, max_tokens, temperature, cache }) => {
    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 4096,
      messages: [{ role: "user" as const, content: prompt }],
    };
    if (system) params.system = system;
    if (effort) params.effort = { type: effort };
    if (temperature !== undefined) params.temperature = temperature;
    if (cache) params.cache_control = { type: "ephemeral" };

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_think =====
server.tool(
  "noizy_think",
  "Extended thinking mode — Claude shows its reasoning chain before answering. Best for math, logic, code architecture, and complex analysis.",
  {
    prompt: z.string().describe("The problem to think through"),
    system: z.string().optional().describe("System prompt"),
    model: z
      .string()
      .optional()
      .describe("Model ID (default: claude-sonnet-4-6)"),
    budget_tokens: z
      .number()
      .optional()
      .describe(
        "Max thinking tokens (default: 10000). Higher = deeper reasoning.",
      ),
    max_tokens: z
      .number()
      .optional()
      .describe("Max total output tokens (default: 16000)"),
  },
  async ({ prompt, system, model, budget_tokens, max_tokens }) => {
    const chosenModel = pickModel(model);
    const isOpus46 = chosenModel.includes("opus-4-6");

    const params: any = {
      model: chosenModel,
      max_tokens: max_tokens ?? 16000,
      messages: [{ role: "user" as const, content: prompt }],
      thinking: isOpus46
        ? { type: "adaptive" }
        : { type: "enabled", budget_tokens: budget_tokens ?? 10000 },
    };
    if (system) params.system = system;

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_search =====
server.tool(
  "noizy_search",
  "Web-search-powered Claude — answers questions using live internet data with source citations. Great for current events, docs lookup, fact-checking.",
  {
    query: z.string().describe("The question to answer using web search"),
    system: z.string().optional().describe("System prompt"),
    model: z.string().optional().describe("Model ID"),
    max_searches: z
      .number()
      .optional()
      .describe("Max number of web searches (default: 5)"),
    allowed_domains: z
      .array(z.string())
      .optional()
      .describe("Only search these domains (e.g. ['docs.anthropic.com'])"),
    blocked_domains: z
      .array(z.string())
      .optional()
      .describe("Never search these domains"),
  },
  async ({
    query,
    system,
    model,
    max_searches,
    allowed_domains,
    blocked_domains,
  }) => {
    const webSearchTool: any = {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: max_searches ?? 5,
    };
    if (allowed_domains?.length)
      webSearchTool.allowed_domains = allowed_domains;
    if (blocked_domains?.length)
      webSearchTool.blocked_domains = blocked_domains;

    const params: any = {
      model: pickModel(model),
      max_tokens: 4096,
      messages: [{ role: "user" as const, content: query }],
      tools: [webSearchTool],
    };
    if (system) params.system = system;

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_code =====
server.tool(
  "noizy_code",
  "Sandboxed code execution — Claude writes and runs code in a secure container. Returns results, charts, calculations. Supports bash + file ops.",
  {
    task: z
      .string()
      .describe(
        "What you want Claude to compute, analyze, or build in the sandbox",
      ),
    system: z.string().optional().describe("System prompt"),
    model: z.string().optional().describe("Model ID"),
    max_tokens: z.number().optional().describe("Max tokens (default: 8192)"),
  },
  async ({ task, system, model, max_tokens }) => {
    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 8192,
      messages: [{ role: "user" as const, content: task }],
      tools: [{ type: "code_execution_20250825", name: "code_execution" }],
    };
    if (system) params.system = system;

    const response = await anthropic.messages.create(params);

    // Collect all text + code execution results
    const parts: string[] = [];
    for (const block of response.content) {
      if (block.type === "text") parts.push(block.text);
      if (block.type === "tool_use") {
        parts.push(
          `\`\`\`tool_use: ${block.name}\n${JSON.stringify(block.input, null, 2)}\n\`\`\``,
        );
      }
    }

    return {
      content: [
        { type: "text" as const, text: parts.join("\n\n") },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_extract =====
server.tool(
  "noizy_extract",
  "Structured JSON extraction — guaranteed valid JSON matching your schema. Perfect for data extraction, form parsing, API responses.",
  {
    prompt: z.string().describe("The text or instructions for data extraction"),
    schema: z
      .string()
      .describe(
        'JSON Schema as a string, e.g. \'{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}\'',
      ),
    model: z.string().optional().describe("Model ID"),
    max_tokens: z.number().optional().describe("Max tokens (default: 4096)"),
  },
  async ({ prompt, schema, model, max_tokens }) => {
    let parsedSchema: any;
    try {
      parsedSchema = JSON.parse(schema);
    } catch {
      return {
        content: [
          {
            type: "text" as const,
            text: "ERROR: Invalid JSON schema. Please provide valid JSON.",
          },
        ],
      };
    }

    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 4096,
      messages: [{ role: "user" as const, content: prompt }],
      output_config: {
        format: {
          type: "json_schema",
          schema: parsedSchema,
        },
      },
    };

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_vision =====
server.tool(
  "noizy_vision",
  "Image + PDF analysis — send a local file or URL to Claude for visual understanding, OCR, diagram reading, screenshot analysis.",
  {
    prompt: z.string().describe("What to analyze about the image/PDF"),
    image_path: z
      .string()
      .optional()
      .describe("Absolute path to a local image file (jpg/png/gif/webp)"),
    image_url: z.string().optional().describe("URL of an image to analyze"),
    model: z.string().optional().describe("Model ID"),
    max_tokens: z.number().optional().describe("Max tokens (default: 4096)"),
  },
  async ({ prompt, image_path, image_url, model, max_tokens }) => {
    const content: any[] = [];

    if (image_path) {
      const abs = path.resolve(image_path);
      if (!fs.existsSync(abs)) {
        return {
          content: [
            { type: "text" as const, text: `ERROR: File not found: ${abs}` },
          ],
        };
      }
      const data = fs.readFileSync(abs);
      const ext = path.extname(abs).toLowerCase().replace(".", "");
      const mediaMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        pdf: "application/pdf",
      };
      const mediaType = mediaMap[ext] || "image/png";

      if (ext === "pdf") {
        content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: data.toString("base64"),
          },
        });
      } else {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: data.toString("base64"),
          },
        });
      }
    } else if (image_url) {
      content.push({
        type: "image",
        source: { type: "url", url: image_url },
      });
    }

    content.push({ type: "text", text: prompt });

    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 4096,
      messages: [{ role: "user" as const, content }],
    };

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_summarize =====
server.tool(
  "noizy_summarize",
  "Summarize text with source citations — Claude cites exact passages from your document. Great for research, legal docs, long articles.",
  {
    document: z.string().describe("The full text to summarize"),
    instructions: z
      .string()
      .optional()
      .describe(
        "Specific summarization instructions (e.g. 'focus on financials')",
      ),
    model: z.string().optional().describe("Model ID"),
    max_tokens: z.number().optional().describe("Max tokens (default: 4096)"),
  },
  async ({ document, instructions, model, max_tokens }) => {
    const userPrompt = instructions
      ? `${instructions}\n\nDocument:\n${document}`
      : `Summarize this document with citations:\n\n${document}`;

    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 4096,
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "document",
              source: { type: "text", text: document },
              title: "Source Document",
              citations: { enabled: true },
            },
            {
              type: "text",
              text:
                instructions ||
                "Provide a comprehensive summary with citations to the source document.",
            },
          ],
        },
      ],
    };

    const response = await anthropic.messages.create(params);

    // Format citations in response
    const parts: string[] = [];
    for (const block of response.content) {
      if (block.type === "text") {
        parts.push(block.text);
        if ("citations" in block && Array.isArray((block as any).citations)) {
          for (const cite of (block as any).citations) {
            parts.push(
              `  [citation: "${cite.cited_text?.substring(0, 80)}..."]`,
            );
          }
        }
      }
    }

    return {
      content: [
        { type: "text" as const, text: parts.join("\n") },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ===== noizy_batch =====
server.tool(
  "noizy_batch",
  "Batch processing — submit multiple prompts for async bulk processing at 50% cost discount. Returns a batch ID to check later.",
  {
    prompts: z
      .array(z.string())
      .describe("Array of prompts to process in batch"),
    system: z.string().optional().describe("Shared system prompt for all"),
    model: z.string().optional().describe("Model ID"),
    max_tokens: z
      .number()
      .optional()
      .describe("Max tokens per response (default: 1024)"),
  },
  async ({ prompts, system, model, max_tokens }) => {
    const chosenModel = pickModel(model);
    const requests = prompts.map((prompt, i) => {
      const params: any = {
        model: chosenModel,
        max_tokens: max_tokens ?? 1024,
        messages: [{ role: "user" as const, content: prompt }],
      };
      if (system) params.system = system;
      return {
        custom_id: `noizy-batch-${i}`,
        params,
      };
    });

    const batch = await anthropic.messages.batches.create({ requests });

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Batch submitted successfully!`,
            `  ID: ${batch.id}`,
            `  Requests: ${prompts.length}`,
            `  Status: ${batch.processing_status}`,
            `  Created: ${batch.created_at}`,
            ``,
            `Use noizy_batch_status with this ID to check results.`,
          ].join("\n"),
        },
      ],
    };
  },
);

// ===== noizy_batch_status =====
server.tool(
  "noizy_batch_status",
  "Check the status of a batch job and retrieve results when complete.",
  {
    batch_id: z.string().describe("The batch ID from noizy_batch"),
  },
  async ({ batch_id }) => {
    const batch = await anthropic.messages.batches.retrieve(batch_id);
    const lines = [
      `Batch: ${batch.id}`,
      `Status: ${batch.processing_status}`,
      `Created: ${batch.created_at}`,
    ];

    if (batch.processing_status === "ended") {
      lines.push(`\nResults:`);
      const results: string[] = [];
      const resultsStream = await anthropic.messages.batches.results(batch_id);
      for await (const result of resultsStream) {
        const id = result.custom_id;
        if (result.result.type === "succeeded") {
          const text = textFromResponse(result.result.message);
          results.push(
            `[${id}] ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`,
          );
        } else {
          results.push(`[${id}] ERROR: ${result.result.type}`);
        }
      }
      lines.push(results.join("\n\n"));
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

// ===== noizy_models =====
server.tool(
  "noizy_models",
  "List available Claude models with capabilities and pricing tier.",
  {},
  async () => {
    const models = [
      {
        id: "claude-opus-4-6",
        tier: "FLAGSHIP",
        notes: "Most capable. Adaptive thinking. 200K context.",
      },
      {
        id: "claude-sonnet-4-6",
        tier: "BALANCED",
        notes: "Best value. Extended thinking + interleaved. 200K context.",
      },
      {
        id: "claude-sonnet-4-5-20250929",
        tier: "BALANCED",
        notes: "Previous gen Sonnet. Extended thinking. 200K context.",
      },
      {
        id: "claude-haiku-4-5-20251001",
        tier: "FAST",
        notes: "Fastest + cheapest. Extended thinking. 200K context.",
      },
    ];

    const lines = models.map(
      (m) => `${m.tier.padEnd(10)} ${m.id.padEnd(35)} ${m.notes}`,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Available Claude Models:\n${"─".repeat(80)}\n${lines.join("\n")}`,
        },
      ],
    };
  },
);

// ===== noizy_tokens =====
server.tool(
  "noizy_tokens",
  "Count tokens for a message before sending — helps estimate cost and check context window fit.",
  {
    text: z.string().describe("Text to count tokens for"),
    model: z.string().optional().describe("Model ID"),
    system: z.string().optional().describe("System prompt to include in count"),
  },
  async ({ text, model, system }) => {
    const params: any = {
      model: pickModel(model),
      messages: [{ role: "user" as const, content: text }],
    };
    if (system) params.system = system;

    const result = await anthropic.messages.countTokens(params);

    return {
      content: [
        {
          type: "text" as const,
          text: `Token count: ${result.input_tokens} input tokens\nModel: ${pickModel(model)}`,
        },
      ],
    };
  },
);

// ===== noizy_multi =====
server.tool(
  "noizy_multi",
  "Multi-turn conversation — send a full conversation history to Claude. Supports alternating user/assistant messages.",
  {
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        }),
      )
      .describe("Array of {role, content} messages"),
    system: z.string().optional().describe("System prompt"),
    model: z.string().optional().describe("Model ID"),
    effort: z
      .enum(["low", "medium", "high", "max"])
      .optional()
      .describe("Effort level"),
    max_tokens: z.number().optional().describe("Max tokens (default: 4096)"),
  },
  async ({ messages, system, model, effort, max_tokens }) => {
    const params: any = {
      model: pickModel(model),
      max_tokens: max_tokens ?? 4096,
      messages,
    };
    if (system) params.system = system;
    if (effort) params.effort = { type: effort };

    const response = await anthropic.messages.create(params);
    return {
      content: [
        { type: "text" as const, text: textFromResponse(response) },
        { type: "text" as const, text: `\n---\n${usageString(response)}` },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NOIZY Claude MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
