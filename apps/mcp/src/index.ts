import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { init } from '@pm-ai/core';
import { registerInitProjectTool } from './mcp/tools/initProject.js';
import { registerInitWorkspaceInCurrentFolderTool } from './mcp/tools/initWorkspaceInCurrentFolder.js';
import { registerCreateFeatureTool } from './mcp/tools/createFeature.js';
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
import { registerOpenDashboardTool } from './mcp/tools/openDashboard.js';
import { registerScanWorkspaceTool, registerScanCurrentWorkspaceTool } from './mcp/tools/scanWorkspace.js';
import { registerAlwaysCheckPmAiPrompt } from './mcp/prompts/alwaysCheckPmAi.js';
import { getConfig } from '@pm-ai/config';
import { HttpServerManagerImpl } from './server/HttpServerManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.error('Starting PM-AI MCP Server...');

  const config = getConfig();

  // Initialize HTTP Server Manager (lazy spawn - only when dashboard is opened)
  const apiServerPath = join(__dirname, '../../api/dist/server/index.js');
  const httpServerManager = new HttpServerManagerImpl({
    apiServerPath,
    preferredPort: config.apiUrl ? parseInt(config.apiUrl.split(':')[2]) : undefined,
    dbPath: config.dbPath
  });

  console.error('ℹ️  HTTP server will spawn on-demand when dashboard is opened');

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

  // Initialize database (migrations are handled automatically by init)
  await init({ path: config.dbPath });
  const server = new McpServer({
    name: 'pm-ai-server',
    version: '1.0.0'
  });

  // Register MCP tools
  await registerInitProjectTool(server);
  console.error('Tool registered: init_project');

  await registerInitWorkspaceInCurrentFolderTool(server);
  console.error('Tool registered: init_workspace_in_current_folder');

  await registerCreateFeatureTool(server);
  console.error('Tool registered: create_feature');

  await registerScanWorkspaceTool(server);
  console.error('Tool registered: scan_workspace');

  await registerScanCurrentWorkspaceTool(server);
  console.error('Tool registered: show_workspace');

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

  await registerOpenDashboardTool(server, httpServerManager);
  console.error('Tool registered: open_dashboard');

  // Register MCP prompts
  await registerAlwaysCheckPmAiPrompt(server);
  console.error('Prompt registered: always_check_pm_ai_first');

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

  // Handle graceful shutdown
  const shutdown = async () => {
    console.error('Shutting down...');
    await httpServerManager.kill();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
