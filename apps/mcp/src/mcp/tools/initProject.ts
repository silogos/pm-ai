import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createProject, getAllProjects } from '@pm-ai/core';

const InitProjectSchema = z.object({
  name: z.string().describe('The name of the project (can be a folder name, package name, or any project identifier)'),
  description: z.string().optional().describe('Optional description or context for the project')
});

export async function registerInitProjectTool(server: McpServer): Promise<void> {
  server.tool(
    'init_project',
    'Initialize a new project in PM-AI. Use this when starting work on a new project, folder, or package. Returns the project ID that can be used for subsequent operations.',
    InitProjectSchema.shape,
    async (input) => {
      try {
        // Check if project with same name already exists
        const existingProjects = await getAllProjects();
        const existingProject = existingProjects.find(p => p.name.toLowerCase() === input.name.toLowerCase());

        if (existingProject) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                already_exists: true,
                project_id: existingProject.id,
                project_name: existingProject.name,
                message: `Project "${input.name}" already exists with ID: ${existingProject.id}`,
                note: 'You can use this existing project for your work'
              }, null, 2)
            }]
          };
        }

        // Create new project
        const projectId = await createProject(input.name);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_id: projectId,
              project_name: input.name,
              description: input.description,
              message: `Project "${input.name}" created successfully`,
              next_steps: [
                `Use project_id "${projectId}" for save_plan operations`,
                'Add plans and tasks to organize your project work',
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
              error: 'Failed to initialize project',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
