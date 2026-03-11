import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { importPlansFromFolder, importPlansFromCurrentFolder } from '@pm-ai/core';
import { requireWorkspace, getFeatureByWorkspaceAndName, createFeatureWithDescription } from '@pm-ai/core';
import * as path from 'path';

const SyncPlansFromFilesSchema = z.object({
  feature_id: z.string().optional().describe('Feature ID to sync plans for (optional - auto-detects from workspace if not provided)'),
  feature_name: z.string().optional().describe('Feature name (will create feature if it doesn\'t exist)'),
  folder_path: z.string().optional().describe('Folder path to scan for .md plan files (optional - uses current folder if not provided)')
});

export async function registerSyncPlansFromFilesTool(server: McpServer): Promise<void> {
  server.tool(
    'sync_plans_from_files',
    'Scan a folder for markdown (.md) files and import them as plans in PM-AI. Each .md file becomes a plan with the first heading as the title. Use when the user says "sync plans from files", "import markdown files", or "sync plans".',
    SyncPlansFromFilesSchema.shape,
    async (input) => {
      try {
        let featureId: string | undefined = input.feature_id;
        let folderPath: string | undefined = input.folder_path;

        // If no feature_id provided, try to detect/create from workspace
        if (!featureId) {
          // Auto-detect workspace from current path
          const workspaceId = await requireWorkspace();

          // If feature_name provided, look up or create feature
          if (input.feature_name) {
            const existingFeature = await getFeatureByWorkspaceAndName(workspaceId, input.feature_name);
            if (existingFeature) {
              featureId = existingFeature.id;
            } else {
              // Create new feature
              featureId = await createFeatureWithDescription(input.feature_name, workspaceId, `Feature: ${input.feature_name}`);
            }
          } else {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Missing feature identifier',
                  details: 'Please provide either feature_id or feature_name to sync plans for.',
                  hint: 'Example: feature_name="Authentication" or feature_id="uuid"'
                }, null, 2)
              }]
            };
          }
        }

        // Use provided folder_path or current directory
        const syncPath = folderPath || process.cwd();

        // Import plans from folder
        const result = await importPlansFromFolder(featureId, syncPath);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              feature_id: featureId,
              folder_path: syncPath,
              result: {
                imported: result.imported,
                updated: result.updated,
                skipped: result.skipped,
                errors: result.errors.length
              },
              message: `Synced ${result.imported} new plan(s), updated ${result.updated} plan(s)`,
              errors: result.errors.length > 0 ? result.errors : undefined,
              next_steps: [
                'View plans using the "plans" resource',
                'Work on tasks within the plans',
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
              error: 'Failed to sync plans from files',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}

export async function registerSyncCurrentFolderTool(server: McpServer): Promise<void> {
  server.tool(
    'sync_current_folder',
    'Quick shortcut to sync markdown files from the current folder as plans. Auto-detects the workspace from current path.',
    {},
    async () => {
      try {
        // This function now uses the workspace detection instead of .pm-ai config
        // The importPlansFromCurrentFolder function needs to be updated to use workspace detection
        // For now, let's use the workspace detection approach here
        const workspaceId = await requireWorkspace();

        // We need a feature_id to import plans, so we need to ask for it or create a default one
        // For now, let's return an error asking for feature specification
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Feature required',
              details: 'Please specify which feature to sync plans for using the sync_plans_from_files tool with feature_name or feature_id parameter.',
              hint: 'Example: sync_plans_from_files with feature_name="Authentication"'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to sync current folder',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
