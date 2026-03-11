import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scanWorkspace, scanCurrentWorkspace, getWorkspaceStatistics } from '@pm-ai/core';

const ScanWorkspaceSchema = z.object({
  workspace_path: z.string().optional().describe('Path to scan for PM-AI projects (defaults to current directory)'),
  max_depth: z.number().optional().describe('Maximum depth to scan (default: 3)')
});

export async function registerScanWorkspaceTool(server: McpServer): Promise<void> {
  server.tool(
    'scan_workspace',
    'Scan the workspace for PM-AI projects. Returns a list of all projects found with their statistics. Use this when the user asks to "show workspace", "list all PM-AI projects", or "what projects are in this workspace".',
    ScanWorkspaceSchema.shape,
    async (input) => {
      try {
        const workspacePath = input.workspace_path || process.cwd();
        const maxDepth = input.max_depth || 3;

        const overview = await scanWorkspace(workspacePath, maxDepth);
        const stats = await getWorkspaceStatistics(workspacePath);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace: {
                path: overview.rootPath,
                total_projects: overview.totalProjects,
                statistics: stats
              },
              projects: overview.projects.map(p => ({
                id: p.id,
                name: p.name,
                workspace_id: p.workspaceId,
                description: p.description,
                created_at: p.createdAt,
                updated_at: p.updatedAt,
                progress: p.progress
              })),
              summary: `Found ${overview.totalProjects} project(s) in workspace`,
              next_steps: overview.projects.length > 0 ? [
                'Use a project_id to work with a specific project',
                'Create plans using the "save_plan" tool',
                'View project details and tasks'
              ] : ['No PM-AI projects found. Initialize one with "init_project_in_current_folder"']
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to scan workspace',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}

export async function registerScanCurrentWorkspaceTool(server: McpServer): Promise<void> {
  server.tool(
    'show_workspace',
    'Quick shortcut to show all PM-AI projects in the current workspace. Use when the user asks "show workspace", "list projects", "what PM-AI projects exist".',
    {},
    async () => {
      try {
        const overview = await scanCurrentWorkspace();
        const stats = await getWorkspaceStatistics(process.cwd());

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workspace: {
                path: overview.rootPath,
                total_projects: overview.totalProjects,
                statistics: stats
              },
              projects: overview.projects.map(p => ({
                id: p.id,
                name: p.name,
                workspace_id: p.workspaceId,
                description: p.description,
                progress: p.progress
              })),
              summary: `${overview.totalProjects} PM-AI project(s) in workspace`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to show workspace',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
