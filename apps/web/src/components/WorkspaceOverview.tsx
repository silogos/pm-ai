import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WorkspaceResponse, WorkspaceProject } from '../types';

export function WorkspaceOverview() {
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspace();
  }, []);

  async function fetchWorkspace() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/workspace/current');
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      const data = await response.json();
      setWorkspace(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">No workspace data available</div>
      </div>
    );
  }

  const stats = workspace.workspace.statistics;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workspace Overview</h1>
        <p className="text-gray-600 mt-2">
          {workspace.workspace.path}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Projects</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Overall Progress</div>
          <div className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Projects ({workspace.projects.length})
        </h2>
      </div>

      {workspace.projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No PM-AI projects found in this workspace.
          <br />
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspace.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: WorkspaceProject }) {
  const progress = project.progress;
  const percentage = progress?.percentage || 0;
  const completed = progress?.completed || 0;
  const total = progress?.total || 0;

  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 h-full">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {project.folderPath && (
          <div className="text-xs text-gray-500 mb-3 truncate">
            {project.folderPath}
          </div>
        )}

        {total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900">
                {completed}/{total} ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}
