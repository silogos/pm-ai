import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  createWorkspace,
  getWorkspaceByPath,
  detectWorkspace,
} from '@pm-ai/core';
import * as path from 'path';

const InitWorkspaceInCurrentFolderSchema = z.object({
  description: z.string().optional().describe('Optional description for the workspace (repo)')
});

export async function registerInitWorkspaceInCurrentFolderTool(server: McpServer): Promise<void> {
  server.tool(
    'init_workspace_in_current_folder',
    'Initialize PM-AI in the current working directory. Creates a workspace in the database. Use this when the user says "init pm-ai", "set up PM-AI here", "initialize PM-AI workspace", or similar.',
    InitWorkspaceInCurrentFolderSchema.shape,
    async (input) => {
      try {
        const currentPath = process.cwd();
        const folderName = path.basename(currentPath);

        // Check if workspace already exists at this path
        const existingWorkspace = await getWorkspaceByPath(currentPath);
        if (existingWorkspace) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                already_exists: true,
                workspace_id: existingWorkspace.id,
                workspace_name: existingWorkspace.name,
                folder_path: currentPath,
                description: existingWorkspace.description,
                message: `PM-AI workspace already initialized`,
                note: 'Workspace is already tracked. You can create features and plans for this workspace.'
              }, null, 2)
            }]
          };
        }

        // Create new workspace
        const workspaceId = await createWorkspace(
          folderName,
          currentPath,
          input.description
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace_id: workspaceId,
              workspace_name: folderName,
              folder_path: currentPath,
              description: input.description,
              message: `PM-AI workspace initialized successfully`,
              next_steps: [
                'Create features for your workspace using the "create_feature" tool',
                'Create plans with tasks to organize your work',
                'Track progress with the "get_critical_path" tool',
                'View your workspace in the dashboard'
              ]
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to initialize PM-AI workspace',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
