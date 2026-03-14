import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { saveTasks } from '@pm-ai/core';

const TaskInputSchema = z.object({
  title: z.string().describe('The title of the task'),
  description: z.string().optional().describe('The description of the task'),
  flag: z.string().optional().describe('A flag or label for the task'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('The priority of the task'),
  dependencies: z.array(z.string()).optional().describe('Array of task IDs this task depends on'),
  status: z.enum(['planned', 'review', 'done']).optional().describe('The status of the task')
});

const CreateTasksSchema = z.object({
  plan_id: z.string().describe('The ID of the plan to add tasks to'),
  tasks: z.array(TaskInputSchema).min(1).describe('Array of tasks to create')
});

export async function registerCreateTasksTool(server: McpServer): Promise<void> {
  server.tool(
    'create_tasks',
    'Create multiple tasks at once for a plan',
    CreateTasksSchema.shape,
    async (input: any) => {
      try {
        const taskIds = await saveTasks(input.plan_id, input.tasks);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              plan_id: input.plan_id,
              tasks_created: taskIds.length,
              task_ids: taskIds,
              message: `Successfully created ${taskIds.length} task(s)`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to create tasks',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
