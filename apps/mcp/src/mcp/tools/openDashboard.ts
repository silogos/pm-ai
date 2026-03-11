import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { HttpServerManager } from '../../server/HttpServerManager.js';

const execAsync = promisify(exec);

export async function registerOpenDashboardTool(
  server: McpServer,
  httpServerManager: HttpServerManager
): Promise<void> {
  server.tool(
    'open_dashboard',
    'Open the PM-AI web dashboard in your browser. Provides a visual interface for managing projects, viewing task boards, and analyzing dependencies.',
    {
      project_id: z.string().uuid().optional().describe('Optional project ID to open a specific project directly')
    },
    async (args) => {
      const { project_id } = args;

      try {
        // Lazy spawn HTTP server if not running
        if (!httpServerManager.isRunning()) {
          const serverUrl = await httpServerManager.spawn();
          const finalUrl = project_id
            ? `${serverUrl}/project/${project_id}`
            : serverUrl;

          // Open browser
          const command = process.platform === 'darwin' ? 'open' :
                         process.platform === 'win32' ? 'start' :
                         'xdg-open';

          await execAsync(`${command} ${finalUrl}`);

          return {
            content: [{
              type: 'text',
              text: `Dashboard opened at ${finalUrl}`
            }]
          };
        }

        // Server already running, just open browser
        const url = httpServerManager.getUrl();
        if (!url) {
          throw new Error('HTTP server URL not available');
        }

        const finalUrl = project_id ? `${url}/project/${project_id}` : url;
        const command = process.platform === 'darwin' ? 'open' :
                       process.platform === 'win32' ? 'start' :
                       'xdg-open';

        await execAsync(`${command} ${finalUrl}`);

        return {
          content: [{
            type: 'text',
            text: `Dashboard opened at ${finalUrl}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Failed to open dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );
}
