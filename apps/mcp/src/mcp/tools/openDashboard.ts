import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '@pm-ai/config';

const DEFAULT_PORT = 8787;

const OpenDashboardSchema = z.object({
  project_id: z.string().uuid().optional().describe('Optional project ID to open a specific project directly')
});

export async function registerOpenDashboardTool(server: McpServer): Promise<void> {
  server.registerTool(
    'open_dashboard',
    {
      description: 'Get instructions to open the PM-AI web dashboard in your browser. Provides a visual interface for managing projects, viewing task boards, and analyzing dependencies.',
      inputSchema: OpenDashboardSchema
    },
    async (args) => {
      const { project_id } = args;

      try {
        const config = getConfig();
        const port = config.apiUrl ? parseInt(config.apiUrl.split(':')[2]) : DEFAULT_PORT;

        // Check if server is already running
        const isRunning = await checkServerRunning(port);

        // Construct dashboard URL
        const dashboardUrl = project_id
          ? `http://localhost:${port}/project/${project_id}`
          : `http://localhost:${port}`;

        if (isRunning) {
          return {
            content: [{
              type: 'text',
              text: `✅ PM-AI Dashboard is already running!

📊 Dashboard URL: ${dashboardUrl}

🌐 Open in your browser:
- macOS: open ${dashboardUrl}
- Linux: xdg-open ${dashboardUrl}
- Windows: start ${dashboardUrl}

Or click here: ${dashboardUrl}`
            }]
          };
        }

        // Server not running - provide instructions
        return {
          content: [{
            type: 'text',
            text: `🚀 PM-AI Dashboard Setup

To open the PM-AI dashboard, run this command in your terminal:

\`\`\`bash
pm-ai server
\`\`\`

Or with a specific port:
\`\`\`bash
pm-ai server ${port}
\`\`\`

Once the server is running:
📊 Dashboard URL: ${dashboardUrl}

💡 Tips:
- The server will start on http://localhost:${port}
- Press Ctrl+C to stop the server
- Dashboard will be available at ${dashboardUrl}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Failed to check dashboard status: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );
}

async function checkServerRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
