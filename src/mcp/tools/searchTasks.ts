import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchTasks } from '../../services/taskQueryService.js';
import { getProjectById } from '../../services/projectService.js';
import { parseDependencies } from '../../services/taskService.js';

const SearchTasksSchema = z.object({
  project_id: z.string().describe('The ID of the project to search in'),
  query: z.string().describe('Search query to match against task titles and descriptions')
});

export async function registerSearchTasksTool(server: McpServer): Promise<void> {
  server.tool(
    'search_tasks',
    'Search for tasks by keyword in title or description',
    SearchTasksSchema.shape,
    async (input) => {
      try {
        // Verify project exists
        const project = await getProjectById(input.project_id);
        if (!project) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Project not found' }, null, 2)
            }]
          };
        }

        // Search for tasks
        const tasks = await searchTasks(input.project_id, input.query);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              project_id: input.project_id,
              project_name: project.name,
              query: input.query,
              count: tasks.length,
              tasks: tasks.map(task => ({
                id: task.id,
                plan_id: task.planId,
                plan_title: task.planTitle,
                title: task.title,
                description: task.description,
                flag: task.flag,
                priority: task.priority,
                dependencies: parseDependencies(task.dependencies),
                status: task.status
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to search tasks',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
