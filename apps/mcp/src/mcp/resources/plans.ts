import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPlans } from '@pm-ai/core';
import { getFeatureById } from '@pm-ai/core';

export async function registerPlansResource(server: McpServer): Promise<void> {
  // Create a resource template for plans
  const plansTemplate = new ResourceTemplate('pmai://plans/{feature_id}', {
    list: async () => {
      // Return empty list as actual resources depend on feature_id
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
      description: 'Get all plans for a specific feature'
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

        // Get plans for this feature
        const plans = await getPlans(featureId);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              feature_id: featureId,
              feature_name: feature.name,
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
