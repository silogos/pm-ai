import * as fs from 'fs/promises';
import * as path from 'path';
import { getDb } from '../../db/client.js';
import { workspaces, projects, type Workspace, type NewWorkspace, type Project } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getAllProjects } from '../projects/index.js';
import { getProjectProgress } from '../shared/progressService.js';

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  progress?: {
    total: number;
    planned: number;
    inReview: number;
    completed: number;
    percentage: number;
  };
}

export interface WorkspaceOverview {
  rootPath: string;
  totalProjects: number;
  projects: WorkspaceProject[];
}

export interface PmAiConfig {
  version: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  description?: string;
}

/**
 * Scan a directory for .pm-ai config files
 */
export async function scanWorkspace(rootPath: string, maxDepth: number = 3): Promise<WorkspaceOverview> {
  const configFiles = await findPmAiConfigs(rootPath, 0, maxDepth);
  const allProjects = await getAllProjects();

  // Map projects by ID for quick lookup
  const projectMap = new Map(allProjects.map(p => [p.id, p]));

  // Build workspace projects list
  const workspaceProjects: WorkspaceProject[] = [];

  for (const configPath of configFiles) {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: PmAiConfig = JSON.parse(configContent);

      const project = projectMap.get(config.projectId);
      if (project) {
        const progress = await getProjectProgress(project.id);

        workspaceProjects.push({
          id: project.id,
          name: project.name,
          description: project.description || null,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt || project.createdAt,
          workspaceId: project.workspaceId,
          progress
        });
      }
    } catch (error) {
      console.error(`Error reading config file ${configPath}:`, error);
    }
  }

  // Also include projects that might not have .pm-ai config but are in the database
  for (const project of allProjects) {
    if (!workspaceProjects.find(wp => wp.id === project.id)) {
      const progress = await getProjectProgress(project.id);

      workspaceProjects.push({
        id: project.id,
        name: project.name,
        description: project.description || null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt || project.createdAt,
        workspaceId: project.workspaceId,
        progress
      });
    }
  }

  return {
    rootPath,
    totalProjects: workspaceProjects.length,
    projects: workspaceProjects
  };
}

/**
 * Scan the current working directory for workspace
 */
export async function scanCurrentWorkspace(): Promise<WorkspaceOverview> {
  return await scanWorkspace(process.cwd());
}

/**
 * Get workspace statistics
 */
export async function getWorkspaceStatistics(rootPath: string): Promise<{
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}> {
  const overview = await scanWorkspace(rootPath);

  let totalTasks = 0;
  let completedTasks = 0;

  for (const project of overview.projects) {
    if (project.progress) {
      totalTasks += project.progress.total;
      completedTasks += project.progress.completed;
    }
  }

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalProjects: overview.totalProjects,
    totalTasks,
    completedTasks,
    overallProgress
  };
}

/**
 * Recursively find .pm-ai config files
 */
async function findPmAiConfigs(dirPath: string, depth: number, maxDepth: number): Promise<string[]> {
  const configs: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // Check for .pm-ai config file in current directory
    const hasConfig = entries.some(e => e.name === '.pm-ai');
    if (hasConfig) {
      configs.push(path.join(dirPath, '.pm-ai'));
    }

    // Recursively scan subdirectories
    if (depth < maxDepth) {
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip hidden directories and common non-project directories
        if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subConfigs = await findPmAiConfigs(fullPath, depth + 1, maxDepth);
          configs.push(...subConfigs);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return configs;
}

/**
 * Find projects in a workspace (by workspace path)
 */
export async function findProjectsInDirectory(workspacePath: string): Promise<Project[]> {
  const db = getDb();

  const workspace = await getWorkspaceByPath(workspacePath);
  if (!workspace) {
    return [];
  }

  return await db.select().from(projects).where(eq(projects.workspaceId, workspace.id));
}

// ============================================================================
// Workspace CRUD Functions
// ============================================================================

/**
 * Create a new workspace
 */
export async function createWorkspace(name: string, workspacePath: string, description?: string): Promise<string> {
  const db = getDb();
  const workspaceId = randomUUID();
  await db.insert(workspaces).values({
    id: workspaceId,
    name,
    path: workspacePath,
    description: description || null
  });
  return workspaceId;
}

/**
 * Get a workspace by ID
 */
export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const db = getDb();
  const result = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  return result[0] || null;
}

/**
 * Get a workspace by path (absolute path, unique)
 */
export async function getWorkspaceByPath(workspacePath: string): Promise<Workspace | null> {
  const db = getDb();
  const normalizedPath = path.resolve(workspacePath);
  const result = await db.select().from(workspaces).where(eq(workspaces.path, normalizedPath)).limit(1);
  return result[0] || null;
}

/**
 * Get all workspaces
 */
export async function getAllWorkspaces(): Promise<Workspace[]> {
  const db = getDb();
  return await db.select().from(workspaces);
}

/**
 * Update workspace description
 */
export async function updateWorkspaceDescription(workspaceId: string, description: string): Promise<Workspace | null> {
  const db = getDb();
  await db.update(workspaces).set({ description, updatedAt: new Date().toISOString() }).where(eq(workspaces.id, workspaceId));
  return await getWorkspaceById(workspaceId);
}

/**
 * Touch workspace (update updated_at timestamp)
 */
export async function touchWorkspace(workspaceId: string): Promise<void> {
  const db = getDb();
  await db.update(workspaces).set({ updatedAt: new Date().toISOString() }).where(eq(workspaces.id, workspaceId));
}

/**
 * Get all projects in a workspace
 */
export async function getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
  const db = getDb();
  return await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
}
