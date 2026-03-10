import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  markdown: text('markdown').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  flag: text('flag'),
  priority: text('priority').$type<'high' | 'medium' | 'low'>(),
  dependencies: text('dependencies'), // JSON string
  status: text('status').$type<'planned' | 'review' | 'done'>().notNull()
});

export const taskComments = sqliteTable('task_comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Domain types inferred from schema
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskComment = typeof taskComments.$inferSelect;
export type NewTaskComment = typeof taskComments.$inferInsert;

// Convenience types extracted from Task
export type Priority = Task['priority'];  // 'high' | 'medium' | 'low' | null
export type TaskStatus = Task['status'];  // 'planned' | 'review' | 'done'
