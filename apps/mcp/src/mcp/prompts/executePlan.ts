import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getPlanById,
  getFeatureById,
  getTasksByPlanId,
  getWorkspaceById,
  type Task
} from '@pm-ai/core';

/**
 * Helper function to sort tasks topologically by dependencies
 */
function topologicalSort(tasks: any[]): any[] {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: any[] = [];

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
    result.push(task);
  }

  // Visit all tasks
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      visit(task.id);
    }
  }

  return result;
}

/**
 * Get status emoji for task
 */
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'done': return '✅';
    case 'review': return '🔄';
    case 'planned': return '📋';
    default: return '❓';
  }
}

export async function registerExecutePlanPrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'execute_plan',
    {
      description: '🚀 Execute all tasks in a plan autonomously from start to finish. Loads plan details from PM-AI database and provides complete context for sequential task execution.',
      argsSchema: {
        plan_id: z.string().describe('The ID of the plan to execute')
      }
    },
    async (args: any) => {
      try {
        // 1. Load semua data dari database
        const plan = await getPlanById(args.plan_id);
        if (!plan) {
          return {
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `❌ Error: Plan with ID "${args.plan_id}" not found in database.`
              }
            }]
          };
        }

        const feature = await getFeatureById(plan.featureId);
        if (!feature) {
          return {
            messages: [{
              role: 'user',
              content: {
                type: 'text',
                text: `❌ Error: Feature for plan "${plan.title}" not found.`
              }
            }]
          };
        }

        // Get workspace information
        const workspace = await getWorkspaceById(feature.workspaceId);

        const tasks = await getTasksByPlanId(args.plan_id);

        // 2. Sort tasks by dependencies (topological sort)
        const sortedTasks = topologicalSort(tasks);

        // 3. Calculate statistics
        const completedTasks = tasks.filter((t: Task) => t.status === 'done');
        const inProgressTasks = tasks.filter((t: Task) => t.status === 'review');
        const pendingTasks = tasks.filter((t: Task) => t.status === 'planned');

        // 4. Find first pending task
        const firstPendingTask = sortedTasks.find((t: Task) => t.status === 'planned');

        // 5. Build instruction message
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: `# 🚀 Execute Plan: ${plan.title}

## 📋 Context
- **Workspace:** ${workspace ? workspace.name : 'Unknown'}
- **Workspace Description:** ${workspace ? (workspace.description || 'No description provided') : 'N/A'}
- **Feature:** ${feature.name}
- **Feature Description:** ${feature.description || 'No description provided'}
- **Workspace ID:** ${feature.workspaceId}

## 📄 Plan Details
${plan.markdown || 'No additional plan details provided.'}

---

## 📊 Progress Overview

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Completed | ${completedTasks.length} | ${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% |
| 🔄 In Review | ${inProgressTasks.length} | ${tasks.length > 0 ? Math.round((inProgressTasks.length / tasks.length) * 100) : 0}% |
| 📋 Pending | ${pendingTasks.length} | ${tasks.length > 0 ? Math.round((pendingTasks.length / tasks.length) * 100) : 0}% |
| **Total** | **${tasks.length}** | **100%** |

---

## 📝 Task Execution Order

${sortedTasks.map((task, index) => {
  const status = task.status === 'done' ? '✅' :
                 task.status === 'review' ? '🔄' : '📋';
  const deps = task.dependencies ? JSON.parse(task.dependencies) : [];

  // Find dependency task titles
  const depTitles = deps.map((depId: string) => {
    const depTask = tasks.find((t: Task) => t.id === depId);
    return depTask ? `"${depTask.title}"` : `Unknown (${depId})`;
  });

  return `
### ${status} Task ${index + 1}: ${task.title}

**🆔 ID:** \`${task.id}\`

**📖 Description:** ${task.description || 'No description provided'}

**⚡ Priority:** ${task.priority ? task.priority.toUpperCase() : 'None'}

**🔗 Dependencies:** ${deps.length > 0 ? depTitles.join(', ') : 'None'}

**📊 Status:** \`${task.status}\`

${task.status === 'done' ? '✨ **This task is completed.**' :
  task.status === 'review' ? '🔄 **This task is currently in progress.**' :
  deps.length > 0 && deps.some((d: string) => !tasks.find((t: Task) => t.id === d && t.status === 'done')) ?
    '⚠️ **Blocked:** Waiting for dependencies to complete.' :
    '✅ **Ready to start.**'}
`;
}).join('\n---\n')}

---

## 🎯 Instructions for Autonomous Execution

### Phase 1: Start First Task
${firstPendingTask ? `
1. **Current Task:** "${firstPendingTask.title}" (ID: \`${firstPendingTask.id}\`)
2. **Mark as In Progress:** Use \`update_task\` tool:
   \`\`\`json
   {
     "task_id": "${firstPendingTask.id}",
     "status": "review"
   }
   \`\`\`
3. **Get Context:** Use \`get_task\` tool to see task details
4. **Complete the Work:** Implement required changes
5. **Mark as Done:** Use \`update_task\` tool with \`status: "done"\`
` : '✅ All tasks are completed! Great job!'}

### Phase 2: Continue Through Tasks
For each subsequent task:
1. **Check Dependencies:** Verify all dependencies are marked "done"
2. **Get Context:** Review completed dependency tasks for patterns/decisions
3. **Mark as "review":** Start the task
4. **Implement:** Complete the work
5. **Mark as "done":** Only after completion
6. **Next Task:** Move to the next pending task

### Phase 3: Completion
When all tasks are done:
1. **Verify:** All tasks show status "done"
2. **Summarize:** Provide summary of work completed
3. **List Files:** All files created/modified

---

## ⚠️ Critical Rules

1. **ONE TASK AT A TIME** - Do NOT work on multiple tasks simultaneously
2. **RESPECT DEPENDENCIES** - Complete dependencies before dependent tasks
3. **UPDATE STATUS** - Always update task status in PM-AI database
4. **USE CONTEXT** - Learn from completed tasks in the same plan
5. **SEQUENTIAL EXECUTION** - Follow the execution order above

---

## 🛠️ Available Tools

- \`update_task\` - Update task status (review/done)
- \`get_task\` - Get task details
- \`get_current_context\` - Get overall context (if available)
- \`filter_tasks\` - Filter tasks by status
- \`show_workspace\` - See workspace overview

---

## 🚀 Ready to Start?

${firstPendingTask ?
  `**Start now:** Work on Task "${firstPendingTask.title}"` +
  `\n**Task ID:** \`${firstPendingTask.id}\`\n` +
  `\n**First step:** Use \`update_task\` to mark it as "review"` :
  '🎉 **All tasks completed!** The plan is fully executed.'
}

---
*Generated from PM-AI database • Feature: ${feature.name} • Plan: ${plan.title}*`
            }
          }]
        };

      } catch (error) {
        return {
          messages: [{
            role: 'user',
            content: {
              type: 'text',
              text: `❌ Error loading plan: ${error instanceof Error ? error.message : String(error)}`
            }
          }]
        };
      }
    }
  );
}
