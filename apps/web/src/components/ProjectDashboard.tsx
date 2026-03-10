import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import TaskBoard from './TaskBoard';
import PlanEditor from './PlanEditor';
import DependencyGraph from './DependencyGraph';

type Tab = 'tasks' | 'plans' | 'dependencies';

export default function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await projectsApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="loading">Loading project...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load project: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const project = data?.project;

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  return (
    <div className="project-dashboard">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          &larr; Back to Projects
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
        <p style={{ color: '#666' }}>
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </p>
        {project.progress && (
          <div style={{ marginTop: '1rem' }}>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${project.progress.percentage}%` }}
              />
            </div>
            <div className="progress-stats">
              <span>Total: {project.progress.total}</span>
              <span>Planned: {project.progress.planned}</span>
              <span>In Review: {project.progress.inReview}</span>
              <span>Done: {project.progress.completed}</span>
              <span>{project.progress.percentage}% Complete</span>
            </div>
          </div>
        )}
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Task Board
        </div>
        <div
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Plans
        </div>
        <div
          className={`tab ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </div>
      </div>

      {activeTab === 'tasks' && <TaskBoard projectId={project.id} />}
      {activeTab === 'plans' && <PlanEditor plans={project.plans || []} />}
      {activeTab === 'dependencies' && <DependencyGraph projectId={project.id} />}
    </div>
  );
}
