interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  cascadeWarning?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  itemName,
  cascadeWarning,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{message}</p>
          {itemName && (
            <p style={{ marginBottom: '1rem', fontWeight: 500 }}>
              "{itemName}"
            </p>
          )}
          {cascadeWarning && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
                <strong>Warning:</strong> {cascadeWarning}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.9375rem'
            }}
          >
            Cancel
          </button>
          <button
            className="btn"
            onClick={onConfirm}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.9375rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: '1px solid #dc3545'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
