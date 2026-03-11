import { getDb } from '../../db/client.js';
import { features, type Feature } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

/**
 * Create a new feature in a workspace
 */
export async function createFeature(name: string, workspaceId: string): Promise<string> {
  const db = getDb();
  const featureId = randomUUID();
  await db.insert(features).values({
    id: featureId,
    name,
    workspaceId
  });
  return featureId;
}

/**
 * Create a new feature in a workspace with description
 */
export async function createFeatureWithDescription(
  name: string,
  workspaceId: string,
  description?: string
): Promise<string> {
  const db = getDb();
  const featureId = randomUUID();
  await db.insert(features).values({
    id: featureId,
    name,
    workspaceId,
    description: description || null
  });
  return featureId;
}

export async function getFeatureById(featureId: string): Promise<Feature | null> {
  const db = getDb();
  const result = await db.select().from(features).where(eq(features.id, featureId)).limit(1);
  return result[0] || null;
}

/**
 * Get feature by workspace ID and name
 */
export async function getFeatureByWorkspaceAndName(workspaceId: string, name: string): Promise<Feature | null> {
  const db = getDb();
  const result = await db.select().from(features)
    .where(and(eq(features.workspaceId, workspaceId), eq(features.name, name)))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all features
 */
export async function getAllFeatures(): Promise<Feature[]> {
  const db = getDb();
  return await db.select().from(features);
}

/**
 * Update feature description
 */
export async function updateFeatureDescription(featureId: string, description: string): Promise<Feature | null> {
  const db = getDb();
  await db.update(features).set({ description, updatedAt: new Date().toISOString() }).where(eq(features.id, featureId));
  return await getFeatureById(featureId);
}

/**
 * Touch feature (update updated_at timestamp)
 */
export async function touchFeature(featureId: string): Promise<void> {
  const db = getDb();
  await db.update(features).set({ updatedAt: new Date().toISOString() }).where(eq(features.id, featureId));
}

/**
 * Get features by workspace ID
 */
export async function getFeaturesByWorkspace(workspaceId: string): Promise<Feature[]> {
  const db = getDb();
  return await db.select().from(features).where(eq(features.workspaceId, workspaceId));
}
