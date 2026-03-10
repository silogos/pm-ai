import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getTaskById, deleteTask } from '@pm-ai/core';

const DeleteTaskSchema = z.object({
  task_id: z.string().describe('The ID of the task to delete')
});

export async function registerDeleteTaskTool(server: McpServer): Promise<void> {
  server.tool(
    'delete_task',
    'Delete a task permanently from the database',
    DeleteTaskSchema.shape,
    async (input) => {
      try {
        // Verify task exists and get its info before deleting
        const existingTask = await getTaskById(input.task_id);
        if (!existingTask) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Task not found' }, null, 2)
            }]
          };
        }

        // Store task info for confirmation
        const taskInfo = {
          id: existingTask.id,
          plan_id: existingTask.planId,
          title: existingTask.title,
          description: existingTask.description,
          flag: existingTask.flag,
          priority: existingTask.priority,
          dependencies: existingTask.dependencies ? JSON.parse(existingTask.dependencies) : [],
          status: existingTask.status
        };

        // Delete the task
        await deleteTask(input.task_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Task "${taskInfo.title}" deleted successfully`,
              deleted_task: taskInfo
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to delete task',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
