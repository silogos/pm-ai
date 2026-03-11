#!/bin/bash

# Test PM-AI MCP Server
echo "Testing PM-AI MCP Server..."
echo ""

# Start MCP server and send a test request
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | node apps/mcp/dist/index.js

echo ""
echo "--- Done ---"
