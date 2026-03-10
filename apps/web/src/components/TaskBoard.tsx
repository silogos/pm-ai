import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { projectsApi, tasksApi } from '../services/api';
import type { Task } from '../types';

interface TaskBoardProps {
  projectId: string;
}

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await projectsApi.getTasks(projectId);
      return response.data;
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: 'planned' | 'review' | 'done' }) => {
      return tasksApi.update(taskId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    }
  });

  if (isLoading) {
    return <div className="loading">Loading tasks...</div>;
  }

  const tasks = data?.tasks || [];

  const plannedTasks = tasks.filter((t: Task) => t.status === 'planned');
  const reviewTasks = tasks.filter((t: Task) => t.status === 'review');
  const doneTasks = tasks.filter((t: Task) => t.status === 'done');

  const handleStatusChange = (taskId: string, newStatus: 'planned' | 'review' | 'done') => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task.id}
      className="task-card"
      onClick={() => setSelectedTask(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('currentStatus', task.status);
      }}
    >
      <h4>{task.title}</h4>
      <div className="task-meta">
        {task.priority && <span className={`priority ${task.priority}`}>{task.priority}</span>}
        {task.flag && <span className="flag">{task.flag}</span>}
      </div>
      {task.description && (
        <div className="task-description" style={{ fontSize: '0.875rem', color: '#666' }}>
          {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
        </div>
      )}
    </div>
  );

  const renderColumn = (title: string, columnTasks: Task[], status: 'planned' | 'review' | 'done') => (
    <div
      className={`task-column ${status}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const currentStatus = e.dataTransfer.getData('currentStatus');
        if (currentStatus !== status) {
          handleStatusChange(taskId, status);
        }
      }}
    >
      <div className="task-column-header">
        {title} ({columnTasks.length})
      </div>
      {columnTasks.map(renderTaskCard)}
    </div>
  );

  return (
    <div className="task-board-container">
      <div className="task-board">
        {renderColumn('Planned', plannedTasks, 'planned')}
        {renderColumn('In Review', reviewTasks, 'review')}
        {renderColumn('Done', doneTasks, 'done')}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(newStatus) => {
            handleStatusChange(selectedTask.id, newStatus);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

function TaskDetailModal({
  task,
  onClose,
  onStatusChange
}: {
  task: Task;
  onClose: () => void;
  onStatusChange: (status: 'planned' | 'review' | 'done') => void;
}) {
  const [comments, setComments] = useState<{ comments: any[] } | null>(null);
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    const response = await tasksApi.getComments(task.id);
    setComments(response.data);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    await tasksApi.addComment(task.id, { content: newComment });
    setNewComment('');
    loadComments();
  };

  // Load comments when modal opens
  if (!comments) {
    loadComments();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Status:</label>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as 'planned' | 'review' | 'done')}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e0e0e0' }}
          >
            <option value="planned">Planned</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {task.description && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ lineHeight: '1.5' }}>{task.description}</p>
          </div>
        )}

        {task.dependencies && task.dependencies.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Dependencies</h3>
            <p style={{ color: '#666' }}>{task.dependencies.length} task(s)</p>
          </div>
        )}

        <div className="task-comments">
          <h3 style={{ marginBottom: '1rem' }}>Comments</h3>

          {comments && comments.comments.length > 0 ? (
            <div className="task-comments-list">
              {comments.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span>Comment</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginBottom: '1rem' }}>No comments yet</p>
          )}

          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button className="btn btn-primary" onClick={addComment}>
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
