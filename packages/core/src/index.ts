// ============================================================================
// Database
// ============================================================================

// Database client
export { init, getDb, closeDatabase } from './db/client.js';

// Migration runner
export { runMigrations } from './db/migrate.js';
export type { MigrationConfig } from './db/migrate.js';

// Schema tables
export { workspaces, projects, plans, tasks, taskComments } from './db/schema.js';

// Domain types (inferred from Drizzle schema)
export type {
  Workspace,
  NewWorkspace,
  Project,
  NewProject,
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
  findProjectsInDirectory,
  createWorkspace,
  getWorkspaceById,
  getWorkspaceByPath,
  getAllWorkspaces,
  updateWorkspaceDescription,
  touchWorkspace,
  getWorkspaceProjects,
  type WorkspaceProject,
  type WorkspaceOverview,
  type PmAiConfig
} from './services/workspaces/index.js';

// Project services
export {
  createProject,
  createProjectWithDescription,
  getProjectById,
  getAllProjects,
  updateProjectDescription,
  touchProject,
  getProjectsByWorkspace
} from './services/projects/index.js';

// Plan services
export {
  savePlan,
  getPlans,
  getPlanById
} from './services/plans/index.js';

export {
  parseMarkdownPlan,
  syncPlanFile,
  importPlansFromFolder,
  importPlansFromCurrentFolder,
  type MarkdownPlan,
  type SyncResult
} from './services/plans/planSyncService.js';

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
  getProjectProgress,
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
  CreateProjectRequest,
  CreatePlanRequest,
  UpdateTaskRequest,
  AddCommentRequest,
  ProjectsResponse,
  ProjectResponse,
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
