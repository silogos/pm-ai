import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSavePlanTool } from '../mcp/tools/savePlan.js';
import { registerBreakdownPrompt } from '../mcp/prompts/breakdownMarkdownPlan.js';
import { registerPlansResource } from '../mcp/resources/plans.js';
import { registerTasksResource } from '../mcp/resources/tasks.js';

async function main() {
  console.error('Starting PM-AI MCP Server...');

  const server = new McpServer({
    name: 'pm-ai-server',
    version: '1.0.0'
  });

  // Register MCP tools
  await registerSavePlanTool(server);
  console.error('Tool registered: save_plan');

  // Register MCP prompts
  await registerBreakdownPrompt(server);
  console.error('Prompt registered: breakdown_markdown_plan');

  // Register MCP resources
  await registerPlansResource(server);
  console.error('Resource registered: plans');

  await registerTasksResource(server);
  console.error('Resource registered: tasks');

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
