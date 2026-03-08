import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasks, parseDependencies } from '../../services/taskService.js';
import { getProjectById } from '../../services/projectService.js';

export async function registerTasksResource(server: McpServer): Promise<void> {
  // Create a resource template for tasks
  const tasksTemplate = new ResourceTemplate('pmai://tasks/{project_id}', {
    list: async () => {
      // Return empty list as actual resources depend on project_id
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
      description: 'Get all tasks for a specific project'
    },
    async (uri, variables, _extra) => {
      try {
        const projectId = variables.project_id as string;

        // Verify project exists
        const project = await getProjectById(projectId);
        if (!project) {
          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: 'Project not found' }, null, 2)
            }]
          };
        }

        // Get tasks for this project
        const tasks = await getTasks(projectId);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              project_id: projectId,
              project_name: project.name,
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
