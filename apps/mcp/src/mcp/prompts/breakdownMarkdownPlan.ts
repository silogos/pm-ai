import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function registerBreakdownPrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'breakdown_markdown_plan',
    {
      description: 'Convert a markdown project plan into structured tasks',
      argsSchema: {
        markdown: z.string().describe('The markdown content of the project plan to breakdown'),
        project_id: z.string().describe('The ID of the project this plan belongs to')
      }
    },
    (args) => {
      const markdown = args.markdown as string || '';
      const projectId = args.project_id as string || '';

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please analyze the following markdown project plan and convert it into structured tasks.

Project ID: ${projectId}

Markdown Plan:
${markdown}

For each task you identify, extract:
- title: A concise task title
- description: Detailed description of what needs to be done
- priority: high/medium/low (estimate based on importance)
- dependencies: Array of task titles this task depends on
- flag: Any important flags (e.g., "blocking", "needs-review", etc.)
- status: Should default to "planned"

Please structure your response as JSON that can be used with the save_plan tool. Format your response as:
{
  "title": "Overall Plan Title",
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "high",
      "dependencies": ["Other task title"],
      "flag": "blocking",
      "status": "planned"
    }
  ]
}`
            }
          }
        ]
      };
    }
  );
}
