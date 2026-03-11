import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { featuresApi, workspacesApi } from '../services/api';
import type { Feature } from '../types';

interface FeatureListProps {
  workspaceId?: string;
}

export default function FeatureList({ workspaceId: propWorkspaceId }: FeatureListProps) {
  const { workspaceId: paramWorkspaceId } = useParams<{ workspaceId: string }>();
  const workspaceId = propWorkspaceId || paramWorkspaceId;

  // Fetch workspace details
  const { data: workspaceData, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const response = await workspacesApi.getById(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId
  });

  // Fetch features for this workspace
  const { data: featuresData, isLoading: featuresLoading, error: featuresError } = useQuery({
    queryKey: ['features', workspaceId],
    queryFn: async () => {
      const response = await featuresApi.getAll(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId
  });

  const isLoading = workspaceLoading || featuresLoading;
  const workspace = workspaceData?.workspace;
  const features = featuresData?.features || [];

  if (isLoading) {
    return <div className="loading">Loading features...</div>;
  }

  if (featuresError) {
    return (
      <div className="error">
        Failed to load features: {featuresError instanceof Error ? featuresError.message : 'Unknown error'}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="error">
        Workspace not found
      </div>
    );
  }

  return (
    <div className="workspace-list-container">
      {/* Workspace Header */}
      <div className="list-header">
        <h2>{workspace.name}</h2>
        <span className="workspace-count">{features.length} feature{features.length !== 1 ? 's' : ''}</span>
      </div>

      {workspace.description && (
        <p className="workspace-description">{workspace.description}</p>
      )}

      <div className="workspace-path">
        {workspace.path}
      </div>

      {/* Features List */}
      {features.length === 0 ? (
        <div className="empty-card">
          <p>No features found in this workspace. Create a feature with "create_feature" to get started.</p>
        </div>
      ) : (
        <div className="workspace-list">
          {features.map((feature: Feature) => (
            <Link key={feature.id} to={`/feature/${feature.id}`} className="workspace-card">
              <h3 className="workspace-card-title">{feature.name}</h3>
              {feature.description && (
                <p className="workspace-description">{feature.description}</p>
              )}
              <div className="workspace-date">
                Created: {new Date(feature.createdAt).toLocaleDateString()}
              </div>
              {feature.progress && feature.progress.total > 0 && (
                <>
                  <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${feature.progress.percentage}%` }}
                    />
                  </div>
                  <div className="progress-stats" style={{ marginTop: '0.5rem' }}>
                    <span>{feature.progress.total} tasks</span>
                    <span>{feature.progress.percentage}% complete</span>
                  </div>
                  <div className="progress-stats" style={{ marginTop: '0.25rem' }}>
                    <span>Planned: {feature.progress.planned}</span>
                    <span>In Review: {feature.progress.inReview}</span>
                    <span>Done: {feature.progress.completed}</span>
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
