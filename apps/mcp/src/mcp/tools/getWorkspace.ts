import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getWorkspaceById, getWorkspaceFeatures, getFeatureProgress, type Feature } from '@pm-ai/core';

const GetWorkspaceSchema = z.object({
  workspace_id: z.string().describe('The ID of the workspace to retrieve')
});

export async function registerGetWorkspaceTool(server: McpServer): Promise<void> {
  server.registerTool(
    'get_workspace',
    {
      description: 'Get a single workspace by ID with full details including features',
      inputSchema: GetWorkspaceSchema
    },
    async (input: any) => {
      try {
        const workspace = await getWorkspaceById(input.workspace_id);

        if (!workspace) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Workspace not found',
                workspace_id: input.workspace_id
              }, null, 2)
            }]
          };
        }

        // Get features with progress
        const features = await getWorkspaceFeatures(input.workspace_id);
        const featuresWithProgress = await Promise.all(
          features.map(async (feature: Feature) => {
            const progress = await getFeatureProgress(feature.id);
            return {
              id: feature.id,
              name: feature.name,
              description: feature.description,
              created_at: feature.createdAt,
              updated_at: feature.updatedAt,
              progress
            };
          })
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace: {
                id: workspace.id,
                name: workspace.name,
                path: workspace.path,
                description: workspace.description,
                created_at: workspace.createdAt,
                updated_at: workspace.updatedAt
              },
              features: featuresWithProgress
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get workspace',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
