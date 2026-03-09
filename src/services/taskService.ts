import { db } from '../db/client.js';
import { tasks, plans } from '../db/schema.js';
import { eq, and, like, or, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export type TaskInput = {
  title: string;
  description?: string;
  flag?: string;
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
  status?: 'planned' | 'review' | 'done';
};

export type Task = {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  flag: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  dependencies: string | null;
  status: 'planned' | 'review' | 'done';
};

export type TaskWithPlan = Task & {
  planTitle: string;
  planId: string;
};

export async function saveTasks(planId: string, tasksData: TaskInput[]): Promise<string[]> {
  const taskIds: string[] = [];

  for (const taskData of tasksData) {
    const taskId = randomUUID();
    taskIds.push(taskId);

    await db.insert(tasks).values({
      id: taskId,
      planId,
      title: taskData.title,
      description: taskData.description || null,
      flag: taskData.flag || null,
      priority: taskData.priority || null,
      dependencies: taskData.dependencies ? JSON.stringify(taskData.dependencies) : null,
      status: taskData.status || 'planned'
    });
  }

  return taskIds;
}

export async function getTasks(projectId: string): Promise<TaskWithPlan[]> {
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
    .where(eq(plans.projectId, projectId));

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

export async function getTasksByPlanId(planId: string): Promise<Task[]> {
  return await db.select().from(tasks).where(eq(tasks.planId, planId));
}

export function parseDependencies(dependenciesJson: string | null): string[] {
  if (!dependenciesJson) return [];
  try {
    return JSON.parse(dependenciesJson);
  } catch {
    return [];
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  return result[0] || null;
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: 'planned' | 'review' | 'done'): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ status })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Update task priority
 */
export async function updateTaskPriority(taskId: string, priority: 'high' | 'medium' | 'low'): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ priority })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Update task title
 */
export async function updateTaskTitle(taskId: string, title: string): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ title })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Update task description
 */
export async function updateTaskDescription(taskId: string, description: string): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ description })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Update task flag
 */
export async function updateTaskFlag(taskId: string, flag: string | null): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ flag })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Update task dependencies
 */
export async function updateTaskDependencies(taskId: string, dependencies: string[]): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set({ dependencies: dependencies.length > 0 ? JSON.stringify(dependencies) : null })
    .where(eq(tasks.id, taskId))
    .returning();
  return result[0] || null;
}

/**
 * Delete a task by ID
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  await db.delete(tasks).where(eq(tasks.id, taskId));
  return true;
}

/**
 * Get tasks by status for a project
 */
export async function getTasksByStatus(projectId: string, status: 'planned' | 'review' | 'done'): Promise<TaskWithPlan[]> {
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
        eq(tasks.status, status)
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
 * Get tasks by priority for a project
 */
export async function getTasksByPriority(projectId: string, priority: 'high' | 'medium' | 'low'): Promise<TaskWithPlan[]> {
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
        eq(tasks.priority, priority)
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
