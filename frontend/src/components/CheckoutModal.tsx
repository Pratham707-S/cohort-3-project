import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, ShieldCheck, CreditCard, Truck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shippingAddress: '123 Main Street, Suite 400',
    city: 'Mumbai',
    postalCode: '400001',
    paymentMethod: 'card',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);
    setOrderPlaced(true);
    clearCart();
  };

  const handleClose = () => {
    setOrderPlaced(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {orderPlaced ? (
              <>
                <CheckCircle2 size={22} color="var(--success)" />
                <span>Order Confirmed!</span>
              </>
            ) : (
              <>
                <ShieldCheck size={22} color="var(--accent)" />
                <span>Secure Checkout</span>
              </>
            )}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {orderPlaced ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Thank you for your purchase!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Your order has been received and is being prepared for shipment.
            </p>

            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                margin: '1.5rem 0',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <strong>{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                <strong>{user?.name || 'Guest'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery To:</span>
                <strong>{formData.city}, {formData.postalCode}</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            {/* Order Items Preview */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                maxHeight: '130px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                ITEMS IN ORDER ({cart.length})
              </div>
              {cart.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>
                    {quantity}x {product.name}
                  </span>
                  <strong>${(product.price * quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Option</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'card' ? 'var(--bg-subtle)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  />
                  <CreditCard size={16} />
                  <span>Card / UPI</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'cod' ? 'var(--bg-subtle)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  />
                  <Truck size={16} />
                  <span>Pay on Delivery</span>
                </label>
              </div>
            </div>

            {/* Total and Submit */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
                  Total Amount
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Place Order
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
