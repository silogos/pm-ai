import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { filterTasks } from '../../services/taskQueryService.js';
import { getProjectById } from '../../services/projectService.js';
import { parseDependencies } from '../../services/taskService.js';

const FilterTasksSchema = z.object({
  project_id: z.string().describe('The ID of the project to filter tasks in'),
  status: z.array(z.enum(['planned', 'review', 'done'])).optional().describe('Filter by task status (one or more)'),
  priority: z.array(z.enum(['high', 'medium', 'low'])).optional().describe('Filter by task priority (one or more)'),
  plan_id: z.string().optional().describe('Filter by specific plan ID')
});

export async function registerFilterTasksTool(server: McpServer): Promise<void> {
  server.tool(
    'filter_tasks',
    'Filter tasks by status, priority, plan ID, or any combination of these criteria',
    FilterTasksSchema.shape,
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

        // Build filters object
        const filters: {
          status?: ('planned' | 'review' | 'done')[];
          priority?: ('high' | 'medium' | 'low')[];
          planId?: string;
        } = {};

        if (input.status) {
          filters.status = input.status;
        }

        if (input.priority) {
          filters.priority = input.priority;
        }

        if (input.plan_id) {
          filters.planId = input.plan_id;
        }

        // Check if at least one filter is provided
        if (Object.keys(filters).length === 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'No filters provided',
                message: 'Please provide at least one filter: status, priority, or plan_id'
              }, null, 2)
            }]
          };
        }

        // Filter tasks
        const tasks = await filterTasks(input.project_id, filters);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              project_id: input.project_id,
              project_name: project.name,
              filters: {
                ...filters,
                plan_id: filters.planId
              },
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
              error: 'Failed to filter tasks',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
