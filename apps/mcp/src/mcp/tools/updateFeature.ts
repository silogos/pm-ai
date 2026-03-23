import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { updateFeatureDescription, getFeatureById } from '@pm-ai/core';

const UpdateFeatureSchema = z.object({
  feature_id: z.string().describe('The ID of the feature to update'),
  description: z.string().describe('New description for the feature')
});

export async function registerUpdateFeatureTool(server: McpServer): Promise<void> {
  server.registerTool(
    'update_feature',
    {
      description: 'Update feature description',
      inputSchema: UpdateFeatureSchema
    },
    async (input: any) => {
      try {
        // Verify feature exists
        const existingFeature = await getFeatureById(input.feature_id);
        if (!existingFeature) {
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

        const updatedFeature = await updateFeatureDescription(input.feature_id, input.description);

        if (!updatedFeature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Failed to update feature',
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
              feature_id: input.feature_id,
              feature: {
                id: updatedFeature.id,
                workspace_id: updatedFeature.workspaceId,
                name: updatedFeature.name,
                description: updatedFeature.description,
                created_at: updatedFeature.createdAt,
                updated_at: updatedFeature.updatedAt
              },
              message: `Feature "${updatedFeature.name}" updated successfully`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to update feature',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
