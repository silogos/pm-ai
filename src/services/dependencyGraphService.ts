import { db } from '../db/client.js';
import { tasks, plans } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  buildGraph,
  depthFirstSearch,
  topologicalSort,
  detectCycles,
  findLongestPath,
  findSourceNodes,
  findSinkNodes,
  type GraphNode
} from '../utils/graph.js';
import { parseDependencies } from './taskService.js';

export type TaskGraphNode = {
  id: string;
  title: string;
  status: 'planned' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low' | null;
  dependencies: string[];
};

export type DependencyTree = {
  taskId: string;
  title: string;
  status: string;
  priority: string | null;
  dependencies: DependencyTree[];
};

export type CriticalPathNode = {
  taskId: string;
  title: string;
  status: string;
  position: number;
};

export type CircularDependency = {
  cycle: string[];
  taskIds: string[];
};

/**
 * Build a dependency graph for all tasks in a project
 */
export async function buildDependencyGraph(projectId: string): Promise<{
  graph: Map<string, string[]>;
  nodes: TaskGraphNode[];
}> {
  // Get all tasks for the project
  const projectTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dependencies: tasks.dependencies
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .where(eq(plans.projectId, projectId));

  // Build graph nodes
  const nodes: TaskGraphNode[] = projectTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dependencies: parseDependencies(task.dependencies)
  }));

  // Build adjacency list
  const graphNodes: GraphNode<string>[] = nodes.map(node => ({
    id: node.id,
    dependencies: node.dependencies
  }));

  const graph = buildGraph(graphNodes);

  return { graph, nodes };
}

/**
 * Get upstream dependencies for a specific task (tasks this task depends on)
 */
export async function getTaskDependencies(taskId: string): Promise<{
  direct: string[];
  all: string[];
  tree: DependencyTree | null;
}> {
  // Get the task
  const task = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dependencies: tasks.dependencies
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (task.length === 0) {
    return { direct: [], all: [], tree: null };
  }

  const taskData = task[0];
  const directDependencies = parseDependencies(taskData.dependencies);

  // Get all dependency details
  const dependencyDetails = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dependencies: tasks.dependencies
    })
    .from(tasks)
    .where(eq(tasks.id, taskId)); // This is just a placeholder - we'd need to fetch actual dependencies

  return {
    direct: directDependencies,
    all: directDependencies, // In a full implementation, we'd traverse the entire tree
    tree: {
      taskId: taskData.id,
      title: taskData.title,
      status: taskData.status,
      priority: taskData.priority,
      dependencies: [] // Would need recursive implementation
    }
  };
}

/**
 * Get downstream dependents for a specific task (tasks that depend on this task)
 */
export async function getTaskDependents(taskId: string): Promise<{
  direct: string[];
  all: string[];
}> {
  // Get all tasks that have this task as a dependency
  const allTasks = await db.select().from(tasks);

  const direct: string[] = [];
  const all = new Set<string>();

  for (const task of allTasks) {
    const deps = parseDependencies(task.dependencies);
    if (deps.includes(taskId)) {
      direct.push(task.id);
      all.add(task.id);
    }
  }

  return { direct, all: Array.from(all) };
}

/**
 * Get the critical path for a project (longest chain of dependencies)
 */
export async function getCriticalPath(projectId: string): Promise<{
  path: CriticalPathNode[];
  length: number;
}> {
  const { graph, nodes } = await buildDependencyGraph(projectId);

  // Find longest path
  const { path: nodeIds, length } = findLongestPath(graph);

  // Build detailed path with task information
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const path: CriticalPathNode[] = nodeIds.map((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    return {
      taskId: nodeId,
      title: node?.title || 'Unknown',
      status: node?.status || 'planned',
      position: index
    };
  });

  return { path, length };
}

/**
 * Detect circular dependencies in a project
 */
export async function detectCircularDependencies(projectId: string): Promise<{
  hasCycles: boolean;
  cycles: CircularDependency[];
}> {
  const { graph, nodes } = await buildDependencyGraph(projectId);

  const cycles = detectCycles(graph);

  // Build detailed cycle information
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const detailedCycles: CircularDependency[] = cycles.map(cycle => ({
    cycle: cycle.map(nodeId => nodeMap.get(nodeId)?.title || nodeId),
    taskIds: cycle
  }));

  return {
    hasCycles: cycles.length > 0,
    cycles: detailedCycles
  };
}

/**
 * Get topological order of tasks for execution
 */
export async function getTaskExecutionOrder(projectId: string): Promise<{
  order: string[];
  error: string | null;
}> {
  try {
    const { graph } = await buildDependencyGraph(projectId);
    const order = topologicalSort(graph);

    return { order, error: null };
  } catch (error) {
    return {
      order: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get source tasks (tasks with no dependencies)
 */
export async function getSourceTasks(projectId: string): Promise<string[]> {
  const { graph } = await buildDependencyGraph(projectId);
  return findSourceNodes(graph);
}

/**
 * Get sink tasks (tasks that no other tasks depend on)
 */
export async function getSinkTasks(projectId: string): Promise<string[]> {
  const { graph } = await buildDependencyGraph(projectId);
  return findSinkNodes(graph);
}
