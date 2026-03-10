// API Response Types
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  progress?: ProgressStats;
}

export interface Plan {
  id: string;
  projectId: string;
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
  status?: 'planned' | 'review' | 'done';
  dependencies?: string[];
}

export interface AddCommentRequest {
  content: string;
}

// API Response Wrappers
export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectResponse {
  project: Project & {
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
