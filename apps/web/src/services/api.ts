import axios from 'axios';
import type {
  WorkspacesResponse,
  WorkspaceResponse,
  FeaturesResponse,
  FeatureResponse,
  PlansResponse,
  PlanResponse,
  TasksResponse,
  TaskResponse,
  CommentsResponse,
  ProgressResponse,
  CriticalPathResponse,
  CreateFeatureRequest,
  CreatePlanRequest,
  UpdateTaskRequest,
  AddCommentRequest
} from '../types';

// Use relative path for both dev and production
// API is served from the same server as the web app
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Workspaces API
export const workspacesApi = {
  getAll: () => api.get<WorkspacesResponse>('/workspaces'),
  getById: (id: string) => api.get<WorkspaceResponse>(`/workspaces/${id}`)
};

// Features API
export const featuresApi = {
  getAll: (workspaceId?: string) =>
    api.get<FeaturesResponse>(workspaceId ? `/workspaces/${workspaceId}/features` : '/features'),
  getById: (id: string) => api.get<FeatureResponse>(`/features/${id}`),
  create: (data: CreateFeatureRequest) => api.post<FeatureResponse>('/features', data),
  getPlans: (id: string) => api.get<PlansResponse>(`/features/${id}/plans`),
  getTasks: (id: string, status?: string, priority?: string) =>
    api.get<TasksResponse>(`/features/${id}/tasks`, {
      params: { status, priority }
    }),
  getProgress: (id: string) => api.get<ProgressResponse>(`/features/${id}/progress`),
  getCriticalPath: (id: string) => api.get<CriticalPathResponse>(`/features/${id}/critical-path`)
};

// Plans API
export const plansApi = {
  getById: (id: string) => api.get<PlanResponse>(`/plans/${id}`),
  create: (data: CreatePlanRequest) => api.post<PlanResponse>('/plans', data),
  getTasks: (id: string) => api.get<TasksResponse>(`/plans/${id}/tasks`),
  getCriticalPath: (id: string) => api.get<CriticalPathResponse>(`/plans/${id}/critical-path`)
};

// Tasks API
export const tasksApi = {
  update: (id: string, data: UpdateTaskRequest) => api.patch<TaskResponse>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getDependencies: (id: string, type?: 'upstream' | 'downstream' | 'both') =>
    api.get(`/tasks/${id}/dependencies`, { params: { type } }),
  getComments: (id: string) => api.get<CommentsResponse>(`/tasks/${id}/comments`),
  addComment: (id: string, data: AddCommentRequest) =>
    api.post<CommentsResponse>(`/tasks/${id}/comments`, data),
  deleteComment: (taskId: string, commentId: string) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`)
};

// Health check
export const healthApi = {
  check: () => api.get('/health')
};

// Legacy projects API (deprecated - for backward compatibility)
export const projectsApi = {
  getAll: () => api.get<WorkspacesResponse>('/workspaces'),
  getById: (id: string) => api.get<WorkspaceResponse>(`/workspaces/${id}`),
  create: (data: CreateFeatureRequest) => api.post<FeatureResponse>('/features', data),
  getPlans: (id: string) => api.get<PlansResponse>(`/features/${id}/plans`),
  getTasks: (id: string, status?: string, priority?: string) =>
    api.get<TasksResponse>(`/features/${id}/tasks`, {
      params: { status, priority }
    }),
  getProgress: (id: string) => api.get<ProgressResponse>(`/features/${id}/progress`),
  getCriticalPath: (id: string) => api.get<CriticalPathResponse>(`/features/${id}/critical-path`)
};

export default api;
