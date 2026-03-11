import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { importPlansFromFolder, importPlansFromCurrentFolder } from '@pm-ai/core';
import * as fs from 'fs/promises';
import * as path from 'path';

const SyncPlansFromFilesSchema = z.object({
  project_id: z.string().optional().describe('Project ID to sync plans for (optional - auto-detects from .pm-ai config if not provided)'),
  folder_path: z.string().optional().describe('Folder path to scan for .md plan files (optional - uses current folder if not provided)')
});

export async function registerSyncPlansFromFilesTool(server: McpServer): Promise<void> {
  server.tool(
    'sync_plans_from_files',
    'Scan a folder for markdown (.md) files and import them as plans in PM-AI. Each .md file becomes a plan with the first heading as the title. Use when the user says "sync plans from files", "import markdown files", or "sync plans".',
    SyncPlansFromFilesSchema.shape,
    async (input) => {
      try {
        let projectId: string | undefined = input.project_id;
        let folderPath: string | undefined = input.folder_path;

        // Auto-detect from .pm-ai config if project_id not provided
        if (!projectId) {
          const currentPath = process.cwd();
          const configPath = path.join(currentPath, '.pm-ai');

          try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configContent);

            if (!config.projectId) {
              throw new Error('Invalid .pm-ai config: missing projectId');
            }

            projectId = config.projectId;
            folderPath = folderPath || currentPath;
          } catch (error) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Could not auto-detect project',
                  details: 'No .pm-ai config file found in current directory. Please provide project_id explicitly or initialize PM-AI in this folder first.',
                  hint: 'Run "init_project_in_current_folder" first, or provide project_id parameter'
                }, null, 2)
              }]
            };
          }
        }

        if (!projectId) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Missing project_id',
                details: 'Could not determine which project to sync plans for. Provide project_id or ensure .pm-ai config exists.'
              }, null, 2)
            }]
          };
        }

        // Use provided folder_path or current directory
        const syncPath = folderPath || process.cwd();

        // Import plans from folder
        const result = await importPlansFromFolder(projectId, syncPath);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              project_id: projectId,
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
    'Quick shortcut to sync markdown files from the current folder as plans. Auto-detects the project from .pm-ai config.',
    {},
    async () => {
      try {
        const result = await importPlansFromCurrentFolder();

        if (!result) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Could not sync current folder',
                details: 'No .pm-ai config file found in current directory. Initialize PM-AI first.',
                hint: 'Run "init_project_in_current_folder" first'
              }, null, 2)
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              folder_path: process.cwd(),
              result: {
                imported: result.imported,
                updated: result.updated,
                skipped: result.skipped,
                errors: result.errors.length
              },
              message: `Synced ${result.imported} new plan(s), updated ${result.updated} plan(s) from current folder`,
              errors: result.errors.length > 0 ? result.errors : undefined
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
