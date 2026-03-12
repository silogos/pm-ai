import { getTasks, parseDependencies } from '@pm-ai/core';

export async function listTasksCommand(args: string[]): Promise<void> {
  const featureId = args[0];
  if (!featureId) {
    console.error('Usage: pm-ai list-tasks <feature-id>');
    process.exit(1);
  }

  try {
    const tasks = await getTasks(featureId);
    console.log(`\nTasks for feature ${featureId}:\n`);

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    for (const task of tasks) {
      console.log(`[${task.status.toUpperCase()}] ${task.title}`);
      console.log(`  Plan: ${task.planTitle}`);
      if (task.description) {
        console.log(`  Description: ${task.description}`);
      }
      if (task.priority) {
        console.log(`  Priority: ${task.priority}`);
      }
      const deps = parseDependencies(task.dependencies);
      if (deps.length > 0) {
        console.log(`  Dependencies: ${deps.join(', ')}`);
      }
      console.log(`  Task ID: ${task.id}\n`);
    }
  } catch (error) {
    console.error('Failed to list tasks:', error);
    process.exit(1);
  }
}
