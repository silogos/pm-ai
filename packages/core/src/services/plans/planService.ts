import { getDb } from '../../db/client.js';
import { plans, type Plan } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function savePlan(featureId: string, title: string, markdown: string): Promise<string> {
  const db = getDb();
  const planId = randomUUID();
  await db.insert(plans).values({
    id: planId,
    featureId,
    title,
    markdown
  });
  return planId;
}

export async function getPlans(featureId: string): Promise<Plan[]> {
  const db = getDb();
  return await db.select().from(plans).where(eq(plans.featureId, featureId));
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  const db = getDb();
  const result = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  return result[0] || null;
}

/**
 * Update plan title and/or markdown
 */
export async function updatePlan(planId: string, title?: string, markdown?: string): Promise<Plan | null> {
  const db = getDb();
  const updateData: Partial<{ title: string; markdown: string }> = {};

  if (title !== undefined) {
    updateData.title = title;
  }
  if (markdown !== undefined) {
    updateData.markdown = markdown;
  }

  if (Object.keys(updateData).length === 0) {
    return await getPlanById(planId);
  }

  const result = await db
    .update(plans)
    .set(updateData)
    .where(eq(plans.id, planId))
    .returning();
  return result[0] || null;
}

/**
 * Delete a plan by ID
 * Note: Database CASCADE DELETE will automatically remove all associated tasks
 */
export async function deletePlan(planId: string): Promise<boolean> {
  const db = getDb();
  await db.delete(plans).where(eq(plans.id, planId));
  return true;
}
