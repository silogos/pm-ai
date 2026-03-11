import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant
} from 'reactflow';
import type { Node, Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import { projectsApi } from '../services/api';
import type { Task } from '../types';
import TaskNode from './nodes/TaskNode';

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
};

interface DependencyGraphProps {
  projectId: string;
}

export default function DependencyGraph({ projectId }: DependencyGraphProps) {
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await projectsApi.getTasks(projectId);
      return response.data;
    }
  });

  const { data: criticalPathData } = useQuery({
    queryKey: ['critical-path', projectId],
    queryFn: async () => {
      const response = await projectsApi.getCriticalPath(projectId);
      return response.data;
    }
  });

  // Build nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!tasksData?.tasks) return { nodes: [], edges: [] };

    const criticalPathIds = new Set(
      criticalPathData?.critical_path?.path?.map((node: any) => node.taskId) || []
    );

    const nodes: Node[] = tasksData.tasks.map((task: Task) => ({
      id: task.id,
      type: 'taskNode',
      position: { x: 0, y: 0 }, // Will be calculated by Dagre
      data: {
        title: task.title,
        status: task.status,
        priority: task.priority,
        isCritical: criticalPathIds.has(task.id)
      }
    }));

    const edges: Edge[] = tasksData.tasks.flatMap((task: Task) =>
      (task.dependencies || []).map((depId) => ({
        id: `${depId}-${task.id}`,
        source: depId,
        target: task.id,
        animated: criticalPathIds.has(task.id),
        style: { stroke: criticalPathIds.has(task.id) ? '#ff5722' : '#999' }
      }))
    );

    return { nodes: getLayoutedNodes(nodes, edges), edges };
  }, [tasksData, criticalPathData]);

  return (
    <div className="dependency-graph-container">
      <div style={{ marginBottom: '1rem' }}>
        <h3>Task Dependency Graph</h3>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>
          Visual representation of task dependencies. Tasks on the critical path are highlighted with orange borders.
        </p>
      </div>

      {/* Critical Path Info */}
      {criticalPathData?.critical_path && criticalPathData.critical_path.path.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Critical Path ({criticalPathData.critical_path.path.length} tasks)</h4>
          <ol style={{ marginLeft: '1.5rem' }}>
            {criticalPathData.critical_path.path.map((node: any) => (
              <li key={node.taskId} style={{ marginBottom: '0.25rem' }}>
                {node.title} <span style={{ color: '#666' }}>({node.status})</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* React Flow Graph */}
      <div style={{ height: '500px', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

// Dagre layout algorithm
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getLayoutedNodes(nodes: Node[], edges: Edge[]) {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 150, ranksep: 200 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100, // Center the node
        y: nodeWithPosition.y - 40
      }
    };
  });
}
