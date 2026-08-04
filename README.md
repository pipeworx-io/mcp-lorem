# mcp-lorem

Lorem MCP — placeholder text, generated locally.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `generate_paragraphs` | Generate placeholder text paragraphs for mockups and layout testing. Returns plain text without formatting. |
| `generate_with_options` | Generate formatted placeholder text with headers, code blocks, and lists (HTML). Specify which elements to include: headers, code blocks, unordered lists, ordered lists. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "lorem": {
      "url": "https://gateway.pipeworx.io/lorem/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Lorem data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
