import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPlans } from '@pm-ai/core';
import { getProjectById } from '@pm-ai/core';

export async function registerPlansResource(server: McpServer): Promise<void> {
  // Create a resource template for plans
  const plansTemplate = new ResourceTemplate('pmai://plans/{project_id}', {
    list: async () => {
      // Return empty list as actual resources depend on project_id
      return {
        resources: []
      };
    }
  });

  // Register the resource template
  server.registerResource(
    'plans',
    plansTemplate,
    {
      description: 'Get all plans for a specific project'
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

        // Get plans for this project
        const plans = await getPlans(projectId);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              project_id: projectId,
              project_name: project.name,
              plans: plans.map(plan => ({
                id: plan.id,
                title: plan.title,
                markdown: plan.markdown,
                created_at: plan.createdAt
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
              error: 'Failed to retrieve plans',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
