import React, { useState } from 'react';
import { Product } from '../types';
import api from '../services/api';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/products/${product._id}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
            <span>Confirm Deletion</span>
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Are you sure you want to delete <strong style={{ color: '#fff' }}>"{product.name}"</strong>? This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
