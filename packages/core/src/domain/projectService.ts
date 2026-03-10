import { getDb } from '../db/client.js';
import { projects, type Project } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function createProject(name: string): Promise<string> {
  const db = getDb();
  const projectId = randomUUID();
  await db.insert(projects).values({
    id: projectId,
    name
  });
  return projectId;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const db = getDb();
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0] || null;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = getDb();
  return await db.select().from(projects);
}
