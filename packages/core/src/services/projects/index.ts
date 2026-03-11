import { getDb } from '../../db/client.js';
import { projects, type Project } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

/**
 * Create a new project in a workspace
 */
export async function createProject(name: string, workspaceId: string): Promise<string> {
  const db = getDb();
  const projectId = randomUUID();
  await db.insert(projects).values({
    id: projectId,
    name,
    workspaceId
  });
  return projectId;
}

/**
 * Create a new project in a workspace with description
 */
export async function createProjectWithDescription(
  name: string,
  workspaceId: string,
  description?: string
): Promise<string> {
  const db = getDb();
  const projectId = randomUUID();
  await db.insert(projects).values({
    id: projectId,
    name,
    workspaceId,
    description: description || null
  });
  return projectId;
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const db = getDb();
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0] || null;
}

/**
 * Get all projects
 */
export async function getAllProjects(): Promise<Project[]> {
  const db = getDb();
  return await db.select().from(projects);
}

/**
 * Update project description
 */
export async function updateProjectDescription(projectId: string, description: string): Promise<Project | null> {
  const db = getDb();
  await db.update(projects).set({ description, updatedAt: new Date().toISOString() }).where(eq(projects.id, projectId));
  return await getProjectById(projectId);
}

/**
 * Touch project (update updated_at timestamp)
 */
export async function touchProject(projectId: string): Promise<void> {
  const db = getDb();
  await db.update(projects).set({ updatedAt: new Date().toISOString() }).where(eq(projects.id, projectId));
}

/**
 * Get projects by workspace ID
 */
export async function getProjectsByWorkspace(workspaceId: string): Promise<Project[]> {
  const db = getDb();
  return await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
}
