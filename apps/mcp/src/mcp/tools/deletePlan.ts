import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getPlanById, deletePlan } from '@pm-ai/core';

const DeletePlanSchema = z.object({
  plan_id: z.string().describe('The ID of the plan to delete')
});

export async function registerDeletePlanTool(server: McpServer): Promise<void> {
  server.registerTool(
    'delete_plan',
    {
      description: 'Delete a plan permanently from the database. All associated tasks will be automatically deleted due to cascade constraints.',
      inputSchema: DeletePlanSchema
    },
    async (input) => {
      try {
        // Verify plan exists and get its info before deleting
        const existingPlan = await getPlanById(input.plan_id);
        if (!existingPlan) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Plan not found' }, null, 2)
            }]
          };
        }

        // Store plan info for confirmation
        const planInfo = {
          id: existingPlan.id,
          feature_id: existingPlan.featureId,
          title: existingPlan.title
        };

        // Delete the plan (cascade will delete all tasks)
        await deletePlan(input.plan_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Plan "${planInfo.title}" deleted successfully. All associated tasks have been removed due to cascade deletion.`,
              deleted_plan: planInfo
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to delete plan',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
