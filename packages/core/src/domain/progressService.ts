import { getDb } from '../db/client.js';
import { tasks, plans } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export type ProgressStats = {
  total: number;
  planned: number;
  inReview: number;
  completed: number;
  percentage: number;
  byPriority: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
};

/**
 * Get progress statistics for a project
 */
export async function getProjectProgress(projectId: string): Promise<ProgressStats> {
  const db = getDb();
  // Get all tasks for the project
  const projectTasks = await db
    .select({
      status: tasks.status,
      priority: tasks.priority
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(eq(plans.projectId, projectId));

  const total = projectTasks.length;

  // Count by status
  const planned = projectTasks.filter(t => t.status === 'planned').length;
  const inReview = projectTasks.filter(t => t.status === 'review').length;
  const completed = projectTasks.filter(t => t.status === 'done').length;

  // Calculate percentage
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Breakdown by priority
  const highTasks = projectTasks.filter(t => t.priority === 'high');
  const mediumTasks = projectTasks.filter(t => t.priority === 'medium');
  const lowTasks = projectTasks.filter(t => t.priority === 'low');

  const byPriority = {
    high: {
      total: highTasks.length,
      completed: highTasks.filter(t => t.status === 'done').length
    },
    medium: {
      total: mediumTasks.length,
      completed: mediumTasks.filter(t => t.status === 'done').length
    },
    low: {
      total: lowTasks.length,
      completed: lowTasks.filter(t => t.status === 'done').length
    }
  };

  return {
    total,
    planned,
    inReview,
    completed,
    percentage,
    byPriority
  };
}

/**
 * Get progress statistics for a specific plan
 */
export async function getPlanProgress(planId: string): Promise<ProgressStats> {
  const db = getDb();
  const planTasks = await db
    .select({
      status: tasks.status,
      priority: tasks.priority
    })
    .from(tasks)
    .where(eq(tasks.planId, planId));

  const total = planTasks.length;

  // Count by status
  const planned = planTasks.filter(t => t.status === 'planned').length;
  const inReview = planTasks.filter(t => t.status === 'review').length;
  const completed = planTasks.filter(t => t.status === 'done').length;

  // Calculate percentage
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Breakdown by priority
  const highTasks = planTasks.filter(t => t.priority === 'high');
  const mediumTasks = planTasks.filter(t => t.priority === 'medium');
  const lowTasks = planTasks.filter(t => t.priority === 'low');

  const byPriority = {
    high: {
      total: highTasks.length,
      completed: highTasks.filter(t => t.status === 'done').length
    },
    medium: {
      total: mediumTasks.length,
      completed: mediumTasks.filter(t => t.status === 'done').length
    },
    low: {
      total: lowTasks.length,
      completed: lowTasks.filter(t => t.status === 'done').length
    }
  };

  return {
    total,
    planned,
    inReview,
    completed,
    percentage,
    byPriority
  };
}
