import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { featuresApi } from '../services/api';
import type { Plan } from '../types';

type Tab = 'list' | 'context';

export default function FeatureDetail() {
  const { featureId } = useParams<{ featureId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch feature details
  const { data: featureData, isLoading: featureLoading, error: featureError } = useQuery({
    queryKey: ['feature', featureId],
    queryFn: async () => {
      if (!featureId) throw new Error('Feature ID is required');
      const response = await featuresApi.getById(featureId);
      return response.data;
    },
    enabled: !!featureId
  });

  const feature = featureData?.feature;
  const plans = featureData?.feature?.plans || [];

  // Initialize description when feature loads
  if (feature && description === '') {
    setDescription(feature.description || '');
  }

  const handleSave = async () => {
    if (!featureId) return;
    setIsSaving(true);
    try {
      console.log('Saving feature:', featureId, { description });
    } catch (error) {
      console.error('Failed to save feature:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (featureLoading) {
    return <div className="loading">Loading feature...</div>;
  }

  if (featureError || !feature) {
    return (
      <div className="error">
        Failed to load feature: {featureError instanceof Error ? featureError.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="plan-dashboard">
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/workspace/${feature.workspaceId}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
          &larr; Back to Workspace
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{feature.name}</h1>
        <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
          Created: {new Date(feature.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          List ({plans.length})
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
          {plans.length === 0 ? (
            <div className="empty-card">
              <p>No plans found for this feature. Create a plan with "save_plan" to get started.</p>
            </div>
          ) : (
            <div className="workspace-list">
              {plans.map((plan: Plan) => (
                <Link key={plan.id} to={`/plan/${plan.id}`} className="workspace-card">
                  <h3 className="workspace-card-title">{plan.title}</h3>
                  <div className="workspace-date">
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </div>
                  {plan.progress && (
                    <>
                      <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${plan.progress.percentage}%` }}
                        />
                      </div>
                      <div className="progress-stats" style={{ marginTop: '0.5rem' }}>
                        <span>{plan.progress.total} tasks</span>
                        <span>{plan.progress.percentage}% complete</span>
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
            <h3>Feature Details</h3>
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
                value={feature.name}
                readOnly
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div className="plan-editor">
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Description (Markdown)</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter feature description in markdown..."
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
