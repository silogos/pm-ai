export type GraphNode<T = string> = {
  id: T;
  dependencies: T[];
};

export type Graph<T = string> = Map<T, T[]>;

/**
 * Build an adjacency list representation of a graph from nodes
 */
export function buildGraph<T = string>(nodes: GraphNode<T>[]): Graph<T> {
  const graph = new Map<T, T[]>();

  for (const node of nodes) {
    graph.set(node.id, node.dependencies);
  }

  return graph;
}

/**
 * Perform depth-first search to find all reachable nodes from a start node
 */
export function depthFirstSearch<T = string>(
  graph: Graph<T>,
  start: T,
  direction: 'upstream' | 'downstream' = 'upstream'
): T[] {
  const visited = new Set<T>();
  const result: T[] = [];

  function dfs(node: T): void {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);

    const neighbors = graph.get(node) || [];

    if (direction === 'upstream') {
      // Find nodes that depend on this node (reverse edges)
      for (const [key, deps] of graph.entries()) {
        if (deps.includes(node) && !visited.has(key)) {
          dfs(key);
        }
      }
    } else {
      // Follow dependencies (forward edges)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
    }
  }

  dfs(start);
  return result;
}

/**
 * Perform topological sort on a DAG using Kahn's algorithm
 * Returns nodes in order where dependencies come before dependents
 */
export function topologicalSort<T = string>(graph: Graph<T>): T[] {
  const inDegree = new Map<T, number>();
  const result: T[] = [];
  const queue: T[] = [];

  // Calculate in-degrees
  for (const [node, deps] of graph.entries()) {
    inDegree.set(node, 0);
  }

  for (const [node, deps] of graph.entries()) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  // Find nodes with no incoming edges
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  // Process nodes
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  if (result.length !== graph.size) {
    throw new Error('Graph contains a cycle');
  }

  return result;
}

/**
 * Detect cycles in a graph using DFS
 * Returns an array of cycles found
 */
export function detectCycles<T = string>(graph: Graph<T>): T[][] {
  const cycles: T[][] = [];
  const visited = new Set<T>();
  const recursionStack = new Set<T>();
  const path: T[] = [];

  function dfs(node: T): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart);
        cycle.push(neighbor);
        cycles.push([...cycle]);
      }
    }

    path.pop();
    recursionStack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

/**
 * Find the longest path (critical path) in a DAG
 */
export function findLongestPath<T = string>(
  graph: Graph<T>,
  weights?: Map<T, number>
): { path: T[]; length: number } {
  const topoOrder = topologicalSort(graph);
  const distance = new Map<T, number>();
  const predecessor = new Map<T, T | null>();

  // Initialize distances
  for (const node of topoOrder) {
    distance.set(node, weights?.get(node) || 1);
    predecessor.set(node, null);
  }

  // Process in topological order
  for (const node of topoOrder) {
    const neighbors = graph.get(node) || [];

    for (const neighbor of neighbors) {
      const edgeWeight = weights?.get(neighbor) || 1;
      const newDist = distance.get(node)! + edgeWeight;

      if (newDist > distance.get(neighbor)!) {
        distance.set(neighbor, newDist);
        predecessor.set(neighbor, node);
      }
    }
  }

  // Find the node with maximum distance
  let maxNode = topoOrder[0];
  let maxDist = distance.get(maxNode)!;

  for (const node of topoOrder) {
    if (distance.get(node)! > maxDist) {
      maxDist = distance.get(node)!;
      maxNode = node;
    }
  }

  // Reconstruct the path
  const path: T[] = [];
  let current: T | null = maxNode;

  while (current !== null) {
    path.unshift(current);
    current = predecessor.get(current)!;
  }

  return { path, length: maxDist };
}

/**
 * Find all nodes that are not reachable from any other node (sources)
 */
export function findSourceNodes<T = string>(graph: Graph<T>): T[] {
  const hasIncoming = new Set<T>();

  for (const [node, deps] of graph.entries()) {
    for (const dep of deps) {
      hasIncoming.add(dep);
    }
  }

  const sources: T[] = [];
  for (const node of graph.keys()) {
    if (!hasIncoming.has(node)) {
      sources.push(node);
    }
  }

  return sources;
}

/**
 * Find all nodes that have no outgoing edges (sinks)
 */
export function findSinkNodes<T = string>(graph: Graph<T>): T[] {
  const sinks: T[] = [];

  for (const [node, deps] of graph.entries()) {
    if (deps.length === 0) {
      sinks.push(node);
    }
  }

  return sinks;
}
