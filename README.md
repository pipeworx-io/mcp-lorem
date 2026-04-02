# mcp-lorem

MCP server for lorem ipsum placeholder text via [loripsum.net](https://loripsum.net/). No authentication required.

## Tools

| Tool | Description |
|------|-------------|
| `generate_paragraphs` | Generate plain-text lorem ipsum paragraphs |
| `generate_with_options` | Generate lorem ipsum HTML with headers, code blocks, and lists |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "lorem_generate_paragraphs",
      "arguments": { "count": 3, "length": "medium" }
    },
    "id": 1
  }'
```

## License

MIT
