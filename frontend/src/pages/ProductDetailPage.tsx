import React from 'react';
import { Product } from '../types';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product | null;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
}) => {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const creatorName =
    typeof product.createdBy === 'object' && product.createdBy?.name
      ? product.createdBy.name
      : 'Store Staff';

  return (
    <div className="container page-content">
      <button
        className="btn btn-outline btn-sm"
        onClick={onBack}
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Products</span>
      </button>

      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            maxHeight: '400px',
            background: '#f7f5f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
          }}
        >
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="category-tag" style={{ position: 'static' }}>
              {product.category}
            </span>
            <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} Units In Stock`}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '1.25rem' }}>
            ${Number(product.price).toFixed(2)}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description
            </h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--accent)" />
              <span>Created by: <strong style={{ color: 'var(--text-primary)' }}>{creatorName}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--accent)" />
              <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
