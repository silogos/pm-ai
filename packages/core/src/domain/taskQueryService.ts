import { getDb } from '../db/client.js';
import { tasks, plans, type TaskStatus, type Priority } from '../db/schema.js';
import { eq, and, or, like, inArray } from 'drizzle-orm';
import type { TaskWithPlan } from './taskService.js';

export type TaskFilters = {
  status?: TaskStatus[];
  priority?: Priority[];
  planId?: string;
};

/**
 * Search tasks by keyword in title or description
 */
export async function searchTasks(projectId: string, query: string): Promise<TaskWithPlan[]> {
  const db = getDb();
  if (!query || query.trim() === '') {
    return [];
  }

  const searchPattern = `%${query}%`;

  const result = await db
    .select({
      id: tasks.id,
      planId: tasks.planId,
      title: tasks.title,
      description: tasks.description,
      flag: tasks.flag,
      priority: tasks.priority,
      dependencies: tasks.dependencies,
      status: tasks.status,
      planTitle: plans.title
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(
      and(
        eq(plans.projectId, projectId),
        or(
          like(tasks.title, searchPattern),
          like(tasks.description, searchPattern)
        )
      )
    );

  return result.map(row => ({
    id: row.id,
    planId: row.planId,
    title: row.title,
    description: row.description,
    flag: row.flag,
    priority: row.priority,
    dependencies: row.dependencies,
    status: row.status,
    planTitle: row.planTitle
  }));
}

/**
 * Filter tasks by multiple criteria
 */
export async function filterTasks(projectId: string, filters: TaskFilters): Promise<TaskWithPlan[]> {
  const db = getDb();
  const conditions = [];

  // Always filter by project
  conditions.push(eq(plans.projectId, projectId));

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    conditions.push(inArray(tasks.status, filters.status));
  }

  // Filter by priority (exclude null values from the array)
  if (filters.priority && filters.priority.length > 0) {
    const nonNullPriorities = filters.priority.filter((p): p is 'high' | 'medium' | 'low' => p !== null);
    if (nonNullPriorities.length > 0) {
      conditions.push(inArray(tasks.priority, nonNullPriorities));
    }
  }

  // Filter by plan
  if (filters.planId) {
    conditions.push(eq(tasks.planId, filters.planId));
  }

  const result = await db
    .select({
      id: tasks.id,
      planId: tasks.planId,
      title: tasks.title,
      description: tasks.description,
      flag: tasks.flag,
      priority: tasks.priority,
      dependencies: tasks.dependencies,
      status: tasks.status,
      planTitle: plans.title
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(and(...conditions));

  return result.map(row => ({
    id: row.id,
    planId: row.planId,
    title: row.title,
    description: row.description,
    flag: row.flag,
    priority: row.priority,
    dependencies: row.dependencies,
    status: row.status,
    planTitle: row.planTitle
  }));
}

/**
 * Search and filter combined
 */
export async function searchAndFilterTasks(
  projectId: string,
  query: string,
  filters: TaskFilters
): Promise<TaskWithPlan[]> {
  const db = getDb();
  if (!query || query.trim() === '') {
    return filterTasks(projectId, filters);
  }

  const searchPattern = `%${query}%`;
  const conditions = [];

  // Always filter by project
  conditions.push(eq(plans.projectId, projectId));

  // Add search condition
  conditions.push(
    or(
      like(tasks.title, searchPattern),
      like(tasks.description, searchPattern)
    )
  );

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    conditions.push(inArray(tasks.status, filters.status));
  }

  // Filter by priority (exclude null values from the array)
  if (filters.priority && filters.priority.length > 0) {
    const nonNullPriorities = filters.priority.filter((p): p is 'high' | 'medium' | 'low' => p !== null);
    if (nonNullPriorities.length > 0) {
      conditions.push(inArray(tasks.priority, nonNullPriorities));
    }
  }

  // Filter by plan
  if (filters.planId) {
    conditions.push(eq(tasks.planId, filters.planId));
  }

  const result = await db
    .select({
      id: tasks.id,
      planId: tasks.planId,
      title: tasks.title,
      description: tasks.description,
      flag: tasks.flag,
      priority: tasks.priority,
      dependencies: tasks.dependencies,
      status: tasks.status,
      planTitle: plans.title
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(and(...conditions));

  return result.map(row => ({
    id: row.id,
    planId: row.planId,
    title: row.title,
    description: row.description,
    flag: row.flag,
    priority: row.priority,
    dependencies: row.dependencies,
    status: row.status,
    planTitle: row.planTitle
  }));
}

/**
 * Get tasks by flag
 */
export async function getTasksByFlag(projectId: string, flag: string): Promise<TaskWithPlan[]> {
  const db = getDb();
  const result = await db
    .select({
      id: tasks.id,
      planId: tasks.planId,
      title: tasks.title,
      description: tasks.description,
      flag: tasks.flag,
      priority: tasks.priority,
      dependencies: tasks.dependencies,
      status: tasks.status,
      planTitle: plans.title
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(
      and(
        eq(plans.projectId, projectId),
        eq(tasks.flag, flag)
      )
    );

  return result.map(row => ({
    id: row.id,
    planId: row.planId,
    title: row.title,
    description: row.description,
    flag: row.flag,
    priority: row.priority,
    dependencies: row.dependencies,
    status: row.status,
    planTitle: row.planTitle
  }));
}
