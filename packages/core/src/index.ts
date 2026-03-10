// ============================================================================
// Database
// ============================================================================

// Database client
export { init, getDb } from './db/client.js';

// Schema tables
export { projects, plans, tasks, taskComments } from './db/schema.js';

// Domain types (inferred from Drizzle schema)
export type {
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
// Domain Services
// ============================================================================

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
} from './domain/taskService.js';

export {
  searchTasks,
  filterTasks,
  searchAndFilterTasks,
  getTasksByFlag,
  type TaskFilters
} from './domain/taskQueryService.js';

// Project services
export {
  createProject,
  getProjectById,
  getAllProjects
} from './domain/projectService.js';

// Plan services
export {
  savePlan,
  getPlans,
  getPlanById
} from './domain/planService.js';

// Progress services
export {
  getProjectProgress,
  getPlanProgress,
  type ProgressStats
} from './domain/progressService.js';

// Comment services
export {
  addComment,
  getComments,
  getCommentById,
  deleteComment,
  type NewCommentInput
} from './domain/commentService.js';

// Dependency graph services
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
} from './domain/dependencyGraphService.js';

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
