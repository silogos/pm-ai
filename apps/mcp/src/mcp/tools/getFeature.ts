import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFeatureById } from '@pm-ai/core';

const GetFeatureSchema = z.object({
  feature_id: z.string().describe('The ID of the feature to retrieve')
});

export async function registerGetFeatureTool(server: McpServer): Promise<void> {
  server.tool(
    'get_feature',
    'Get a single feature by ID with full details',
    GetFeatureSchema.shape,
    async (input: any) => {
      try {
        const feature = await getFeatureById(input.feature_id);

        if (!feature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Feature not found',
                feature_id: input.feature_id
              }, null, 2)
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              feature: {
                id: feature.id,
                workspace_id: feature.workspaceId,
                name: feature.name,
                description: feature.description,
                created_at: feature.createdAt,
                updated_at: feature.updatedAt
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get feature',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
