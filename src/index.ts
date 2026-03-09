import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSavePlanTool } from './mcp/tools/savePlan.js';
import { registerUpdateTaskTool } from './mcp/tools/updateTask.js';
import { registerDeleteTaskTool } from './mcp/tools/deleteTask.js';
import { registerAddTaskCommentTool } from './mcp/tools/addTaskComment.js';
import { registerSearchTasksTool } from './mcp/tools/searchTasks.js';
import { registerFilterTasksTool } from './mcp/tools/filterTasks.js';
import { registerGetTaskDependenciesTool } from './mcp/tools/getTaskDependencies.js';
import { registerGetCriticalPathTool } from './mcp/tools/getCriticalPath.js';
import { registerBreakdownPrompt } from './mcp/prompts/breakdownMarkdownPlan.js';
import { registerPlansResource } from './mcp/resources/plans.js';
import { registerTasksResource } from './mcp/resources/tasks.js';
import { registerProgressResource } from './mcp/resources/progress.js';

async function main() {
  console.error('Starting PM-AI MCP Server...');

  const server = new McpServer({
    name: 'pm-ai-server',
    version: '1.0.0'
  });

  // Register MCP tools
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
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
