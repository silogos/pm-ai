import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function registerOpenDashboardTool(server: McpServer): Promise<void> {
  server.tool(
    'open_dashboard',
    'Open the PM-AI web dashboard in your browser. Provides a visual interface for managing projects, viewing task boards, and analyzing dependencies.',
    {
      project_id: z.string().uuid().optional().describe('Optional project ID to open a specific project directly')
    },
    async (args) => {
      const { project_id } = args;
      const webServerUrl = (global as any).webServerUrl;

      if (!webServerUrl) {
        return {
          content: [{
            type: 'text',
            text: 'Web dashboard is not available. The HTTP server may not have started correctly.'
          }],
          isError: true
        };
      }

      const url = project_id
        ? `${webServerUrl}/project/${project_id}`
        : webServerUrl;

      try {
        // Open the URL in the default browser
        const command = process.platform === 'darwin' ? 'open' :
                       process.platform === 'win32' ? 'start' :
                       'xdg-open';

        await execAsync(`${command} ${url}`);

        return {
          content: [{
            type: 'text',
            text: `Dashboard opened at ${url}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Failed to open dashboard automatically. Please visit ${url} in your browser.`
          }],
          isError: true
        };
      }
    }
  );
}
