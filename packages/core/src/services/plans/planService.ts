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
