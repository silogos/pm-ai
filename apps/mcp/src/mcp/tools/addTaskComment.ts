import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { addComment, getComments, type TaskComment } from '@pm-ai/core';
import { getTaskById } from '@pm-ai/core';

const AddTaskCommentSchema = z.object({
  task_id: z.string().describe('The ID of the task to add a comment to'),
  content: z.string().describe('The comment content to add')
});

export async function registerAddTaskCommentTool(server: McpServer): Promise<void> {
  server.tool(
    'add_task_comment',
    'Add a comment to a task',
    AddTaskCommentSchema.shape,
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

        // Add the comment
        const commentId = await addComment(input.task_id, input.content);

        // Get all comments for the task
        const allComments = await getComments(input.task_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              comment_id: commentId,
              task_id: input.task_id,
              task_title: task.title,
              comment: {
                id: commentId,
                content: input.content
              },
              total_comments: allComments.length,
              message: `Comment added to task "${task.title}"`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to add comment',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
