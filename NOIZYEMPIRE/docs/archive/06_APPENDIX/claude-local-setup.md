# Claude Local Setup

## Summary

If your goal is to work with Claude on the NOIZY archive and local workspace, you do not need to depend on a Claude.ai organization auth URL.

That URL is for remote MCP authorization.

For local work, the faster path is local stdio MCP servers.

## What Is Already Wired

The local MCP config at [`.vscode/mcp.json`](../../.vscode/mcp.json) now includes:

- `noizy-archive` for the archive only
- `noizylab-workspace` for the full workspace
- `noizy-memory` for lightweight memory/state
- `microsoft/markitdown` for document conversion

## When To Use Each Path

### Use Local MCP

Use local MCP when you want Claude to:

- read the NOIZY archive
- inspect local code
- navigate product specs
- work against the M2 Ultra workspace directly

This is the default best path for product and research work.

### Use Claude.ai Auth URLs

Use the Claude.ai auth flow only when you want to connect Claude to:

- remote SaaS tools
- organization-scoped connectors
- services that require browser-based OAuth

Those flows must be completed in your own browser session.

## Practical Setup

1. Open the workspace in the client that reads [`.vscode/mcp.json`](../../.vscode/mcp.json).
2. Let the MCP servers start.
3. Point Claude at:
   - [00_INDEX.md](../00_INDEX.md)
   - [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
   - [theme-index.md](./theme-index.md)

## Recommended First Prompt

```text
Read 00_INDEX.md, NOIZY_WORLD_MASTER_ARCHIVE.md, and theme-index.md.
Then summarize the current NOIZY system and identify the next product artifact to build.
```

## Next Upgrade

If needed, add a custom NOIZY MCP server later for:

- archive search
- project/date grouping
- note ingestion
- promotion of raw notes into canonical docs
