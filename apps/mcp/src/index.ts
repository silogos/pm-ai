import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { init } from '@pm-ai/core';
import { isProduction } from '@pm-ai/utils';
import { registerTools } from './mcp/tools/index.js';
import { registerPrompts } from './mcp/prompts/index.js';
import { registerResources } from './mcp/resources/index.js';
import { getConfig } from '@pm-ai/config';
import { copyTemplateDatabase } from '@pm-ai/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.error('Starting PM-AI MCP Server...');

  if (!isProduction()) {
    console.error('🔧 Development mode - verbose logging enabled');
  }

  const config = getConfig();

  console.error('ℹ️  Dashboard server will spawn on-demand using pm-ai server command');

  // Check if CLAUDE.md exists and has PM-AI section
  const claudeMdPath = process.cwd() + '/CLAUDE.md';
  const claudeMdExists = fs.existsSync(claudeMdPath);

  if (claudeMdExists) {
    const claudeMdContent = fs.readFileSync(claudeMdPath, 'utf-8');
    if (!claudeMdContent.includes('PM-AI')) {
      console.error('⚠️  Warning: CLAUDE.md exists but PM-AI section not found.');
      console.error('⚠️  Please run inject_claude_md tool first to add PM-AI workflow.');
      console.error('⚠️  Starting server anyway, but AI may not understand PM-AI workflow.');
    } else {
      console.error('✅ CLAUDE.md found with PM-AI section');
    }
  } else {
    console.error('⚠️  Warning: CLAUDE.md not found in current directory.');
    console.error('⚠️  Please create CLAUDE.md and run inject_claude_md tool first.');
    console.error('⚠️  Starting server anyway, but AI may not understand PM-AI workflow.');
  }

  // Initialize database (uses local ./src/db/pm-ai.db by default)
  await copyTemplateDatabase();

  // Initialize database
  // Pass path only if provided in config, otherwise uses local database
  await init({
    ...(config.dbPath ? { path: config.dbPath } : {}),
  });
  const server = new McpServer({
    name: 'pm-ai-server',
    version: '1.0.0'
  });

  // Register all MCP tools, prompts, and resources
  await registerTools(server);
  await registerPrompts(server);
  await registerResources(server);

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('PM-AI MCP Server running and ready');
  console.error('Waiting for MCP client connections...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
