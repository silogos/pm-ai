import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { init } from '@pm-ai/core';
import { registerInitProjectTool } from './mcp/tools/initProject.js';
import { registerSavePlanTool } from './mcp/tools/savePlan.js';
import { registerUpdateTaskTool } from './mcp/tools/updateTask.js';
import { registerDeleteTaskTool } from './mcp/tools/deleteTask.js';
import { registerAddTaskCommentTool } from './mcp/tools/addTaskComment.js';
import { registerSearchTasksTool } from './mcp/tools/searchTasks.js';
import { registerFilterTasksTool } from './mcp/tools/filterTasks.js';
import { registerGetTaskDependenciesTool } from './mcp/tools/getTaskDependencies.js';
import { registerGetCriticalPathTool } from './mcp/tools/getCriticalPath.js';
import { registerInjectClaudeMdTool } from './mcp/tools/injectClaudeMd.js';
import { registerBreakdownPrompt } from './mcp/prompts/breakdownMarkdownPlan.js';
import { registerPlansResource } from './mcp/resources/plans.js';
import { registerTasksResource } from './mcp/resources/tasks.js';
import { registerProgressResource } from './mcp/resources/progress.js';
import { createWebServer } from './server/index.js';
import { registerOpenDashboardTool } from './mcp/tools/openDashboard.js';
import { getConfig } from './config/index.js';

async function main() {
  console.error('Starting PM-AI MCP Server...');

  const config = getConfig();

  // Check if CLAUDE.md exists and has PM-AI section
  const claudeMdPath = process.cwd() + '/CLAUDE.md';
  const claudeMdExists = require('fs').existsSync(claudeMdPath);

  if (claudeMdExists) {
    const claudeMdContent = require('fs').readFileSync(claudeMdPath, 'utf-8');
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

  // Initialize database
  init({ path: config.dbPath });
  const server = new McpServer({
    name: 'pm-ai-server',
    version: '1.0.0'
  });

  // Start Web Server
  let webServerUrl: string | null = null;
  try {
    const webServer = await createWebServer({
      fixedPort: config.webPort,
      autoOpen: config.webAutoOpen
    });
    webServerUrl = webServer.url;
    console.error(`Web dashboard running at ${webServerUrl}`);

    // Make web server URL available to tools
    (global as any).webServerUrl = webServerUrl;

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('Shutting down...');
      await webServer.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start web server:', error);
  }

  // Register MCP tools
  await registerInitProjectTool(server);
  console.error('Tool registered: init_project');

  await registerInjectClaudeMdTool(server);
  console.error('Tool registered: inject_claude_md');

  await registerSavePlanTool(server);
  console.error('Tool registered: save_plan');

  await registerUpdateTaskTool(server);
  console.error('Tool registered: update_task');

  await registerDeleteTaskTool(server);
  console.error('Tool registered: delete_task');

  await registerAddTaskCommentTool(server);
  console.error('Tool registered: add_task_comment');

  await registerSearchTasksTool(server);
  console.error('Tool registered: search_tasks');

  await registerFilterTasksTool(server);
  console.error('Tool registered: filter_tasks');

  await registerGetTaskDependenciesTool(server);
  console.error('Tool registered: get_task_dependencies');

  await registerGetCriticalPathTool(server);
  console.error('Tool registered: get_critical_path');

  await registerOpenDashboardTool(server);
  console.error('Tool registered: open_dashboard');

  // Register MCP prompts
  await registerBreakdownPrompt(server);
  console.error('Prompt registered: breakdown_markdown_plan');

  // Register MCP resources
  await registerPlansResource(server);
  console.error('Resource registered: plans');

  await registerTasksResource(server);
  console.error('Resource registered: tasks');

  await registerProgressResource(server);
  console.error('Resource registered: progress');

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('PM-AI MCP Server running and ready');
  console.error('Waiting for MCP client connections...');

  if (webServerUrl) {
    console.error(`Access the web dashboard at: ${webServerUrl}`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
