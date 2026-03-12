// ============================================================================
// Database
// ============================================================================

// Database configuration (single source of truth)
export { DEFAULT_DB_PATH } from './config/database.js';

// Database client
export { init, getDb, closeDatabase } from './db/client.js';

// Migration runner
export { runMigrations } from './db/migrate.js';
export type { MigrationConfig } from './db/migrate.js';

// Schema tables
export { workspaces, features, plans, tasks, taskComments } from './db/schema.js';

// Domain types (inferred from Drizzle schema)
export type {
  Workspace,
  NewWorkspace,
  Feature,
  NewFeature,
  Plan,
  NewPlan,
  Task,
  NewTask,
  TaskComment,
  NewTaskComment,
  Priority,
  TaskStatus
} from './db/schema.js';

// ============================================================================
// Services
// ============================================================================

// Workspace services
export {
  scanWorkspace,
  scanCurrentWorkspace,
  getWorkspaceStatistics,
  findFeaturesInDirectory,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceByPath,
  getAllWorkspaces,
  updateWorkspaceDescription,
  touchWorkspace,
  getWorkspaceFeatures,
  detectWorkspace,
  detectWorkspaceFromPath,
  requireWorkspace,
  type WorkspaceFeature,
  type WorkspaceOverview,
  type PmAiConfig
} from './services/workspaces/index.js';

// Feature services
export {
  createFeature,
  createFeatureWithDescription,
  getFeatureById,
  getFeatureByWorkspaceAndName,
  getAllFeatures,
  updateFeatureDescription,
  touchFeature,
  getFeaturesByWorkspace
} from './services/features/index.js';

// Plan services
export {
  savePlan,
  getPlans,
  getPlanById
} from './services/plans/index.js';

// Task services
export {
  saveTasks,
  getTasks,
  getTasksByPlanId,
  getTaskById,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskFlag,
  updateTaskDependencies,
  deleteTask,
  getTasksByStatus,
  getTasksByPriority,
  parseDependencies,
  type TaskInput,
  type TaskWithPlan
} from './services/tasks/taskService.js';

export {
  searchTasks,
  filterTasks,
  searchAndFilterTasks,
  getTasksByFlag,
  type TaskFilters
} from './services/tasks/taskQueryService.js';

// Comment services
export {
  addComment,
  getComments,
  getCommentById,
  deleteComment,
  type NewCommentInput
} from './services/comments/index.js';

// Shared services (used across multiple domains)
export {
  getFeatureProgress,
  getPlanProgress,
  type ProgressStats
} from './services/shared/progressService.js';

export {
  buildDependencyGraph,
  getTaskDependencies,
  getTaskDependents,
  getCriticalPath,
  detectCircularDependencies,
  getTaskExecutionOrder,
  getSourceTasks,
  getSinkTasks,
  type TaskGraphNode,
  type DependencyTree,
  type CriticalPathNode,
  type CircularDependency
} from './services/shared/dependencyGraphService.js';

// ============================================================================
// Types
// ============================================================================

// API types
export type {
  ProgressStats as ApiProgressStats,
  CriticalPathNode as ApiCriticalPathNode,
  DependencyGraph,
  CreateFeatureRequest,
  CreatePlanRequest,
  UpdateTaskRequest,
  AddCommentRequest,
  FeaturesResponse,
  FeatureResponse,
  PlansResponse,
  PlanResponse,
  TasksResponse,
  TaskResponse,
  CommentsResponse,
  ProgressResponse,
  CriticalPathResponse
} from './types/api.js';

// MCP types
export type {
  McpToolContext,
  McpToolResponse,
  McpResourceResponse,
  ToolDependencyInfo
} from './types/mcp.js';
