// API Request/Response Types
import type { TaskStatus } from '../db/schema.js';

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
export interface CreateProjectRequest {
  name: string;
}

export interface CreatePlanRequest {
  projectId: string;
  title: string;
  markdown: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  flag?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
  status?: TaskStatus;
  dependencies?: string[];
}

export interface AddCommentRequest {
  content: string;
}

// API Response Wrappers
export interface ProjectsResponse {
  projects: import('../db/schema.js').Project[];
}

export interface ProjectResponse {
  project: import('../db/schema.js').Project & {
    plans?: import('../db/schema.js').Plan[];
    tasks?: import('../db/schema.js').Task[];
  };
}

export interface PlansResponse {
  plans: import('../db/schema.js').Plan[];
}

export interface PlanResponse {
  plan: import('../db/schema.js').Plan & {
    progress?: ProgressStats;
    tasks?: import('../db/schema.js').Task[];
  };
}

export interface TasksResponse {
  tasks: Array<import('../db/schema.js').Task & { planTitle?: string }>;
}

export interface TaskResponse {
  task: import('../db/schema.js').Task;
}

export interface CommentsResponse {
  comments: import('../db/schema.js').TaskComment[];
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
