import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getTaskDependencies, getTaskDependents } from '@pm-ai/core';
import { getTaskById } from '@pm-ai/core';

const GetTaskDependenciesSchema = z.object({
  task_id: z.string().describe('The ID of the task to get dependencies for'),
  type: z.enum(['upstream', 'downstream', 'both']).optional().default('both').describe('Type of dependencies to retrieve')
});

export async function registerGetTaskDependenciesTool(server: McpServer): Promise<void> {
  server.tool(
    'get_task_dependencies',
    'Get dependency information for a task (upstream dependencies and/or downstream dependents)',
    GetTaskDependenciesSchema.shape,
    async (input) => {
      try {
        // Verify task exists
        const task = await getTaskById(input.task_id);
        if (!task) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Task not found' }, null, 2)
            }]
          };
        }

        const result: any = {
          task_id: input.task_id,
          task_title: task.title,
          task_status: task.status
        };

        // Get upstream dependencies (tasks this task depends on)
        if (input.type === 'upstream' || input.type === 'both') {
          const upstream = await getTaskDependencies(input.task_id);
          result.upstream = {
            direct: upstream.direct,
            all: upstream.all,
            tree: upstream.tree
          };
        }

        // Get downstream dependents (tasks that depend on this task)
        if (input.type === 'downstream' || input.type === 'both') {
          const downstream = await getTaskDependents(input.task_id);
          result.downstream = {
            direct: downstream.direct,
            all: downstream.all
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get task dependencies',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
