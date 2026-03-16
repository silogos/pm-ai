import { getFeatureProgress } from '@pm-ai/core';

export async function progressCommand(args: string[]): Promise<void> {
  const featureId = args[0];
  if (!featureId) {
    console.error('Usage: pm-ai progress <feature-id>');
    process.exit(1);
  }

  try {
    const progress = await getFeatureProgress(featureId);
    console.log(`\nProgress for feature ${featureId}:\n`);
    console.log(`Total Tasks: ${progress.total}`);
    console.log(`Planned: ${progress.planned} (${Math.round((progress.planned / progress.total) * 100)}%)`);
    console.log(`In Review: ${progress.inReview} (${Math.round((progress.inReview / progress.total) * 100)}%)`);
    console.log(`Completed: ${progress.completed} (${progress.percentage}%)`);
    console.log(`\nBy Priority:`);
    console.log(`  High: ${progress.byPriority.high.completed}/${progress.byPriority.high.total} completed`);
    console.log(`  Medium: ${progress.byPriority.medium.completed}/${progress.byPriority.medium.total} completed`);
    console.log(`  Low: ${progress.byPriority.low.completed}/${progress.byPriority.low.total} completed`);
  } catch (error) {
    console.error('Failed to get progress:', error);
    process.exit(1);
  }
}
