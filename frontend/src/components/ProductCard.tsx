import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Edit3, Trash2, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  const { user } = useAuth();

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-image-wrap" onClick={() => onView(product)} style={{ cursor: 'pointer' }}>
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <span className="category-tag">{product.category}</span>
      </div>

      <div className="product-body">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <div className="card-actions">
          <button
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
            onClick={() => onView(product)}
          >
            <Eye size={14} />
            <span>Details</span>
          </button>

          {user && (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onEdit(product)}
                title="Edit Product"
              >
                <Edit3 size={14} />
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(product)}
                title="Delete Product"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
