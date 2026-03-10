import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

export default function ProjectList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load projects: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div className="project-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Projects</h2>
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <p>No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((project: Project) => (
            <Link key={project.id} to={`/project/${project.id}`} className="project-card">
              <h3>{project.name}</h3>
              <div className="project-date">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
              {project.progress && (
                <>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${project.progress.percentage}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    <span>{project.progress.total} tasks</span>
                    <span>{project.progress.percentage}% complete</span>
                  </div>
                  <div className="progress-stats" style={{ marginTop: '0.5rem' }}>
                    <span>Planned: {project.progress.planned}</span>
                    <span>In Review: {project.progress.inReview}</span>
                    <span>Done: {project.progress.completed}</span>
                  </div>
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
