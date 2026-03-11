import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { savePlan as savePlanToDb, getPlanById } from '@pm-ai/core';
import { saveTasks, type TaskInput } from '@pm-ai/core';
import { getFeatureById } from '@pm-ai/core';
import { randomUUID } from 'node:crypto';

const SavePlanSchema = z.object({
  feature_id: z.string().optional().describe('The ID of the feature to save the plan to (auto-detects workspace if not provided)'),
  feature_name: z.string().optional().describe('The name of the feature (will create feature if it doesn\'t exist)'),
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
    'Save a plan with its markdown content and optional structured tasks to the database. If feature_name is provided, will create the feature if it doesn\'t exist.',
    SavePlanSchema.shape,
    async (input) => {
      try {
        let featureId = input.feature_id;
        let featureName = input.feature_name;

        // If neither feature_id nor feature_name provided, try to auto-detect from plan title
        if (!featureId && !featureName) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Either feature_id or feature_name must be provided',
                message: 'Please specify which feature this plan belongs to'
              }, null, 2)
            }]
          };
        }

        // If feature_name provided but no feature_id, look up or create feature
        if (featureName && !featureId) {
          // Import here to avoid circular dependency
          const { requireWorkspace, getFeatureByWorkspaceAndName, createFeatureWithDescription } = await import('@pm-ai/core');

          // Auto-detect workspace
          const workspaceId = await requireWorkspace();

          // Check if feature exists
          const existingFeature = await getFeatureByWorkspaceAndName(workspaceId, featureName);
          if (existingFeature) {
            featureId = existingFeature.id;
          } else {
            // Create new feature
            featureId = await createFeatureWithDescription(featureName, workspaceId, `Feature: ${featureName}`);
          }
        }

        // Verify feature exists
        const feature = await getFeatureById(featureId!);
        if (!feature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ error: 'Feature not found' }, null, 2)
            }]
          };
        }

        // Save the plan
        const planId = await savePlanToDb(featureId!, input.title, input.markdown);

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
              feature_id: featureId,
              feature_name: feature.name,
              title: input.title,
              tasks_saved: taskCount,
              message: `Plan "${input.title}" saved successfully to feature "${feature.name}" with ${taskCount} tasks`
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
