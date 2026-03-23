import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createFeature, createFeatureWithDescription, getAllFeatures, getWorkspaceByPath, type Feature } from '@pm-ai/core';
import * as path from 'path';

const InitProjectSchema = z.object({
  name: z.string().describe('The name of the feature (e.g., "Authentication", "Checkout", "User Management")'),
  description: z.string().optional().describe('Optional description or context for the feature'),
  workspaceId: z.string().uuid().optional().describe('Optional workspace ID to link the feature to. If not provided, attempts to find workspace by current directory.')
});

export async function registerInitProjectTool(server: McpServer): Promise<void> {
  server.registerTool(
    'init_project',
    {
      description: 'Initialize a new feature in PM-AI. Use this when starting work on a new feature or component. Returns the feature ID that can be used for subsequent operations.',
      inputSchema: InitProjectSchema
    },
    async (input) => {
      try {
        // Check if feature with same name already exists in workspace
        const existingFeatures = await getAllFeatures();
        const existingFeature = existingFeatures.find((f: Feature) => f.name.toLowerCase() === input.name.toLowerCase());

        if (existingFeature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                already_exists: true,
                feature_id: existingFeature.id,
                feature_name: existingFeature.name,
                message: `Feature "${input.name}" already exists with ID: ${existingFeature.id}`,
                note: 'You can use this existing feature for your work'
              }, null, 2)
            }]
          };
        }

        let workspaceId = input.workspaceId;
        let featureId: string;

        // If no workspaceId provided, try to find workspace by current directory
        if (!workspaceId) {
          const currentPath = process.cwd();
          const existingWorkspace = await getWorkspaceByPath(currentPath);

          if (existingWorkspace) {
            workspaceId = existingWorkspace.id;
          } else {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'No workspace found',
                  message: 'Please run "init pm-ai" first to create a workspace, or provide a workspaceId parameter.',
                  current_path: currentPath
                }, null, 2)
              }]
            };
          }
        }

        // Create new feature with workspace
        if (input.description) {
          featureId = await createFeatureWithDescription(input.name, workspaceId, input.description);
        } else {
          featureId = await createFeature(input.name, workspaceId);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace_id: workspaceId,
              feature_id: featureId,
              feature_name: input.name,
              description: input.description,
              message: `Feature "${input.name}" created successfully`,
              next_steps: [
                `Use feature_id "${featureId}" for save_plan operations`,
                'Add plans and tasks to organize your feature work',
                'Track progress with the get_critical_path tool'
              ]
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to initialize feature',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
