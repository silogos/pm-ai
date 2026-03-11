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
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; updated: number } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await projectsApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  const handleSyncPlans = async () => {
    if (!id) return;
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/projects/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      });

      if (!response.ok) throw new Error('Sync failed');

      const data = await response.json();
      setSyncResult({
        imported: data.result.imported,
        updated: data.result.updated
      });

      // Refresh project data
      window.location.reload();
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to sync plans: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
            <p style={{ color: '#666', margin: 0 }}>
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
            {(project as any).folderPath && (
              <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                📁 {(project as any).folderPath}
              </p>
            )}
          </div>
          {(project as any).folderPath && (
            <button
              onClick={handleSyncPlans}
              disabled={syncing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: syncing ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {syncing ? 'Syncing...' : 'Sync Plans'}
            </button>
          )}
        </div>
        {syncResult && (
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            ✅ Synced {syncResult.imported} new plan(s), updated {syncResult.updated} plan(s)
          </div>
        )}
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
