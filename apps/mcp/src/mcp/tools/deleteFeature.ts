import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFeatureById, deleteFeature } from '@pm-ai/core';

const DeleteFeatureSchema = z.object({
  feature_id: z.string().describe('The ID of the feature to delete')
});

export async function registerDeleteFeatureTool(server: McpServer): Promise<void> {
  server.registerTool(
    'delete_feature',
    {
      description: 'Delete a feature permanently from the database. All associated plans and tasks will be automatically deleted due to cascade constraints.',
      inputSchema: DeleteFeatureSchema
    },
    async (input) => {
      try {
        // Verify feature exists and get its info before deleting
        const existingFeature = await getFeatureById(input.feature_id);
        if (!existingFeature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Feature not found' }, null, 2)
            }]
          };
        }

        // Store feature info for confirmation
        const featureInfo = {
          id: existingFeature.id,
          workspace_id: existingFeature.workspaceId,
          name: existingFeature.name,
          description: existingFeature.description
        };

        // Delete the feature (cascade will delete all plans and tasks)
        await deleteFeature(input.feature_id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Feature "${featureInfo.name}" deleted successfully. All associated plans and tasks have been removed due to cascade deletion.`,
              deleted_feature: featureInfo
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to delete feature',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
