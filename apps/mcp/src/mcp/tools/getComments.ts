import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getComments, type TaskComment } from '@pm-ai/core';

const GetCommentsSchema = z.object({
  task_id: z.string().describe('The ID of the task to get comments for')
});

export async function registerGetCommentsTool(server: McpServer): Promise<void> {
  server.registerTool(
    'get_comments',
    {
      description: 'Get all comments for a specific task',
      inputSchema: GetCommentsSchema
    },
    async (input: any) => {
      try {
        const comments = await getComments(input.task_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: input.task_id,
              count: comments.length,
              comments: comments.map((comment: TaskComment) => ({
                id: comment.id,
                task_id: comment.taskId,
                content: comment.content,
                created_at: comment.createdAt
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get comments',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
