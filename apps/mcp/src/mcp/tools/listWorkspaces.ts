import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getAllWorkspaces, getWorkspaceFeatures, getFeatureProgress, type Workspace, type Feature } from '@pm-ai/core';

const ListWorkspacesSchema = z.object({
  include_features: z.boolean().optional().default(false).describe('Whether to include features in the response')
});

export async function registerListWorkspacesTool(server: McpServer): Promise<void> {
  server.tool(
    'list_workspaces',
    'List all workspaces in the database',
    ListWorkspacesSchema.shape,
    async (input: any) => {
      try {
        const workspaces = await getAllWorkspaces();

        let workspacesWithFeatures: any[] = workspaces;

        if (input.include_features) {
          workspacesWithFeatures = await Promise.all(
            workspaces.map(async (workspace: Workspace) => {
              const features = await getWorkspaceFeatures(workspace.id);
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
                id: workspace.id,
                name: workspace.name,
                path: workspace.path,
                description: workspace.description,
                created_at: workspace.createdAt,
                updated_at: workspace.updatedAt,
                features: featuresWithProgress
              };
            })
          );
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: workspaces.length,
              workspaces: workspacesWithFeatures
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to list workspaces',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
