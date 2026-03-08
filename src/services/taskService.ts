import { db } from '../db/client.js';
import { tasks, plans } from '../db/schema.js';
import { eq } from 'drizzle-orm';
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
