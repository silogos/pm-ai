import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  createFeature,
  createFeatureWithDescription,
  getFeatureByWorkspaceAndName,
  requireWorkspace,
} from '@pm-ai/core';

const CreateFeatureSchema = z.object({
  name: z.string().describe('Name of the feature (e.g., "Authentication", "Checkout", "User Management")'),
  description: z.string().optional().describe('Optional description for the feature')
});

export async function registerCreateFeatureTool(server: McpServer): Promise<void> {
  server.registerTool(
    'create_feature',
    {
      description: 'Create a new feature in the current workspace. Features represent domain areas or components within your repository (e.g., "Authentication", "Checkout", "User Management").',
      inputSchema: CreateFeatureSchema
    },
    async (input) => {
      try {
        // Auto-detect workspace from current path
        const workspaceId = await requireWorkspace();

        // Check if feature with this name already exists
        const existingFeature = await getFeatureByWorkspaceAndName(workspaceId, input.name);
        if (existingFeature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                already_exists: true,
                feature_id: existingFeature.id,
                feature_name: existingFeature.name,
                workspace_id: workspaceId,
                message: `Feature "${input.name}" already exists in workspace`,
                note: 'You can create plans and tasks for this feature.'
              }, null, 2)
            }]
          };
        }

        // Create new feature
        const featureId = await createFeatureWithDescription(
          input.name,
          workspaceId,
          input.description
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              feature_id: featureId,
              feature_name: input.name,
              workspace_id: workspaceId,
              description: input.description,
              message: `Feature "${input.name}" created successfully`,
              next_steps: [
                `Create plans for "${input.name}" using the "save_plan" tool`,
                'Add tasks to organize your work',
                'Track progress with the "get_critical_path" tool'
              ]
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to create feature',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
