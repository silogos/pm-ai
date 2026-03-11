import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchTasks } from '@pm-ai/core';
import { getFeatureById } from '@pm-ai/core';
import { parseDependencies } from '@pm-ai/core';

const SearchTasksSchema = z.object({
  feature_id: z.string().describe('The ID of the feature to search in'),
  query: z.string().describe('Search query to match against task titles and descriptions')
});

export async function registerSearchTasksTool(server: McpServer): Promise<void> {
  server.tool(
    'search_tasks',
    'Search for tasks by keyword in title or description',
    SearchTasksSchema.shape,
    async (input) => {
      try {
        // Verify feature exists
        const feature = await getFeatureById(input.feature_id);
        if (!feature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Feature not found' }, null, 2)
            }]
          };
        }

        // Search for tasks
        const tasks = await searchTasks(input.feature_id, input.query);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              feature_id: input.feature_id,
              feature_name: feature.name,
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
