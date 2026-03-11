import * as fs from 'fs/promises';
import * as path from 'path';
import { getDb } from '../../db/client.js';
import { workspaces, features, type Workspace, type NewWorkspace, type Feature } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getAllFeatures } from '../features/index.js';
import { getFeatureProgress } from '../shared/progressService.js';

// Re-export detection utilities
export {
  detectWorkspace,
  detectWorkspaceFromPath,
  requireWorkspace
} from './detection.js';

export interface WorkspaceFeature {
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
  totalFeatures: number;
  features: WorkspaceFeature[];
}

export interface PmAiConfig {
  version: string;
  featureId: string;
  featureName: string;
  createdAt: string;
  description?: string;
}

/**
 * Scan a directory for .pm-ai config files
 */
export async function scanWorkspace(rootPath: string, maxDepth: number = 3): Promise<WorkspaceOverview> {
  const configFiles = await findPmAiConfigs(rootPath, 0, maxDepth);
  const allFeatures = await getAllFeatures();

  // Map features by ID for quick lookup
  const featureMap = new Map(allFeatures.map(p => [p.id, p]));

  // Build workspace features list
  const workspaceFeatures: WorkspaceFeature[] = [];

  for (const configPath of configFiles) {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: PmAiConfig = JSON.parse(configContent);

      const feature = featureMap.get(config.featureId);
      if (feature) {
        const progress = await getFeatureProgress(feature.id);

        workspaceFeatures.push({
          id: feature.id,
          name: feature.name,
          description: feature.description || null,
          createdAt: feature.createdAt,
          updatedAt: feature.updatedAt || feature.createdAt,
          workspaceId: feature.workspaceId,
          progress
        });
      }
    } catch (error) {
      console.error(`Error reading config file ${configPath}:`, error);
    }
  }

  // Also include features that might not have .pm-ai config but are in the database
  for (const feature of allFeatures) {
    if (!workspaceFeatures.find(wp => wp.id === feature.id)) {
      const progress = await getFeatureProgress(feature.id);

      workspaceFeatures.push({
        id: feature.id,
        name: feature.name,
        description: feature.description || null,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt || feature.createdAt,
        workspaceId: feature.workspaceId,
        progress
      });
    }
  }

  return {
    rootPath,
    totalFeatures: workspaceFeatures.length,
    features: workspaceFeatures
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
  totalFeatures: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}> {
  const overview = await scanWorkspace(rootPath);

  let totalTasks = 0;
  let completedTasks = 0;

  for (const feature of overview.features) {
    if (feature.progress) {
      totalTasks += feature.progress.total;
      completedTasks += feature.progress.completed;
    }
  }

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalFeatures: overview.totalFeatures,
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

        // Skip hidden directories and common non-feature directories
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
 * Find features in a workspace (by workspace path)
 */
export async function findFeaturesInDirectory(workspacePath: string): Promise<Feature[]> {
  const db = getDb();

  const workspace = await getWorkspaceByPath(workspacePath);
  if (!workspace) {
    return [];
  }

  return await db.select().from(features).where(eq(features.workspaceId, workspace.id));
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
 * Get all features in a workspace
 */
export async function getWorkspaceFeatures(workspaceId: string): Promise<Feature[]> {
  const db = getDb();
  return await db.select().from(features).where(eq(features.workspaceId, workspaceId));
}
