import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { updatePlan, getPlanById } from '@pm-ai/core';

const UpdatePlanSchema = z.object({
  plan_id: z.string().describe('The ID of the plan to update'),
  title: z.string().optional().describe('New title for the plan'),
  markdown: z.string().optional().describe('New markdown content for the plan')
});

export async function registerUpdatePlanTool(server: McpServer): Promise<void> {
  server.registerTool(
    'update_plan',
    {
      description: 'Update plan title and/or markdown content',
      inputSchema: UpdatePlanSchema
    },
    async (input: any) => {
      try {
        // Verify plan exists
        const existingPlan = await getPlanById(input.plan_id);
        if (!existingPlan) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Plan not found',
                plan_id: input.plan_id
              }, null, 2)
            }]
          };
        }

        // Check if at least one field is provided
        if (input.title === undefined && input.markdown === undefined) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'No fields provided',
                message: 'Please provide at least one field to update (title or markdown)'
              }, null, 2)
            }]
          };
        }

        const updatedPlan = await updatePlan(input.plan_id, input.title, input.markdown);

        if (!updatedPlan) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Failed to update plan',
                plan_id: input.plan_id
              }, null, 2)
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              plan_id: input.plan_id,
              plan: {
                id: updatedPlan.id,
                feature_id: updatedPlan.featureId,
                title: updatedPlan.title,
                markdown: updatedPlan.markdown,
                created_at: updatedPlan.createdAt
              },
              message: `Plan "${updatedPlan.title}" updated successfully`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to update plan',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
