import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Feature } from '../types';

interface WorkspaceData {
  workspace: {
    path: string;
    total_features: number;
    statistics: {
      totalFeatures: number;
      totalTasks: number;
      completedTasks: number;
      overallProgress: number;
    };
  };
  features: Feature[];
}

export function WorkspaceOverview() {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspace();
  }, []);

  async function fetchWorkspace() {
    try {
      setLoading(true);
      const response = await fetch('/api/workspace/current');
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
      <div className="loading-state">
        <div className="loading-message">Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="empty-state">
        <div className="empty-message">No workspace data available</div>
      </div>
    );
  }

  const stats = workspace.workspace.statistics;

  return (
    <div className="workspace-overview">
      {/* Header */}
      <div className="overview-header">
        <h1 className="overview-title">Workspace Overview</h1>
        <p className="overview-path">
          {workspace.workspace.path}
        </p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Features</div>
          <div className="stat-value">{stats.totalFeatures}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.totalTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value stat-value-success">{stats.completedTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Progress</div>
          <div className="stat-value stat-value-primary">{stats.overallProgress}%</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-header">
        <h2 className="features-title">
          Features ({workspace.features.length})
        </h2>
      </div>

      {workspace.features.length === 0 ? (
        <div className="empty-card">
          <div className="empty-message">No PM-AI features found in this workspace.</div>
          <br />
          <Link to="/" className="link-primary">
            Initialize your workspace first
          </Link>
        </div>
      ) : (
        <div className="features-grid">
          {workspace.features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const progress = feature.progress;
  const percentage = progress?.percentage || 0;
  const completed = progress?.completed || 0;
  const total = progress?.total || 0;

  return (
    <Link to={`/feature/${feature.id}`} className="feature-card-link">
      <div className="feature-card-overview">
        <div className="feature-card-body">
          <h3 className="feature-card-title">
            {feature.name}
          </h3>
          {feature.description && (
            <p className="feature-card-description">
              {feature.description}
            </p>
          )}
        </div>

        {total > 0 && (
          <div className="feature-progress">
            <div className="progress-header">
              <span className="progress-label">Progress</span>
              <span className="progress-value">
                {completed}/{total} ({percentage}%)
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill progress-bar-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="feature-card-date">
          Created: {new Date(feature.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}
