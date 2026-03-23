import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getCriticalPath, detectCircularDependencies, type CriticalPathNode } from '@pm-ai/core';
import { getFeatureById } from '@pm-ai/core';

const GetCriticalPathSchema = z.object({
  feature_id: z.string().describe('The ID of the feature to analyze'),
  check_circular: z.boolean().optional().default(false).describe('Also check for circular dependencies')
});

export async function registerGetCriticalPathTool(server: McpServer): Promise<void> {
  server.registerTool(
    'get_critical_path',
    {
      description: 'Get the critical path (longest dependency chain) for a feature to identify bottlenecks',
      inputSchema: GetCriticalPathSchema
    },
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

        const result: any = {
          feature_id: input.feature_id,
          feature_name: feature.name
        };

        // Get critical path
        const criticalPath = await getCriticalPath(input.feature_id);
        result.critical_path = {
          length: criticalPath.length,
          tasks: criticalPath.path.map((node: CriticalPathNode) => ({
            position: node.position,
            task_id: node.taskId,
            title: node.title,
            status: node.status
          }))
        };

        // Optionally check for circular dependencies
        if (input.check_circular) {
          const circularCheck = await detectCircularDependencies(input.feature_id);
          result.circular_dependencies = {
            has_cycles: circularCheck.hasCycles,
            cycles: circularCheck.cycles
          };

          if (circularCheck.hasCycles) {
            result.warning = 'Feature contains circular dependencies which may affect the critical path calculation';
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to get critical path',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
