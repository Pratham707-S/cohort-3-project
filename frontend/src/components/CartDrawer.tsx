import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    tax,
    totalPrice,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Cart</h2>
            <span className="cart-count-pill">{totalItems}</span>
          </div>
          <button
            className="modal-close"
            onClick={() => setIsCartOpen(false)}
            title="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Your cart is empty</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Looks like you haven't added any items to your bag yet.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1.25rem' }}
                onClick={() => setIsCartOpen(false)}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(({ product, quantity }) => (
                <div key={product._id} className="cart-item-card">
                  <div className="cart-item-thumb">
                    <img
                      src={
                        product.imageUrl ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
                      }
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                      }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <h4 className="cart-item-name" title={product.name}>
                      {product.name}
                    </h4>
                    <span className="cart-item-category">{product.category}</span>
                    <span className="cart-item-price">
                      ${(product.price * quantity).toFixed(2)}
                      {quantity > 1 && (
                        <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                          (${Number(product.price).toFixed(2)} ea)
                        </small>
                      )}
                    </span>

                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          title="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= (product.stock || 99)}
                          title="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(product._id)}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="cart-summary-row" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Est. Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row total-row">
              <span>Total</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>

            <button
              className="btn btn-primary checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
