import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Calendar, User, ShoppingCart, Plus, Minus, Check } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product | null;
  onBack: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
}) => {
  const { addToCart, cart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const cartItem = cart.find((item) => item.product._id === product._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const creatorName =
    typeof product.createdBy === 'object' && product.createdBy?.name
      ? product.createdBy.name
      : 'Store Staff';

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  return (
    <div className="container page-content">
      <button
        className="btn btn-outline btn-sm"
        onClick={onBack}
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Store</span>
      </button>

      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            minHeight: '340px',
            background: 'var(--bg-subtle)',
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

          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1.25rem' }}>
            ${Number(product.price).toFixed(2)}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description
            </h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div className="qty-control" style={{ padding: '0.2rem' }}>
              <button
                className="qty-btn"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="qty-val" style={{ fontSize: '0.95rem', minWidth: '32px' }}>
                {qty}
              </span>
              <button
                className="qty-btn"
                disabled={qty >= (product.stock || 1)}
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.95rem' }}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {inCartQty > 0 ? (
                <>
                  <Check size={16} />
                  <span>Add More to Cart ({inCartQty} already in cart)</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
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
              <User size={15} color="var(--accent)" />
              <span>Created by: <strong style={{ color: 'var(--text-primary)' }}>{creatorName}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} color="var(--accent)" />
              <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

