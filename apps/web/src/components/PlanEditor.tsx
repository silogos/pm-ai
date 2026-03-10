import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Plan } from '../types';

interface PlanEditorProps {
  plans: Plan[];
}

export default function PlanEditor({ plans }: PlanEditorProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(plans[0] || null);
  const [markdown, setMarkdown] = useState(selectedPlan?.markdown || '');
  const [isSaving, setIsSaving] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setMarkdown(plan.markdown);
  };

  const handleSave = async () => {
    if (!selectedPlan) return;

    setIsSaving(true);
    try {
      // Note: The current API doesn't support updating plans, only creating
      // This is a placeholder for when update functionality is added
      console.log('Saving plan:', selectedPlan.id);
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="plan-editor-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Plan</h3>
        {plans.length === 0 ? (
          <p style={{ color: '#666' }}>No plans found for this project.</p>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {plans.map((plan) => (
              <button
                key={plan.id}
                className={`btn ${selectedPlan?.id === plan.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPlan && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{selectedPlan.title}</h3>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="plan-editor">
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Markdown</h4>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Enter markdown here..."
              />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Preview</h4>
              <div className="plan-preview">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedPlan && selectedPlan.progress && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Plan Progress</h4>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${selectedPlan.progress.percentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span>Total: {selectedPlan.progress.total}</span>
            <span>Planned: {selectedPlan.progress.planned}</span>
            <span>In Review: {selectedPlan.progress.inReview}</span>
            <span>Done: {selectedPlan.progress.completed}</span>
            <span>{selectedPlan.progress.percentage}% Complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
