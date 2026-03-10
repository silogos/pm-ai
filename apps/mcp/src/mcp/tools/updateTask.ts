import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getTaskById,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskFlag,
  updateTaskDependencies,
  type Task
} from '@pm-ai/core';

const UpdateTaskSchema = z.object({
  task_id: z.string().describe('The ID of the task to update'),
  status: z.enum(['planned', 'review', 'done']).optional().describe('New status for the task'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('New priority for the task'),
  title: z.string().optional().describe('New title for the task'),
  description: z.string().optional().describe('New description for the task'),
  flag: z.string().nullable().optional().describe('New flag for the task'),
  dependencies: z.array(z.string()).optional().describe('New dependencies (array of task IDs)')
});

export async function registerUpdateTaskTool(server: McpServer): Promise<void> {
  server.tool(
    'update_task',
    'Update a single field or multiple fields of an existing task',
    UpdateTaskSchema.shape,
    async (input: any) => {
      try {
        // Verify task exists
        const existingTask = await getTaskById(input.task_id);
        if (!existingTask) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Task not found' }, null, 2)
            }]
          };
        }

        const updates: Partial<Task> = {};
        let updated = false;

        // Update each field if provided
        if (input.status !== undefined) {
          const result = await updateTaskStatus(input.task_id, input.status);
          if (result) {
            updates.status = result.status;
            updated = true;
          }
        }

        if (input.priority !== undefined) {
          const result = await updateTaskPriority(input.task_id, input.priority);
          if (result) {
            updates.priority = result.priority;
            updated = true;
          }
        }

        if (input.title !== undefined) {
          const result = await updateTaskTitle(input.task_id, input.title);
          if (result) {
            updates.title = result.title;
            updated = true;
          }
        }

        if (input.description !== undefined) {
          const result = await updateTaskDescription(input.task_id, input.description);
          if (result) {
            updates.description = result.description;
            updated = true;
          }
        }

        if (input.flag !== undefined) {
          const result = await updateTaskFlag(input.task_id, input.flag);
          if (result) {
            updates.flag = result.flag;
            updated = true;
          }
        }

        if (input.dependencies !== undefined) {
          const result = await updateTaskDependencies(input.task_id, input.dependencies);
          if (result) {
            updates.dependencies = result.dependencies;
            updated = true;
          }
        }

        if (!updated) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'No fields were updated',
                message: 'Please provide at least one field to update'
              }, null, 2)
            }]
          };
        }

        // Get the updated task
        const updatedTask = await getTaskById(input.task_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: input.task_id,
              updates: {
                ...updates,
                dependencies: updates.dependencies ? JSON.parse(updates.dependencies) : null
              },
              task: updatedTask ? {
                id: updatedTask.id,
                plan_id: updatedTask.planId,
                title: updatedTask.title,
                description: updatedTask.description,
                flag: updatedTask.flag,
                priority: updatedTask.priority,
                dependencies: updatedTask.dependencies ? JSON.parse(updatedTask.dependencies) : [],
                status: updatedTask.status
              } : null,
              message: `Task "${input.title || existingTask.title}" updated successfully`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to update task',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
