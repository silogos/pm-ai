import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { featuresApi } from '../services/api';
import type { Plan } from '../types';

interface PlanListProps {
  featureId?: string;
}

export default function PlanList({ featureId: propFeatureId }: PlanListProps) {
  const { featureId: paramFeatureId } = useParams<{ featureId: string }>();
  const featureId = propFeatureId || paramFeatureId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['plans', featureId],
    queryFn: async () => {
      if (!featureId) return null;
      const response = await featuresApi.getPlans(featureId);
      return response.data;
    },
    enabled: !!featureId
  });

  if (isLoading) {
    return <div className="loading">Loading plans...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Failed to load plans: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const plans = data?.plans || [];

  return (
    <div className="plan-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Plans</h2>
        <span className="plan-count">{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
      </div>

      {plans.length === 0 ? (
        <div className="empty">
          <p>No plans found for this feature. Create a plan with "save_plan" to get started.</p>
        </div>
      ) : (
        <div className="plan-list">
          {plans.map((plan: Plan) => (
            <Link key={plan.id} to={`/plan/${plan.id}`} className="plan-card">
              <h3>{plan.title}</h3>
              <div className="plan-date">
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </div>
              {plan.progress && (
                <>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${plan.progress.percentage}%` }}
                    />
                  </div>
                  <div className="progress-stats">
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
  );
}
