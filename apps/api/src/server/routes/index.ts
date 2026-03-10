import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getAllProjects,
  getProjectById,
  createProject
} from '@pm-ai/core';
import {
  getPlans,
  getPlanById,
  savePlan
} from '@pm-ai/core';
import {
  getTasks,
  getTaskById,
  getTasksByPlanId,
  getTasksByStatus,
  getTasksByPriority,
  parseDependencies,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskFlag,
  updateTaskDependencies,
  deleteTask
} from '@pm-ai/core';
import {
  getComments,
  addComment,
  deleteComment
} from '@pm-ai/core';
import {
  getProjectProgress,
  getPlanProgress
} from '@pm-ai/core';
import {
  getTaskDependencies,
  getTaskDependents,
  getCriticalPath
} from '@pm-ai/core';
import { asyncHandler, ApiError } from '../middleware/errors.js';

const router: Router = Router();

// Helper function to safely get string from req.params
function getParam(params: any, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255)
});

const createPlanSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  markdown: z.string()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  flag: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  status: z.enum(['planned', 'review', 'done']).optional(),
  dependencies: z.array(z.string().uuid()).optional()
});

const addCommentSchema = z.object({
  content: z.string().min(1).max(5000)
});

// ==================== Projects ====================

// GET /api/projects - List all projects
router.get('/projects', asyncHandler(async (req: Request, res: Response) => {
  const projects = await getAllProjects();

  // Get progress for each project
  const projectsWithProgress = await Promise.all(
    projects.map(async (project) => {
      const progress = await getProjectProgress(project.id);
      return {
        ...project,
        progress
      };
    })
  );

  res.json({ projects: projectsWithProgress });
}));

// POST /api/projects - Create a new project
router.post('/projects', asyncHandler(async (req: Request, res: Response) => {
  const { name } = createProjectSchema.parse(req.body);
  const projectId = await createProject(name);
  const project = await getProjectById(projectId);

  if (!project) {
    throw new ApiError('Failed to create project', 500);
  }

  res.status(201).json({ project });
}));

// GET /api/projects/:id - Get project details
router.get('/projects/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const project = await getProjectById(id);

  if (!project) {
    throw new ApiError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  const progress = await getProjectProgress(id);
  const plans = await getPlans(id);
  const tasks = await getTasks(id);

  res.json({
    project: {
      ...project,
      progress,
      plans,
      tasks
    }
  });
}));

// GET /api/projects/:id/plans - Get project plans
router.get('/projects/:id/plans', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const plans = await getPlans(id);

  // Get progress for each plan
  const plansWithProgress = await Promise.all(
    plans.map(async (plan) => {
      const progress = await getPlanProgress(plan.id);
      return {
        ...plan,
        progress
      };
    })
  );

  res.json({ plans: plansWithProgress });
}));

// GET /api/projects/:id/tasks - Get project tasks
router.get('/projects/:id/tasks', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const { status, priority } = req.query;

  let tasks;

  if (status && typeof status === 'string') {
    const statusEnum = status === 'review' ? 'review' : status === 'done' ? 'done' : 'planned';
    tasks = await getTasksByStatus(id, statusEnum);
  } else if (priority && typeof priority === 'string') {
    const priorityEnum = priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low';
    tasks = await getTasksByPriority(id, priorityEnum);
  } else {
    tasks = await getTasks(id);
  }

  res.json({ tasks });
}));

// GET /api/projects/:id/progress - Get project progress
router.get('/projects/:id/progress', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const progress = await getProjectProgress(id);
  res.json({ progress });
}));

// GET /api/projects/:id/critical-path - Get critical path
router.get('/projects/:id/critical-path', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const criticalPath = await getCriticalPath(id);
  res.json({ critical_path: criticalPath });
}));

// ==================== Plans ====================

// POST /api/plans - Create a new plan
router.post('/plans', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, title, markdown } = createPlanSchema.parse(req.body);
  const planId = await savePlan(projectId, title, markdown);
  const plan = await getPlanById(planId);

  if (!plan) {
    throw new ApiError('Failed to create plan', 500);
  }

  res.status(201).json({ plan });
}));

// GET /api/plans/:id - Get plan details
router.get('/plans/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const plan = await getPlanById(id);

  if (!plan) {
    throw new ApiError('Plan not found', 404, 'PLAN_NOT_FOUND');
  }

  const progress = await getPlanProgress(id);
  const tasks = await getTasksByPlanId(id);

  res.json({
    plan: {
      ...plan,
      progress,
      tasks: tasks.map(task => ({
        ...task,
        dependencies: parseDependencies(task.dependencies)
      }))
    }
  });
}));

// ==================== Tasks ====================

// PATCH /api/tasks/:id - Update a task
router.patch('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const updates = updateTaskSchema.parse(req.body);

  let task = await getTaskById(id);

  if (!task) {
    throw new ApiError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  // Apply updates
  if (updates.title !== undefined) {
    task = await updateTaskTitle(id, updates.title);
  }
  if (updates.description !== undefined) {
    task = await updateTaskDescription(id, updates.description);
  }
  if (updates.flag !== undefined) {
    task = await updateTaskFlag(id, updates.flag);
  }
  if (updates.priority !== undefined) {
    if (updates.priority === null) {
      task = await updateTaskFlag(id, null); // Clear priority by setting to null
    } else {
      task = await updateTaskPriority(id, updates.priority);
    }
  }
  if (updates.status !== undefined) {
    task = await updateTaskStatus(id, updates.status);
  }
  if (updates.dependencies !== undefined) {
    task = await updateTaskDependencies(id, updates.dependencies);
  }

  res.json({
    task: task ? {
      ...task,
      dependencies: parseDependencies(task.dependencies)
    } : null
  });
}));

// DELETE /api/tasks/:id - Delete a task
router.delete('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  await deleteTask(id);
  res.status(204).send();
}));

// GET /api/tasks/:id/dependencies - Get task dependencies
router.get('/tasks/:id/dependencies', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const { type } = req.query;

  const dependencyType = type === 'upstream' ? 'upstream' : type === 'downstream' ? 'downstream' : 'both';

  let dependencies: any = {};

  if (dependencyType === 'upstream' || dependencyType === 'both') {
    const upstreamDeps = await getTaskDependencies(id);
    dependencies.upstream = upstreamDeps;
  }

  if (dependencyType === 'downstream' || dependencyType === 'both') {
    const downstreamDeps = await getTaskDependents(id);
    dependencies.downstream = downstreamDeps;
  }

  // If only one type was requested, return just that
  if (dependencyType === 'upstream') {
    dependencies = dependencies.upstream;
  } else if (dependencyType === 'downstream') {
    dependencies = dependencies.downstream;
  }

  res.json({ dependencies });
}));

// POST /api/tasks/:id/comments - Add a comment to a task
router.post('/tasks/:id/comments', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const { content } = addCommentSchema.parse(req.body);

  const commentId = await addComment(id, content);
  const comments = await getComments(id);

  res.status(201).json({ comments });
}));

// GET /api/tasks/:id/comments - Get task comments
router.get('/tasks/:id/comments', asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, 'id');
  const comments = await getComments(id);
  res.json({ comments });
}));

// DELETE /api/tasks/:taskId/comments/:commentId - Delete a comment
router.delete('/tasks/:taskId/comments/:commentId', asyncHandler(async (req: Request, res: Response) => {
  const commentId = getParam(req.params, 'commentId');
  await deleteComment(commentId);
  res.status(204).send();
}));

export const apiRoutes = router;
