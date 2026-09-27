import React, { useState, useEffect } from 'react';
import { Product, FieldError } from '../types';
import api from '../services/api';
import { X, Save, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price !== undefined ? String(productToEdit.price) : '',
        category: productToEdit.category || '',
        stock: productToEdit.stock !== undefined ? String(productToEdit.stock) : '',
        imageUrl: productToEdit.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '10',
        imageUrl: '',
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock, 10),
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      if (productToEdit) {
        await api.put(`/products/${productToEdit._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        err.response.data.errors.forEach((errObj: FieldError) => {
          fieldErrors[errObj.field] = errObj.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button className="modal-close" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div className="alert alert-danger" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Books">Books</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
            </select>
            {errors.category && <div className="field-error">{errors.category}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                className={`form-input ${errors.price ? 'is-invalid' : ''}`}
                placeholder="29.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                className={`form-input ${errors.stock ? 'is-invalid' : ''}`}
                placeholder="10"
                value={formData.stock}
                onChange={handleChange}
                required
              />
              {errors.stock && <div className="field-error">{errors.stock}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              className={`form-input ${errors.imageUrl ? 'is-invalid' : ''}`}
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
            {errors.imageUrl && <div className="field-error">{errors.imageUrl}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              rows={3}
              className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Enter detailed description (min 10 characters)..."
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : productToEdit ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
