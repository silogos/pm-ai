import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { plansApi } from '../services/api';
import TaskBoard from './TaskBoard';
import DependencyGraph from './DependencyGraph';

type Tab = 'tasks' | 'dependencies';

export default function PlanDashboard() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const { data, isLoading, error } = useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      if (!id) throw new Error('Plan ID is required');
      const response = await plansApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="loading">Loading plan...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load plan: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const plan = data?.plan;

  if (!plan) {
    return <div className="error">Plan not found</div>;
  }

  return (
    <div className="plan-dashboard">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/feature/${plan.featureId}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
          &larr; Back to Plans
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{plan.title}</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Created: {new Date(plan.createdAt).toLocaleDateString()}
        </p>

        {plan.progress && (
          <div style={{ marginTop: '1rem' }}>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${plan.progress.percentage}%` }}
              />
            </div>
            <div className="progress-stats">
              <span>Total: {plan.progress.total}</span>
              <span>Planned: {plan.progress.planned}</span>
              <span>In Review: {plan.progress.inReview}</span>
              <span>Done: {plan.progress.completed}</span>
              <span>{plan.progress.percentage}% Complete</span>
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
          className={`tab ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </div>
      </div>

      {activeTab === 'tasks' && <TaskBoard planId={plan.id} />}
      {activeTab === 'dependencies' && <DependencyGraph planId={plan.id} />}
    </div>
  );
}
