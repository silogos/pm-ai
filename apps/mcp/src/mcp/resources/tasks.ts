import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasks, parseDependencies } from '@pm-ai/core';
import { getFeatureById } from '@pm-ai/core';

export async function registerTasksResource(server: McpServer): Promise<void> {
  // Create a resource template for tasks
  const tasksTemplate = new ResourceTemplate('pmai://tasks/{feature_id}', {
    list: async () => {
      // Return empty list as actual resources depend on feature_id
      return {
        resources: []
      };
    }
  });

  // Register the resource template
  server.registerResource(
    'tasks',
    tasksTemplate,
    {
      description: 'Get all tasks for a specific feature'
    },
    async (uri, variables, _extra) => {
      try {
        const featureId = variables.feature_id as string;

        // Verify feature exists
        const feature = await getFeatureById(featureId);
        if (!feature) {
          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: 'Feature not found' }, null, 2)
            }]
          };
        }

        // Get tasks for this feature
        const tasks = await getTasks(featureId);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              feature_id: featureId,
              feature_name: feature.name,
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
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: 'Failed to retrieve tasks',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
