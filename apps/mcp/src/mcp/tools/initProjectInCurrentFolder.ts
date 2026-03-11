import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  createProject,
  createProjectWithDescription,
  getProjectById,
  getWorkspaceByPath,
  createWorkspace,
  getAllWorkspaces
} from '@pm-ai/core';
import * as fs from 'fs/promises';
import * as path from 'path';

const InitProjectInCurrentFolderSchema = z.object({
  description: z.string().optional().describe('Optional description for the project')
});

export async function registerInitProjectInCurrentFolderTool(server: McpServer): Promise<void> {
  server.tool(
    'init_project_in_current_folder',
    'Initialize PM-AI in the current working directory. Creates a .pm-ai config file and initializes the project in the database. Use this when the user says "init pm-ai", "set up PM-AI here", "initialize PM-AI project", or similar.',
    InitProjectInCurrentFolderSchema.shape,
    async (input) => {
      try {
        const currentPath = process.cwd();
        const folderName = path.basename(currentPath);
        const configPath = path.join(currentPath, '.pm-ai');

        // Check if .pm-ai config already exists
        try {
          const existingConfig = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(existingConfig);

          // Verify the project still exists in database
          const existingProject = await getProjectById(config.projectId);
          if (existingProject) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  already_exists: true,
                  workspace_id: config.workspaceId,
                  project_id: config.projectId,
                  project_name: config.projectName,
                  folder_path: currentPath,
                  message: `PM-AI already initialized in this folder`,
                  note: 'Project is already tracked. You can create plans and tasks for this project.'
                }, null, 2)
              }]
            };
          }
        } catch (error) {
          // Config file doesn't exist or is invalid, continue with creation
        }

        // Check if a workspace with this path already exists
        let workspaceId: string;
        const existingWorkspace = await getWorkspaceByPath(currentPath);

        if (existingWorkspace) {
          workspaceId = existingWorkspace.id;
        } else {
          // Create new workspace
          workspaceId = await createWorkspace(folderName, currentPath, `Workspace for ${folderName}`);
        }

        // Create new project in the workspace
        const projectId = await createProjectWithDescription(
          folderName,
          workspaceId,
          input.description
        );

        // Create .pm-ai config file
        const config = {
          version: '1.0.0',
          workspaceId,
          projectId,
          projectName: folderName,
          createdAt: new Date().toISOString(),
          description: input.description
        };

        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace_id: workspaceId,
              project_id: projectId,
              project_name: folderName,
              folder_path: currentPath,
              description: input.description,
              message: `PM-AI project initialized successfully`,
              config_file: configPath,
              next_steps: [
                'Create plans for your project using the "save_plan" tool',
                'Add tasks to organize your work',
                'Track progress with the "get_critical_path" tool',
                'View your project in the dashboard'
              ]
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to initialize PM-AI in current folder',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
