import { db } from '../db/client.js';
import { projects } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export async function createProject(name: string): Promise<string> {
  const projectId = randomUUID();
  await db.insert(projects).values({
    id: projectId,
    name
  });
  return projectId;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0] || null;
}

export async function getAllProjects(): Promise<Project[]> {
  return await db.select().from(projects);
}
