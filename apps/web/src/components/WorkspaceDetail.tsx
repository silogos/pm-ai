import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { workspacesApi } from '../services/api';
import type { Feature } from '../types';

type Tab = 'list' | 'context';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch workspace details
  const { data: workspaceData, isLoading: workspaceLoading, error: workspaceError } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const response = await workspacesApi.getById(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId
  });

  const workspace = workspaceData?.workspace;
  const features = workspaceData?.workspace?.features || [];

  // Initialize description when workspace loads
  if (workspace && description === '') {
    setDescription(workspace.description || '');
  }

  const handleSave = async () => {
    if (!workspaceId) return;
    setIsSaving(true);
    try {
      console.log('Saving workspace:', workspaceId, { description });
    } catch (error) {
      console.error('Failed to save workspace:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (workspaceLoading) {
    return <div className="loading">Loading workspace...</div>;
  }

  if (workspaceError || !workspace) {
    return (
      <div className="error">
        Failed to load workspace: {workspaceError instanceof Error ? workspaceError.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="plan-dashboard">
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          &larr; Back to Workspaces
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{workspace.name}</h1>
        <p style={{ color: '#666', margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {workspace.path}
        </p>
        <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
          Created: {new Date(workspace.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          List ({features.length})
        </div>
        <div
          className={`tab ${activeTab === 'context' ? 'active' : ''}`}
          onClick={() => setActiveTab('context')}
        >
          Context
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="workspace-list-container">
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
      )}

      {activeTab === 'context' && (
        <div className="plan-editor-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Workspace Details</h3>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="detail-fields" style={{ marginBottom: '1.5rem' }}>
            <div className="detail-field">
              <label className="detail-field-label">Name</label>
              <input
                type="text"
                className="detail-field-input"
                value={workspace.name}
                readOnly
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}
              />
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Path</label>
              <input
                type="text"
                className="detail-field-input"
                value={workspace.path}
                readOnly
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div className="plan-editor">
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Description (Markdown)</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter workspace description in markdown..."
                style={{ width: '100%', minHeight: '300px', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Preview</h4>
              <div className="plan-preview">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
