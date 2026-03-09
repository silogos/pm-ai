import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getCriticalPath, detectCircularDependencies } from '../../services/dependencyGraphService.js';
import { getProjectById } from '../../services/projectService.js';

const GetCriticalPathSchema = z.object({
  project_id: z.string().describe('The ID of the project to analyze'),
  check_circular: z.boolean().optional().default(false).describe('Also check for circular dependencies')
});

export async function registerGetCriticalPathTool(server: McpServer): Promise<void> {
  server.tool(
    'get_critical_path',
    'Get the critical path (longest dependency chain) for a project to identify bottlenecks',
    GetCriticalPathSchema.shape,
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

        const result: any = {
          project_id: input.project_id,
          project_name: project.name
        };

        // Get critical path
        const criticalPath = await getCriticalPath(input.project_id);
        result.critical_path = {
          length: criticalPath.length,
          tasks: criticalPath.path.map(node => ({
            position: node.position,
            task_id: node.taskId,
            title: node.title,
            status: node.status
          }))
        };

        // Optionally check for circular dependencies
        if (input.check_circular) {
          const circularCheck = await detectCircularDependencies(input.project_id);
          result.circular_dependencies = {
            has_cycles: circularCheck.hasCycles,
            cycles: circularCheck.cycles
          };

          if (circularCheck.hasCycles) {
            result.warning = 'Project contains circular dependencies which may affect the critical path calculation';
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
