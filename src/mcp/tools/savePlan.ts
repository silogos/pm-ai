import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { savePlan as savePlanToDb, getPlanById } from '../../services/planService.js';
import { saveTasks, type TaskInput } from '../../services/taskService.js';
import { getProjectById } from '../../services/projectService.js';
import { randomUUID } from 'node:crypto';

const SavePlanSchema = z.object({
  project_id: z.string().describe('The ID of the project to save the plan to'),
  title: z.string().describe('The title of the plan'),
  markdown: z.string().describe('The markdown content of the plan'),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    flag: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
    dependencies: z.array(z.string()).optional(),
    status: z.enum(['planned', 'review', 'done']).optional()
  })).optional().describe('Array of tasks associated with this plan')
});

export async function registerSavePlanTool(server: McpServer): Promise<void> {
  server.tool(
    'save_plan',
    'Save a project plan with its markdown content and optional structured tasks to the database',
    SavePlanSchema.shape,
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

        // Save the plan
        const planId = await savePlanToDb(input.project_id, input.title, input.markdown);

        // Save tasks if provided
        let taskCount = 0;
        if (input.tasks && input.tasks.length > 0) {
          await saveTasks(planId, input.tasks as TaskInput[]);
          taskCount = input.tasks.length;
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              plan_id: planId,
              project_id: input.project_id,
              title: input.title,
              tasks_saved: taskCount,
              message: `Plan "${input.title}" saved successfully with ${taskCount} tasks`
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to save plan',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
