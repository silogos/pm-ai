import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { deleteComment, getCommentById } from '@pm-ai/core';

const DeleteCommentSchema = z.object({
  comment_id: z.string().describe('The ID of the comment to delete')
});

export async function registerDeleteCommentTool(server: McpServer): Promise<void> {
  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment by ID',
      inputSchema: DeleteCommentSchema
    },
    async (input: any) => {
      try {
        // Verify comment exists
        const existingComment = await getCommentById(input.comment_id);
        if (!existingComment) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Comment not found',
                comment_id: input.comment_id
              }, null, 2)
            }]
          };
        }

        await deleteComment(input.comment_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              comment_id: input.comment_id,
              task_id: existingComment.taskId,
              message: 'Comment deleted successfully'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to delete comment',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
