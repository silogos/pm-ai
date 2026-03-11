import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workspacesApi } from '../services/api';
import type { Workspace } from '../types';

export default function WorkspaceList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspacesApi.getAll();
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Loading workspaces...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load workspaces: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const workspaces = data?.workspaces || [];

  return (
    <div className="workspace-list-container">
      <div className="list-header">
        <h2>Workspaces</h2>
        <span className="workspace-count">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</span>
      </div>

      {workspaces.length === 0 ? (
        <div className="empty-card">
          <p>No workspaces found. Initialize a workspace with "init pm-ai" to get started.</p>
        </div>
      ) : (
        <div className="workspace-list">
          {workspaces.map((workspace: Workspace) => (
            <Link key={workspace.id} to={`/workspace/${workspace.id}`} className="workspace-card">
              <h3 className="workspace-card-title">{workspace.name}</h3>
              {workspace.description && (
                <p className="workspace-description">{workspace.description}</p>
              )}
              <div className="workspace-path">
                {workspace.path}
              </div>
              <div className="workspace-date">
                Created: {new Date(workspace.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
