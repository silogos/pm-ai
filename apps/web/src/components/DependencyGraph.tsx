import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, DataSet } from 'vis-network/standalone';
import { projectsApi } from '../services/api';
import type { Task } from '../types';

interface DependencyGraphProps {
  projectId: string;
}

export default function DependencyGraph({ projectId }: DependencyGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!networkRef.current || !tasksData?.tasks) return;

    const tasks = tasksData.tasks;
    const criticalPathIds = new Set(
      criticalPathData?.critical_path?.path?.map((node: any) => node.taskId) || []
    );

    // Create nodes
    const nodes = new DataSet(
      tasks.map((task: Task) => ({
        id: task.id,
        label: task.title,
        title: `${task.title}\nStatus: ${task.status}\nPriority: ${task.priority || 'None'}`,
        color: {
          background: getStatusColor(task.status),
          border: criticalPathIds.has(task.id) ? '#ff5722' : getStatusColor(task.status),
          highlight: {
            background: '#1976d2',
            border: '#1976d2'
          }
        },
        borderWidth: criticalPathIds.has(task.id) ? 3 : 1,
        font: {
          size: 14,
          color: '#333'
        }
      }))
    );

    // Create edges
    const edges = new DataSet<any>(
      tasks.flatMap((task: Task) =>
        (task.dependencies || []).map((depId) => ({
          from: depId,
          to: task.id,
          arrows: 'to',
          color: {
            color: '#999',
            highlight: '#1976d2'
          }
        }))
      )
    );

    const networkInstance = new Network(
      networkRef.current,
      { nodes, edges },
      {
        nodes: {
          shape: 'box',
          margin: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          },
          widthConstraint: {
            maximum: 200
          }
        },
        edges: {
          smooth: {
            enabled: true,
            type: 'cubicBezier',
            forceDirection: 'horizontal',
            roundness: 0.4
          }
        },
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'LR',
            sortMethod: 'directed',
            nodeSpacing: 150,
            levelSeparation: 200
          }
        },
        physics: {
          enabled: false
        },
        interaction: {
          hover: true,
          tooltipDelay: 200
        }
      }
    );

    return () => {
      networkInstance.destroy();
    };
  }, [tasksData, criticalPathData]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planned':
        return '#ff9800';
      case 'review':
        return '#2196f3';
      case 'done':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div className="dependency-graph-container">
      <div style={{ marginBottom: '1rem' }}>
        <h3>Task Dependency Graph</h3>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>
          Visual representation of task dependencies. Tasks on the critical path are highlighted with orange borders.
        </p>
      </div>

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

      <div ref={networkRef} className="dependency-graph" style={{ height: '500px' }} />
    </div>
  );
}
