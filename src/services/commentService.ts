import { db } from '../db/client.js';
import { taskComments } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export type TaskComment = {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
};

export type NewCommentInput = {
  taskId: string;
  content: string;
};

/**
 * Add a comment to a task
 */
export async function addComment(taskId: string, content: string): Promise<string> {
  const commentId = randomUUID();
  await db.insert(taskComments).values({
    id: commentId,
    taskId,
    content
  });
  return commentId;
}

/**
 * Get all comments for a specific task
 */
export async function getComments(taskId: string): Promise<TaskComment[]> {
  return await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(taskComments.createdAt);
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(commentId: string): Promise<TaskComment | null> {
  const result = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.id, commentId))
    .limit(1);
  return result[0] || null;
}

/**
 * Delete a comment by ID
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  const result = await db
    .delete(taskComments)
    .where(eq(taskComments.id, commentId));
  return true;
}
