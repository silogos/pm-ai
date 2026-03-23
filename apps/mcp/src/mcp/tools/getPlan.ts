import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getPlanById } from '@pm-ai/core';

const GetPlanSchema = z.object({
  plan_id: z.string().describe('The ID of the plan to retrieve')
});

export async function registerGetPlanTool(server: McpServer): Promise<void> {
  server.registerTool(
    'get_plan',
    {
      description: 'Get a single plan by ID with full details',
      inputSchema: GetPlanSchema
    },
    async (input: any) => {
      try {
        const plan = await getPlanById(input.plan_id);

        if (!plan) {
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

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              plan: {
                id: plan.id,
                feature_id: plan.featureId,
                title: plan.title,
                markdown: plan.markdown,
                created_at: plan.createdAt
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get plan',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
