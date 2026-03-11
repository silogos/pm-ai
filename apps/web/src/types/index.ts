// API Response Types

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  path: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  progress?: ProgressStats;
}

export interface Plan {
  id: string;
  featureId: string;
  title: string;
  markdown: string;
  createdAt: string;
  progress?: ProgressStats;
}

export interface Task {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  flag: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  dependencies: string[];
  status: 'planned' | 'review' | 'done';
  planTitle?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
}

export interface ProgressStats {
  total: number;
  planned: number;
  inReview: number;
  completed: number;
  percentage: number;
  byPriority: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
}

export interface CriticalPathNode {
  taskId: string;
  title: string;
  status: string;
  position: number;
}

export interface DependencyGraph {
  nodes: Array<{
    id: string;
    label: string;
    title?: string;
    color?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    arrows?: string;
  }>;
}

// API Request Types
export interface CreateFeatureRequest {
  name: string;
  description?: string;
}

export interface CreatePlanRequest {
  featureId: string;
  title: string;
  markdown: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  flag?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
  status?: 'planned' | 'review' | 'done';
  dependencies?: string[];
}

export interface AddCommentRequest {
  content: string;
}

// API Response Wrappers
export interface WorkspacesResponse {
  workspaces: Workspace[];
}

export interface WorkspaceResponse {
  workspace: Workspace & {
    features?: Feature[];
  };
}

export interface FeaturesResponse {
  features: Feature[];
}

export interface FeatureResponse {
  feature: Feature & {
    plans?: Plan[];
    tasks?: Task[];
  };
}

export interface PlansResponse {
  plans: Plan[];
}

export interface PlanResponse {
  plan: Plan & {
    progress?: ProgressStats;
    tasks?: Task[];
  };
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}

export interface CommentsResponse {
  comments: TaskComment[];
}

export interface ProgressResponse {
  progress: ProgressStats;
}

export interface CriticalPathResponse {
  critical_path: {
    path: CriticalPathNode[];
    length: number;
  };
}

// Legacy types for backward compatibility (deprecated)
export interface Project {
  id: string;
  name: string;
  folderPath?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
  progress?: ProgressStats;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  folderPath: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: ProgressStats;
}
