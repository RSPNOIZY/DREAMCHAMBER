# NOIZY Architecture

## System Overview

NOIZY is a distributed multi-agent orchestration platform for creators.

```
 Creators
    |
    v
[Claude Prompt Toolkit] <-- noizyempire-claude
    |
    v
[Agent Orchestration] <-- dreamchamber
    |
    +--> [Audio Processing] <-- noizybeast
    |
    v
[MCP Framework] <-- mcp-framework
    |
    +--> [Audio MCP Server] <-- dreamchamber-audio-mcp
    |
    +--> [Gemma3 Inference] <-- mcp-gemma3
    |
    v
[Swift Runtime] <-- swift-library
    |
    v
[Creator Output]
```

## Component Roles

### MCP Servers (dreamchamber-audio-mcp, mcp-gemma3)
- Expose capabilities to Agent Framework
- Handle protocol negotiations
- Manage streaming and real-time ops

### Agent Framework (dreamchamber)
- Orchestrates multi-step workflows
- Routes between tools/MCP servers
- Manages state and memory

### Agent Apps (noizybeast)
- Specialized for audio/media processing
- Builds on framework abstractions
- Extends with custom logic

### Toolkits (noizyempire-claude)
- Provides prompt engineering patterns
- API + CLI interfaces
- Storage for learned knowledge

### Utilities (swift-library)
- Performance-critical code
- Native platform integration
- Cross-project dependencies

## Migration Strategy

Mirror-based with instant rollback:
1. Git clone --mirror (preserves all refs/tags)
2. Push to noizy-ai org repos
3. Archive mirrors on FISH volume
4. Verify refs match source

Rollback = one git push --mirror command from archive.

---
Last Updated: March 29, 2026
