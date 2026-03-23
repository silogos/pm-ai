import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { featuresApi, plansApi } from '../services/api';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import type { Plan } from '../types';
import { useState } from 'react';

interface PlanListProps {
  featureId?: string;
}

export default function PlanList({ featureId: propFeatureId }: PlanListProps) {
  const { featureId: paramFeatureId } = useParams<{ featureId: string }>();
  const featureId = propFeatureId || paramFeatureId;
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    planId: string;
    planTitle: string;
  }>({
    isOpen: false,
    planId: '',
    planTitle: ''
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['plans', featureId],
    queryFn: async () => {
      if (!featureId) return null;
      const response = await featuresApi.getPlans(featureId);
      return response.data;
    },
    enabled: !!featureId
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      await plansApi.delete(planId);
    },
    onSuccess: () => {
      // Invalidate and refetch plans list
      queryClient.invalidateQueries({ queryKey: ['plans', featureId] });
      queryClient.invalidateQueries({ queryKey: ['feature', featureId] });
    }
  });

  const handleDeleteClick = (plan: Plan) => {
    setDeleteDialog({
      isOpen: true,
      planId: plan.id,
      planTitle: plan.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePlanMutation.mutateAsync(deleteDialog.planId);
      setDeleteDialog({ isOpen: false, planId: '', planTitle: '' });
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

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
            <div key={plan.id} className="plan-card" style={{ position: 'relative' }}>
              <Link to={`/plan/${plan.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteClick(plan);
                }}
                className="btn"
                disabled={deletePlanMutation.isPending}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: '1px solid #dc3545',
                  opacity: deletePlanMutation.isPending ? 0.6 : 1,
                  cursor: deletePlanMutation.isPending ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!deletePlanMutation.isPending) {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        itemName={deleteDialog.planTitle}
        cascadeWarning="All associated tasks will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, planId: '', planTitle: '' })}
      />
    </div>
  );
}
