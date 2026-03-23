import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  getAllWorkspaces,
  getWorkspaceById,
  getFeaturesByWorkspace,
  getFeatureById,
  createFeature,
  createFeatureWithDescription,
  getWorkspaceByPath,
  deleteFeature,
  type Feature
} from '@pm-ai/core';
import {
  getPlans,
  getPlanById,
  savePlan,
  deletePlan,
  type Plan
} from '@pm-ai/core';
import {
  scanWorkspace,
  scanCurrentWorkspace,
  getWorkspaceStatistics
} from '@pm-ai/core';
import {
  getTasks,
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
  deleteTask,
  getTaskById,
  type Task
} from '@pm-ai/core';
import {
  getComments,
  addComment,
  deleteComment
} from '@pm-ai/core';
import {
  getFeatureProgress,
  getPlanProgress
} from '@pm-ai/core';
import {
  getTaskDependencies,
  getTaskDependents,
  getCriticalPath
} from '@pm-ai/core';

const app = new Hono();

// Validation schemas
const createFeatureSchema = z.object({
  name: z.string().min(1).max(255),
  workspaceId: z.string().uuid().optional(),
  description: z.string().optional()
});

const createPlanSchema = z.object({
  featureId: z.string().uuid(),
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

// Error handler helper
function handleError(err: Error, c: any) {
  console.error('[API Error]', err);
  return c.json({
    error: {
      message: err.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    }
  }, 500);
}

// ==================== Workspaces ====================

// GET /api/workspaces - List all workspaces
app.get('/workspaces', async (c) => {
  try {
    const workspaces = await getAllWorkspaces();
    return c.json({ workspaces });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/workspaces/:id - Get workspace details
app.get('/workspaces/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const workspace = await getWorkspaceById(id);

    if (!workspace) {
      return c.json({
        error: {
          message: 'Workspace not found',
          code: 'WORKSPACE_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
    }

    // Get features for this workspace
    const features = await getFeaturesByWorkspace(id);

    return c.json({
      workspace: {
        ...workspace,
        features
      }
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// ==================== Features ====================

// GET /api/features - List all features (or by workspace)
app.get('/features', async (c) => {
  try {
    const workspaceId = c.req.query('workspaceId');
    if (!workspaceId) {
      return c.json({
        error: {
          message: 'workspaceId query parameter is required',
          code: 'MISSING_WORKSPACE_ID',
          statusCode: 400
        }
      }, 400);
    }

    const features = await getFeaturesByWorkspace(workspaceId);

    // Get progress for each feature
    const featuresWithProgress = await Promise.all(
      features.map(async (feature: Feature) => {
        const progress = await getFeatureProgress(feature.id);
        return {
          ...feature,
          progress
        };
      })
    );

    return c.json({ features: featuresWithProgress });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/workspaces/:id/features - Get features in a workspace
app.get('/workspaces/:id/features', async (c) => {
  try {
    const id = c.req.param('id');
    const features = await getFeaturesByWorkspace(id);

    // Get progress for each feature
    const featuresWithProgress = await Promise.all(
      features.map(async (feature: Feature) => {
        const progress = await getFeatureProgress(feature.id);
        return {
          ...feature,
          progress
        };
      })
    );

    return c.json({ features: featuresWithProgress });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// POST /api/features - Create a new feature
app.post('/features', zValidator('json', createFeatureSchema), async (c) => {
  try {
    const { name, workspaceId, description } = c.req.valid('json');
    let featureId: string;

    // If no workspaceId provided, try to find workspace by current directory
    let finalWorkspaceId = workspaceId;
    if (!finalWorkspaceId) {
      const currentPath = process.cwd();
      const existingWorkspace = await getWorkspaceByPath(currentPath);
      if (existingWorkspace) {
        finalWorkspaceId = existingWorkspace.id;
      } else {
        return c.json({
          error: {
            message: 'No workspace found. Please provide workspaceId or run init pm-ai first.',
            code: 'NO_WORKSPACE',
            statusCode: 400
          }
        }, 400);
      }
    }

    if (description) {
      featureId = await createFeatureWithDescription(name, finalWorkspaceId, description);
    } else {
      featureId = await createFeature(name, finalWorkspaceId);
    }

    const feature = await getFeatureById(featureId);

    if (!feature) {
      return c.json({
        error: {
          message: 'Failed to create feature',
          code: 'CREATE_FAILED',
          statusCode: 500
        }
      }, 500);
    }

    return c.json({ feature }, 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/features/:id - Get feature details
app.get('/features/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const feature = await getFeatureById(id);

    if (!feature) {
      return c.json({
        error: {
          message: 'Feature not found',
          code: 'FEATURE_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
    }

    const progress = await getFeatureProgress(id);
    const plans = await getPlans(id);
    const tasks = await getTasks(id);

    return c.json({
      feature: {
        ...feature,
        progress,
        plans,
        tasks: tasks.map((task: Task) => ({
          ...task,
          dependencies: parseDependencies(task.dependencies)
        }))
      }
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/features/:id/plans - Get feature plans
app.get('/features/:id/plans', async (c) => {
  try {
    const id = c.req.param('id');
    const plans = await getPlans(id);

    // Get progress for each plan
    const plansWithProgress = await Promise.all(
      plans.map(async (plan: Plan) => {
        const progress = await getPlanProgress(plan.id);
        return {
          ...plan,
          progress
        };
      })
    );

    return c.json({ plans: plansWithProgress });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/features/:id/tasks - Get feature tasks
app.get('/features/:id/tasks', async (c) => {
  try {
    const id = c.req.param('id');
    const status = c.req.query('status');
    const priority = c.req.query('priority');

    let tasks;

    if (status) {
      const statusEnum = status === 'review' ? 'review' : status === 'done' ? 'done' : 'planned';
      tasks = await getTasksByStatus(id, statusEnum);
    } else if (priority) {
      const priorityEnum = priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low';
      tasks = await getTasksByPriority(id, priorityEnum);
    } else {
      tasks = await getTasks(id);
    }

    return c.json({
      tasks: tasks.map((task: Task) => ({
        ...task,
        dependencies: parseDependencies(task.dependencies)
      }))
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/features/:id/progress - Get feature progress
app.get('/features/:id/progress', async (c) => {
  try {
    const id = c.req.param('id');
    const progress = await getFeatureProgress(id);
    return c.json({ progress });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/features/:id/critical-path - Get critical path
app.get('/features/:id/critical-path', async (c) => {
  try {
    const id = c.req.param('id');
    const criticalPath = await getCriticalPath(id);
    return c.json({ critical_path: criticalPath });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// DELETE /api/features/:id - Delete a feature
app.delete('/features/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Verify feature exists before deleting
    const feature = await getFeatureById(id);
    if (!feature) {
      return c.json({
        error: {
          message: 'Feature not found',
          code: 'FEATURE_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
    }

    await deleteFeature(id);
    return c.body(null, 204);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// ==================== Plans ====================

// POST /api/plans - Create a new plan
app.post('/plans', zValidator('json', createPlanSchema), async (c) => {
  try {
    const { featureId, title, markdown } = c.req.valid('json');
    const planId = await savePlan(featureId, title, markdown);
    const plan = await getPlanById(planId);

    if (!plan) {
      return c.json({
        error: {
          message: 'Failed to create plan',
          code: 'CREATE_FAILED',
          statusCode: 500
        }
      }, 500);
    }

    return c.json({ plan }, 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/plans/:id - Get plan details
app.get('/plans/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const plan = await getPlanById(id);

    if (!plan) {
      return c.json({
        error: {
          message: 'Plan not found',
          code: 'PLAN_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
    }

    const progress = await getPlanProgress(id);
    const tasks = await getTasksByPlanId(id);

    return c.json({
      plan: {
        ...plan,
        progress,
        tasks: tasks.map((task: Task) => ({
          ...task,
          dependencies: parseDependencies(task.dependencies)
        }))
      }
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/plans/:id/tasks - Get plan tasks
app.get('/plans/:id/tasks', async (c) => {
  try {
    const id = c.req.param('id');
    const tasks = await getTasksByPlanId(id);

    return c.json({
      tasks: tasks.map((task: Task) => ({
        ...task,
        dependencies: parseDependencies(task.dependencies)
      }))
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/plans/:id/critical-path - Get critical path
app.get('/plans/:id/critical-path', async (c) => {
  try {
    const id = c.req.param('id');
    const criticalPath = await getCriticalPath(id);
    return c.json({ critical_path: criticalPath });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// DELETE /api/plans/:id - Delete a plan
app.delete('/plans/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Verify plan exists before deleting
    const plan = await getPlanById(id);
    if (!plan) {
      return c.json({
        error: {
          message: 'Plan not found',
          code: 'PLAN_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
    }

    await deletePlan(id);
    return c.body(null, 204);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// ==================== Tasks ====================

// PATCH /api/tasks/:id - Update a task
app.patch('/tasks/:id', zValidator('json', updateTaskSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const updates = c.req.valid('json');

    let task = await getTaskById(id);

    if (!task) {
      return c.json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND',
          statusCode: 404
        }
      }, 404);
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
        task = await updateTaskFlag(id, null);
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

    return c.json({
      task: task ? {
        ...task,
        dependencies: parseDependencies(task.dependencies)
      } : null
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteTask(id);
    return c.body(null, 204);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/tasks/:id/dependencies - Get task dependencies
app.get('/tasks/:id/dependencies', async (c) => {
  try {
    const id = c.req.param('id');
    const type = c.req.query('type');

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

    return c.json({ dependencies });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// POST /api/tasks/:id/comments - Add a comment to a task
app.post('/tasks/:id/comments', zValidator('json', addCommentSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const { content } = c.req.valid('json');

    const commentId = await addComment(id, content);
    const comments = await getComments(id);

    return c.json({ comments }, 201);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/tasks/:id/comments - Get task comments
app.get('/tasks/:id/comments', async (c) => {
  try {
    const id = c.req.param('id');
    const comments = await getComments(id);
    return c.json({ comments });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// DELETE /api/tasks/:taskId/comments/:commentId - Delete a comment
app.delete('/tasks/:taskId/comments/:commentId', async (c) => {
  try {
    const commentId = c.req.param('commentId');
    await deleteComment(commentId);
    return c.body(null, 204);
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// ==================== Workspace ====================

// GET /api/workspace - Get workspace overview
app.get('/workspace', async (c) => {
  try {
    const workspacePath = c.req.query('path') || process.cwd();
    const maxDepth = c.req.query('maxDepth') ? parseInt(c.req.query('maxDepth') as string) : 3;

    const overview = await scanWorkspace(workspacePath, maxDepth);
    const stats = await getWorkspaceStatistics(workspacePath);

    return c.json({
      workspace: {
        path: overview.rootPath,
        total_features: overview.totalFeatures,
        statistics: stats
      },
      features: overview.features
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

// GET /api/workspace/current - Get current workspace overview
app.get('/workspace/current', async (c) => {
  try {
    const overview = await scanCurrentWorkspace();
    const stats = await getWorkspaceStatistics(process.cwd());

    return c.json({
      workspace: {
        path: overview.rootPath,
        total_features: overview.totalFeatures,
        statistics: stats
      },
      features: overview.features
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

export const apiRoutes = app;
