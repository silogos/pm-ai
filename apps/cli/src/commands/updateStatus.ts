import { updateTaskStatus } from '@pm-ai/core';

export async function updateStatusCommand(args: string[]): Promise<void> {
  const [taskId, status] = args;
  if (!taskId || !status) {
    console.error('Usage: pm-ai update-status <task-id> <planned|review|done>');
    process.exit(1);
  }

  const validStatuses = ['planned', 'review', 'done'];
  if (!validStatuses.includes(status)) {
    console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
  }

  try {
    const updated = await updateTaskStatus(taskId, status as 'planned' | 'review' | 'done');
    if (updated) {
      console.log(`Task status updated successfully!`);
      console.log(`Task ID: ${updated.id}`);
      console.log(`Title: ${updated.title}`);
      console.log(`New Status: ${updated.status}`);
    } else {
      console.error('Task not found.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to update task status:', error);
    process.exit(1);
  }
}
