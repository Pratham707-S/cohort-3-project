import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FieldError } from '../types';
import { LogIn, AlertCircle, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateRegister,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      await login({ email, password });
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        err.response.data.errors.forEach((e: FieldError) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.response?.data?.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleType: 'customer' | 'admin') => {
    setDemoLoading(roleType);
    setGeneralError(null);
    setErrors({});

    const creds =
      roleType === 'admin'
        ? { email: 'pratham@test.com', password: 'password123' }
        : { email: 'customer@test.com', password: 'password123' };

    try {
      await login(creds);
      onSuccess();
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Quick login failed. Please enter credentials manually.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <h2 className="auth-title">Welcome to StoreCraft</h2>
          <p className="auth-subtitle">Sign in as a Customer to shop or as Admin to manage the store</p>
        </div>

        {generalError && (
          <div className="alert alert-danger" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        {/* 1-Click Role Login Presets */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Access (1-Click)
          </div>

          <button
            type="button"
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              background: 'var(--bg-primary)',
            }}
            disabled={demoLoading !== null || isSubmitting}
            onClick={() => handleQuickLogin('customer')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
                <ShoppingBag size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Login as Customer / Shopper
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Browse shop, add to cart & checkout
                </div>
              </div>
            </div>
            {demoLoading === 'customer' ? <div className="loading-spinner" style={{ width: '18px', height: '18px' }}></div> : <ArrowRight size={16} />}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              background: 'var(--bg-primary)',
            }}
            disabled={demoLoading !== null || isSubmitting}
            onClick={() => handleQuickLogin('admin')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
                <ShieldCheck size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Login as Admin / Store Manager
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Access Admin Panel, inventory & metrics
                </div>
              </div>
            </div>
            {demoLoading === 'admin' ? <div className="loading-spinner" style={{ width: '18px', height: '18px' }}></div> : <ArrowRight size={16} />}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or enter credentials</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. pratham@test.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              required
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting || demoLoading !== null}
          >
            <LogIn size={16} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In with Email'}</span>
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button
            onClick={onNavigateRegister}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Create customer account
          </button>
        </p>
      </div>
    </div>
  );
};

