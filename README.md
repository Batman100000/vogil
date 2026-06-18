# VOGIL - Israel Government Data Integration

VOGIL is a project that integrates with Israel's government data portal (data.gov.il) using the `data-gov-il-mcp` Model Context Protocol server.

## Setup

### Local MCP Configuration

The project is configured to run `data-gov-il-mcp` in **local stdio mode** for use with Claude Code.

**Configuration files:**
- `.claude/mcp.json` - MCP server configuration
- `.env` - Environment variables for the MCP server

### Installation

```bash
npm install
```

This will install `data-gov-il-mcp` as a dependency.

### Running

The MCP server will be automatically launched by Claude Code when using this project, since it's configured in `.claude/mcp.json`.

## Environment Variables

The `.env` file contains default settings:

- `TRANSPORT=stdio` - Local mode (required for Claude Code integration)
- `CKAN_BASE_URL=https://data.gov.il/api/3/action` - Israel's data portal API
- `CACHE_TTL_MS=300000` - 5-minute cache for API responses
- `LOG_LEVEL=info` - Logging level

### Optional Features

Enable in `.env`:
- `MCP_ENABLE_ELICITATION=true` - Interactive dataset clarification
- `MCP_ENABLE_SAMPLING=true` - Dataset summarization

## Data Sources

This project connects to Israel's government data portal with datasets including:
- Statistical data
- Government transparency data
- Public records
- Open datasets

## Next Steps

1. Decide on the specific use case for VOGIL
2. Implement application logic (CLI, Web API, Data processor, etc.)
3. Use the MCP tools to query and analyze government datasets
