/**
 * NOIZYFISH Search API
 * /search endpoint for provenance-verified audio discovery
 */

import { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Env {
  AUDIT_DB: D1Database;
  AUDIO_BUCKET: R2Bucket;
  SESSION_CACHE: KVNamespace;
  NOIZY_API_KEY: string;
}

interface SearchQuery {
  q?: string;           // Full text query: "grit9 140bpm Am"
  bpm_min?: number;
  bpm_max?: number;
  key?: string;         // Musical key: "Am", "C", "F#m"
  mood?: string;        // Mood: "energetic", "calm", "dark"
  tags?: string[];
  verified_only?: boolean;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  title: string;
  duration_seconds: number;
  bpm: number | null;
  key: string | null;
  mood: string | null;
  tags: string[];
  provenance: {
    status: "verified" | "pending" | "unverified";
    c2pa_present: boolean;
    proof_id: string | null;
    proof_policy: string | null;
    verified_at: string | null;
  };
  consent: {
    status: "ACTIVE" | "REVOKED" | "PENDING";
    creator_id: string | null;
  };
  preview_url: string | null;
  ingested_at: string;
}

interface SearchResponse {
  success: boolean;
  query: SearchQuery;
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function handleSearch(
  request: Request,
  env: Env
): Promise<Response> {
  // Parse query parameters
  const url = new URL(request.url);
  const query = parseSearchQuery(url.searchParams);

  // Validate request
  if (!query.q && !query.bpm_min && !query.key && !query.mood && !query.tags) {
    return jsonResponse({
      success: false,
      error: "At least one search parameter required",
      timestamp: new Date().toISOString(),
    }, 400);
  }

  try {
    // Build SQL query
    const { sql, params } = buildSearchQuery(query);

    // Execute search
    const dbResults = await env.AUDIT_DB.prepare(sql).bind(...params).all();

    // Transform results
    const results: SearchResult[] = (dbResults.results || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      duration_seconds: row.duration_seconds,
      bpm: row.bpm,
      key: row.key,
      mood: row.mood,
      tags: row.tags ? JSON.parse(row.tags) : [],
      provenance: {
        status: row.origin_verified ? "verified" : "pending",
        c2pa_present: !!row.c2pa_manifest,
        proof_id: row.proof_id,
        proof_policy: row.proof_id ? "REAL_HUMAN_ORIGIN" : null,
        verified_at: row.proof_id ? row.ingested_at : null,
      },
      consent: {
        status: row.consent_status || "PENDING",
        creator_id: row.creator_id,
      },
      preview_url: row.r2_key ? `/preview/${row.id}` : null,
      ingested_at: row.ingested_at,
    }));

    // Build response
    const response: SearchResponse = {
      success: true,
      query,
      results,
      total: results.length,
      limit: query.limit || 20,
      offset: query.offset || 0,
      timestamp: new Date().toISOString(),
    };

    return jsonResponse(response);
  } catch (error) {
    console.error("Search error:", error);
    return jsonResponse({
      success: false,
      error: "Search failed",
      timestamp: new Date().toISOString(),
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY PARSING
// ═══════════════════════════════════════════════════════════════════════════

function parseSearchQuery(params: URLSearchParams): SearchQuery {
  const q = params.get("q") || undefined;

  // Parse structured query from q parameter
  // Example: "grit9 140bpm Am" -> extract bpm and key
  let parsedBpm: number | undefined;
  let parsedKey: string | undefined;

  if (q) {
    // Extract BPM pattern (e.g., "140bpm", "120 bpm")
    const bpmMatch = q.match(/(\d{2,3})\s*bpm/i);
    if (bpmMatch) {
      parsedBpm = parseInt(bpmMatch[1], 10);
    }

    // Extract key pattern (e.g., "Am", "C", "F#m", "Bb")
    const keyMatch = q.match(/\b([A-G][#b]?m?)\b/);
    if (keyMatch) {
      parsedKey = keyMatch[1];
    }
  }

  return {
    q,
    bpm_min: params.get("bpm_min") ? parseInt(params.get("bpm_min")!, 10) : parsedBpm ? parsedBpm - 5 : undefined,
    bpm_max: params.get("bpm_max") ? parseInt(params.get("bpm_max")!, 10) : parsedBpm ? parsedBpm + 5 : undefined,
    key: params.get("key") || parsedKey,
    mood: params.get("mood") || undefined,
    tags: params.get("tags")?.split(",").map(t => t.trim()),
    verified_only: params.get("verified_only") === "true",
    limit: Math.min(parseInt(params.get("limit") || "20", 10), 100),
    offset: parseInt(params.get("offset") || "0", 10),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SQL QUERY BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildSearchQuery(query: SearchQuery): { sql: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Full text search on title and tags
  if (query.q) {
    // Remove structured parts (bpm, key) from text search
    const cleanQuery = query.q
      .replace(/\d{2,3}\s*bpm/gi, "")
      .replace(/\b[A-G][#b]?m?\b/g, "")
      .trim();

    if (cleanQuery) {
      conditions.push(`(title LIKE ?${paramIndex} OR tags LIKE ?${paramIndex + 1})`);
      params.push(`%${cleanQuery}%`, `%${cleanQuery}%`);
      paramIndex += 2;
    }
  }

  // BPM range
  if (query.bpm_min !== undefined) {
    conditions.push(`bpm >= ?${paramIndex}`);
    params.push(query.bpm_min);
    paramIndex++;
  }
  if (query.bpm_max !== undefined) {
    conditions.push(`bpm <= ?${paramIndex}`);
    params.push(query.bpm_max);
    paramIndex++;
  }

  // Key filter
  if (query.key) {
    conditions.push(`key = ?${paramIndex}`);
    params.push(query.key);
    paramIndex++;
  }

  // Mood filter
  if (query.mood) {
    conditions.push(`mood = ?${paramIndex}`);
    params.push(query.mood);
    paramIndex++;
  }

  // Tags filter
  if (query.tags && query.tags.length > 0) {
    const tagConditions = query.tags.map((_, i) => {
      params.push(`%${query.tags![i]}%`);
      return `tags LIKE ?${paramIndex + i}`;
    });
    conditions.push(`(${tagConditions.join(" OR ")})`);
    paramIndex += query.tags.length;
  }

  // Verified only
  if (query.verified_only) {
    conditions.push("origin_verified = 1");
  }

  // Active consent only
  conditions.push("consent_status = 'ACTIVE'");

  // Build final SQL
  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const sql = `
    SELECT
      id, title, r2_key, duration_seconds, bpm, key, mood, tags,
      origin_verified, c2pa_manifest, proof_id, creator_id, consent_status,
      ingested_at
    FROM assets
    ${whereClause}
    ORDER BY ingested_at DESC
    LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}
  `;

  params.push(query.limit || 20, query.offset || 0);

  return { sql, params };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE HELPER
// ═══════════════════════════════════════════════════════════════════════════

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE SCHEMA (for documentation)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search Response JSON Schema:
 *
 * {
 *   "success": boolean,
 *   "query": {
 *     "q": string | null,
 *     "bpm_min": number | null,
 *     "bpm_max": number | null,
 *     "key": string | null,
 *     "mood": string | null,
 *     "tags": string[] | null,
 *     "verified_only": boolean,
 *     "limit": number,
 *     "offset": number
 *   },
 *   "results": [
 *     {
 *       "id": string,
 *       "title": string,
 *       "duration_seconds": number,
 *       "bpm": number | null,
 *       "key": string | null,
 *       "mood": string | null,
 *       "tags": string[],
 *       "provenance": {
 *         "status": "verified" | "pending" | "unverified",
 *         "c2pa_present": boolean,
 *         "proof_id": string | null,
 *         "proof_policy": string | null,
 *         "verified_at": string | null
 *       },
 *       "consent": {
 *         "status": "ACTIVE" | "REVOKED" | "PENDING",
 *         "creator_id": string | null
 *       },
 *       "preview_url": string | null,
 *       "ingested_at": string
 *     }
 *   ],
 *   "total": number,
 *   "limit": number,
 *   "offset": number,
 *   "timestamp": string
 * }
 */
