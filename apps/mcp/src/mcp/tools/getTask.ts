import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getTaskById } from '@pm-ai/core';

const GetTaskSchema = z.object({
  task_id: z.string().describe('The ID of the task to retrieve')
});

export async function registerGetTaskTool(server: McpServer): Promise<void> {
  server.registerTool(
    'get_task',
    {
      description: 'Get a single task by ID with full details',
      inputSchema: GetTaskSchema
    },
    async (input: any) => {
      try {
        const task = await getTaskById(input.task_id);

        if (!task) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Task not found',
                task_id: input.task_id
              }, null, 2)
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              task: {
                id: task.id,
                plan_id: task.planId,
                title: task.title,
                description: task.description,
                flag: task.flag,
                priority: task.priority,
                dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
                status: task.status
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get task',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
