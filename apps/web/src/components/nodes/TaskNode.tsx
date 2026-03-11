import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import './TaskNode.css';

interface TaskNodeData {
  title: string;
  status: 'planned' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low' | null;
  isCritical: boolean;
}

export default function TaskNode({ data }: NodeProps<TaskNodeData>) {
  const statusColor = {
    planned: '#ff9800',
    review: '#2196f3',
    done: '#4caf50'
  }[data.status] || '#9e9e9e';

  return (
    <div
      className={`task-node ${data.isCritical ? 'critical' : ''}`}
      style={{
        backgroundColor: statusColor,
        borderWidth: data.isCritical ? '3px' : '1px',
        borderColor: data.isCritical ? '#ff5722' : statusColor
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="task-title">{data.title}</div>
      <div className="task-meta">
        <span>{data.status}</span>
        {data.priority && <span> • {data.priority}</span>}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
