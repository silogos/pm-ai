import * as fs from 'fs/promises';
import * as path from 'path';
import { getDb } from '../../db/client.js';
import { plans, type Plan } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export interface MarkdownPlan {
  title: string;
  content: string;
  filePath: string;
}

export interface SyncResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
}

/**
 * Parse a markdown file to extract title and content
 * Assumes the first heading (# Title) is the plan title
 */
export async function parseMarkdownPlan(filePath: string): Promise<MarkdownPlan | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find the first heading
    let title = path.basename(filePath, '.md');
    let titleIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ')) {
        title = line.substring(2).trim();
        titleIndex = i;
        break;
      }
    }

    // Remove the title line from the content for the plan body
    const contentLines = lines.slice(titleIndex + 1);
    const planContent = contentLines.join('\n').trim();

    return {
      title,
      content: planContent,
      filePath
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error);
    return null;
  }
}

/**
 * Sync a single plan file to the database
 */
export async function syncPlanFile(featureId: string, filePath: string): Promise<Plan | null> {
  const db = getDb();

  // Parse the markdown file
  const markdownPlan = await parseMarkdownPlan(filePath);
  if (!markdownPlan) {
    return null;
  }

  // Check if a plan with this title already exists for this project
  const existingPlans = await db
    .select()
    .from(plans)
    .where(and(eq(plans.featureId, featureId), eq(plans.title, markdownPlan.title)))
    .limit(1);

  if (existingPlans.length > 0) {
    // Update existing plan if content has changed
    const existingPlan = existingPlans[0];
    if (existingPlan.markdown !== markdownPlan.content) {
      await db
        .update(plans)
        .set({ markdown: markdownPlan.content })
        .where(eq(plans.id, existingPlan.id));

      return { ...existingPlan, markdown: markdownPlan.content };
    }
    return existingPlan;
  }

  // Create new plan
  const planId = randomUUID();
  await db.insert(plans).values({
    id: planId,
    featureId,
    title: markdownPlan.title,
    markdown: markdownPlan.content
  });

  return await db.select().from(plans).where(eq(plans.id, planId)).limit(1).then(r => r[0] || null);
}

/**
 * Import all .md files from a folder as plans
 */
export async function importPlansFromFolder(featureId: string, folderPath: string): Promise<SyncResult> {
  const result: SyncResult = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Recursively find all .md files
    const markdownFiles = await findMarkdownFiles(folderPath);

    for (const filePath of markdownFiles) {
      try {
        // Skip files that are in hidden directories or node_modules
        if (filePath.includes('/.') || filePath.includes('\\.') || filePath.includes('node_modules')) {
          continue;
        }

        const beforeSync = await dbSelectCountByProject(featureId);
        const plan = await syncPlanFile(featureId, filePath);
        const afterSync = await dbSelectCountByProject(featureId);

        if (plan) {
          if (afterSync > beforeSync) {
            result.imported++;
          } else {
            result.updated++;
          }
        } else {
          result.skipped++;
        }
      } catch (error) {
        result.errors.push({
          file: filePath,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  } catch (error) {
    result.errors.push({
      file: folderPath,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return result;
}

/**
 * Import plans from the current folder's project (detected via .pm-ai config)
 */
export async function importPlansFromCurrentFolder(): Promise<SyncResult | null> {
  // Try to find .pm-ai config in current directory
  const currentPath = process.cwd();
  const configPath = path.join(currentPath, '.pm-ai');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (!config.featureId) {
      throw new Error('Invalid .pm-ai config: missing featureId');
    }

    return await importPlansFromFolder(config.featureId, currentPath);
  } catch (error) {
    console.error('Error importing plans from current folder:', error);
    return null;
  }
}

/**
 * Recursively find all .md files in a directory
 */
async function findMarkdownFiles(dirPath: string, depth: number = 0, maxDepth: number = 5): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip hidden directories and common non-project directories
      if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory() && depth < maxDepth) {
        const subFiles = await findMarkdownFiles(fullPath, depth + 1, maxDepth);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Helper function to count plans by project (before/after sync)
 */
async function dbSelectCountByProject(featureId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select()
    .from(plans)
    .where(eq(plans.featureId, featureId));
  return result.length;
}
