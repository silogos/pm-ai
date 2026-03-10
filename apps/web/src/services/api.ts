import axios from 'axios';
import type {
  ProjectsResponse,
  ProjectResponse,
  PlansResponse,
  PlanResponse,
  TasksResponse,
  TaskResponse,
  CommentsResponse,
  ProgressResponse,
  CriticalPathResponse,
  CreateProjectRequest,
  CreatePlanRequest,
  UpdateTaskRequest,
  AddCommentRequest
} from '../types';

// In development, use relative path to go through Vite proxy
// In production, use the full API URL
const isDev = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? '' : 'http://localhost:3000');

const api = axios.create({
  baseURL: isDev ? '/api' : `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Projects API
export const projectsApi = {
  getAll: () => api.get<ProjectsResponse>('/projects'),
  getById: (id: string) => api.get<ProjectResponse>(`/projects/${id}`),
  create: (data: CreateProjectRequest) => api.post<ProjectResponse>('/projects', data),
  getPlans: (id: string) => api.get<PlansResponse>(`/projects/${id}/plans`),
  getTasks: (id: string, status?: string, priority?: string) =>
    api.get<TasksResponse>(`/projects/${id}/tasks`, {
      params: { status, priority }
    }),
  getProgress: (id: string) => api.get<ProgressResponse>(`/projects/${id}/progress`),
  getCriticalPath: (id: string) => api.get<CriticalPathResponse>(`/projects/${id}/critical-path`)
};

// Plans API
export const plansApi = {
  create: (data: CreatePlanRequest) => api.post<PlanResponse>('/plans', data),
  getById: (id: string) => api.get<PlanResponse>(`/plans/${id}`)
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

export default api;
