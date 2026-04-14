---
description: Export and seal the current session as tamper-evident provenance.
---

# session-proof

Export the current session's notes, markers, and tool activity into a sealed, tamper-evident artifact using SHA-256 integrity.

## What this does

1. Reads the current session's `.session/<SESSION_ID>/` directory
2. Finalizes `notes.ndjson` and `markers.ndjson`
3. Builds `manifest.json` with the proof envelope
4. Writes `seal.sha256` = SHA-256(canonicalize(manifest.json))
5. Verifies the seal immediately after writing

## Output structure

```
.session/<SESSION_ID>/
├── notes.ndjson      — operator notes (append-only, one record per line)
├── markers.ndjson    — temporal markers (append-only)
├── manifest.json     — proof envelope
└── seal.sha256       — SHA-256 of manifest.json (canonical)
```

## Manifest fields

| Field                | Description                       |
| -------------------- | --------------------------------- |
| `session_id`         | Unique session identifier         |
| `started_at`         | ISO 8601 session start            |
| `ended_at`           | ISO 8601 seal time                |
| `model`              | Model used in session             |
| `active_mcp_servers` | MCP servers active during session |
| `tool_invocations`   | Count of tool calls               |
| `operator_mode`      | `local` or `remote`               |
| `export_version`     | Package semver                    |
| `integrity`          | Always `"sha256"`                 |

## Usage

### Start a new session (beginning of work)

```bash
cd /Users/m2ultra/NOIZYANTHROPIC
node packages/session-proof/cli.mjs new --model claude-opus-4-5 --mode local
```

### Add notes during session

```bash
node packages/session-proof/cli.mjs note <SESSION_ID> "Completed Phase 4 Cloud Run deploy"
node packages/session-proof/cli.mjs marker <SESSION_ID> "DEPLOY_COMPLETE"
```

### Seal at end of session

```bash
node packages/session-proof/cli.mjs seal <SESSION_ID> --invocations 42
```

### Verify anytime

```bash
node packages/session-proof/cli.mjs verify <SESSION_ID>
```

### Full export (seal + verify in one step)

```bash
node packages/session-proof/cli.mjs export <SESSION_ID> --invocations 42
```

## Integrity model

> **Tamper-evident export. Not legal notarization.**

The SHA-256 seal backs integrity. The manifest gives context.  
If anyone modifies `manifest.json` after sealing, `verify` will detect it.

```
seal.sha256 = SHA-256(JSON.stringify(manifest, sortedKeys))
```

Standard: NIST FIPS 180-4 SHA-256.

## Operator rules

- Seal is **operator-invoked** — never automatic during live sessions
- Notes/markers are **append-only** — no edits after writing
- Recall from sealed sessions is **post-session only** (see Phase 6)
- Never inject sealed session content into live creative sessions automatically
