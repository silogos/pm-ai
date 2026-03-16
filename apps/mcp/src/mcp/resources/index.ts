import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPlansResource } from './plans.js';
import { registerTasksResource } from './tasks.js';
import { registerProgressResource } from './progress.js';

export async function registerResources(server: McpServer): Promise<void> {
  await registerPlansResource(server);
  console.error('Resource registered: plans');

  await registerTasksResource(server);
  console.error('Resource registered: tasks');

  await registerProgressResource(server);
  console.error('Resource registered: progress');
}
