import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { featuresApi, workspacesApi } from '../services/api';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import type { Feature } from '../types';
import { useState } from 'react';

interface FeatureListProps {
  workspaceId?: string;
}

export default function FeatureList({ workspaceId: propWorkspaceId }: FeatureListProps) {
  const { workspaceId: paramWorkspaceId } = useParams<{ workspaceId: string }>();
  const workspaceId = propWorkspaceId || paramWorkspaceId;
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    featureId: string;
    featureName: string;
  }>({
    isOpen: false,
    featureId: '',
    featureName: ''
  });

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

  // Delete feature mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      await featuresApi.delete(featureId);
    },
    onSuccess: () => {
      // Invalidate and refetch features list
      queryClient.invalidateQueries({ queryKey: ['features', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    }
  });

  const handleDeleteClick = (feature: Feature) => {
    setDeleteDialog({
      isOpen: true,
      featureId: feature.id,
      featureName: feature.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFeatureMutation.mutateAsync(deleteDialog.featureId);
      setDeleteDialog({ isOpen: false, featureId: '', featureName: '' });
    } catch (error) {
      console.error('Failed to delete feature:', error);
    }
  };

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
            <div key={feature.id} className="workspace-card" style={{ position: 'relative' }}>
              <Link to={`/feature/${feature.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteClick(feature);
                }}
                className="btn"
                disabled={deleteFeatureMutation.isPending}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: '1px solid #dc3545',
                  opacity: deleteFeatureMutation.isPending ? 0.6 : 1,
                  cursor: deleteFeatureMutation.isPending ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!deleteFeatureMutation.isPending) {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                {deleteFeatureMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Feature"
        message="Are you sure you want to delete this feature? This action cannot be undone."
        itemName={deleteDialog.featureName}
        cascadeWarning="All associated plans and tasks will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, featureId: '', featureName: '' })}
      />
    </div>
  );
}
