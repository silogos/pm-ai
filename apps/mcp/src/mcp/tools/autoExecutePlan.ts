import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getPlanById,
  getFeatureById,
  getTasksByPlanId,
  getWorkspaceById
} from '@pm-ai/core';

/**
 * Helper function to sort tasks topologically by dependencies
 */
function topologicalSortWithStatus(tasks: any[]): {pending: any[], completed: any[]} {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const visited = new Set<string>();
  const temp = new Set<string>();
  const pending: any[] = [];
  const completed: any[] = [];

  function visit(taskId: string): void {
    if (visited.has(taskId)) return;
    if (temp.has(taskId)) {
      // Circular dependency detected, skip
      console.error(`Circular dependency detected for task: ${taskId}`);
      return;
    }

    temp.add(taskId);
    const task = taskMap.get(taskId);
    if (!task) return;

    // Visit dependencies first
    const deps = task.dependencies ? JSON.parse(task.dependencies) : [];
    for (const depId of deps) {
      visit(depId);
    }

    temp.delete(taskId);
    visited.add(taskId);

    // Separate by status
    if (task.status === 'done') {
      completed.push(task);
    } else {
      pending.push(task);
    }
  }

  // Visit all tasks
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      visit(task.id);
    }
  }

  return { pending, completed };
}

const AutoExecutePlanSchema = z.object({
  plan_id: z.string().describe('Plan ID to auto-execute'),
  include_full_context: z.boolean().optional().default(false).describe('Include full context from completed tasks')
});

export async function registerAutoExecutePlanTool(server: McpServer): Promise<void> {
  server.tool(
    'auto_execute_plan',
    'Automatically execute all pending tasks in a plan. Returns tasks in execution order with full context for autonomous completion.',
    AutoExecutePlanSchema.shape,
    async (input: any) => {
      try {
        // 1. Load plan dari database
        const plan = await getPlanById(input.plan_id);
        if (!plan) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Plan not found',
                plan_id: input.plan_id,
                suggestion: 'Use show_workspace or filter_tasks to find the correct plan_id'
              }, null, 2)
            }]
          };
        }

        // 2. Load feature
        const feature = await getFeatureById(plan.featureId);
        if (!feature) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Feature not found',
                feature_id: plan.featureId
              }, null, 2)
            }]
          };
        }

        // 2.5. Load workspace
        const workspace = await getWorkspaceById(feature.workspaceId);

        // 3. Load semua tasks
        const tasks = await getTasksByPlanId(input.plan_id);

        if (tasks.length === 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Plan exists but has no tasks',
                plan: {
                  id: plan.id,
                  title: plan.title
                }
              }, null, 2)
            }]
          };
        }

        // 4. Sort by dependencies dan separate by status
        const { pending, completed } = topologicalSortWithStatus(tasks);

        // 5. Build execution queue with dependencies resolved
        const executionQueue = pending.map((task, index) => {
          const deps = task.dependencies ? JSON.parse(task.dependencies) : [];
          const depTasks = deps
            .map((depId: string) => completed.find((ct: any) => ct.id === depId))
            .filter(Boolean);

          // Check if all dependencies are completed
          const allDepsComplete = deps.length === 0 || depTasks.length === deps.length;

          return {
            sequence_number: index + 1,
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority || 'medium',
            status: task.status,
            dependencies: depTasks.map((dt: any) => ({
              id: dt.id,
              title: dt.title,
              description: dt.description
            })),
            ready_to_start: allDepsComplete,
            blocked_by: deps.length > 0 ? deps.filter((d: string) => !completed.find((ct: any) => ct.id === d)) : []
          };
        });

        // 6. Build completed tasks reference
        const completedTasksRef = input.include_full_context ? completed.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status
        })) : [];

        // 7. Build response
        const response = {
          success: true,
          mode: 'AUTONOMOUS_EXECUTION',
          plan: {
            id: plan.id,
            title: plan.title,
            markdown: plan.markdown
          },
          workspace: workspace ? {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description
          } : null,
          feature: {
            id: feature.id,
            name: feature.name,
            description: feature.description,
            workspace_id: feature.workspaceId
          },
          progress: {
            total: tasks.length,
            completed: completed.length,
            remaining: pending.length,
            percentage: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
          },
          execution_queue: executionQueue,
          completed_tasks: input.include_full_context ? completedTasksRef : undefined,
          next_steps: pending.length > 0 ? [
            `🎯 Start with task #1: "${pending[0].title}"`,
            `🆔 Task ID: ${pending[0].id}`,
            `📋 Use update_task tool: {"task_id": "${pending[0].id}", "status": "review"}`,
            `✅ Complete the work described in the task`,
            `💾 Mark as done: {"task_id": "${pending[0].id}", "status": "done"}`,
            `➡️  Proceed to next task in queue`,
            `📊 Total tasks remaining: ${pending.length}`
          ] : ['🎉 All tasks are completed!'],
          workflow: {
            phases: [
              {
                phase: 1,
                name: 'Start Task',
                steps: [
                  'Use update_task to mark current task as "review"',
                  'Use get_task to get full task details',
                  'Review any completed dependency tasks'
                ]
              },
              {
                phase: 2,
                name: 'Implement',
                steps: [
                  'Complete the work (code changes, file creation, etc.)',
                  'Test your changes if applicable',
                  'Verify the implementation matches requirements'
                ]
              },
              {
                phase: 3,
                name: 'Complete Task',
                steps: [
                  'Use update_task to mark task as "done"',
                  'Only then proceed to next task',
                  'Repeat until all tasks are done'
                ]
              }
            ],
            critical_rules: [
              '⚠️  Work through tasks ONE AT A TIME - do not parallelize',
              '⚠️  RESPECT DEPENDENCIES - wait for blocked tasks',
              '⚠️  UPDATE STATUS in PM-AI database after each task',
              '⚠️  USE CONTEXT from completed tasks as reference',
              '⚠️  FOLLOW the execution queue order above'
            ]
          },
          tools_available: [
            'update_task - Update task status (review/done)',
            'get_task - Get detailed task information',
            'filter_tasks - Filter tasks by status',
            'show_workspace - View workspace overview',
            'get_current_context - Get overall context'
          ]
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to execute plan',
              details: error instanceof Error ? error.message : String(error),
              suggestion: 'Check the plan_id and ensure the plan exists in PM-AI database'
            }, null, 2)
          }]
        };
      }
    }
  );
}
