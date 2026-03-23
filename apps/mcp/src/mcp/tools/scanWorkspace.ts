import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scanWorkspace, scanCurrentWorkspace, getWorkspaceStatistics, type Feature } from '@pm-ai/core';

const ScanWorkspaceSchema = z.object({
  workspace_path: z.string().optional().describe('Path to scan for PM-AI features (defaults to current directory)'),
  max_depth: z.number().optional().describe('Maximum depth to scan (default: 3)')
});

const ScanCurrentWorkspaceSchema = z.object({});

export async function registerScanWorkspaceTool(server: McpServer): Promise<void> {
  server.registerTool(
    'scan_workspace',
    {
      description: 'Scan the workspace for PM-AI features. Returns a list of all features found with their statistics. Use this when the user asks to "show workspace", "list all PM-AI features", or "what features are in this workspace".',
      inputSchema: ScanWorkspaceSchema
    },
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
                total_features: overview.totalFeatures,
                statistics: stats
              },
              features: overview.features.map((f) => ({
                id: f.id,
                name: f.name,
                workspace_id: f.workspaceId,
                description: f.description,
                created_at: f.createdAt,
                updated_at: f.updatedAt,
                progress: f.progress
              })),
              summary: `Found ${overview.totalFeatures} feature(s) in workspace`,
              next_steps: overview.features.length > 0 ? [
                'Use a feature_id to work with a specific feature',
                'Create plans using the "save_plan" tool',
                'View feature details and tasks'
              ] : ['No PM-AI features found. Create one with "create_feature"']
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
  server.registerTool(
    'show_workspace',
    {
      description: 'Quick shortcut to show all PM-AI features in the current workspace. Use when the user asks "show workspace", "list features", "what PM-AI features exist".',
      inputSchema: ScanCurrentWorkspaceSchema
    },
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
                total_features: overview.totalFeatures,
                statistics: stats
              },
              features: overview.features.map((f) => ({
                id: f.id,
                name: f.name,
                workspace_id: f.workspaceId,
                description: f.description,
                progress: f.progress
              })),
              summary: `${overview.totalFeatures} PM-AI feature(s) in workspace`
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
