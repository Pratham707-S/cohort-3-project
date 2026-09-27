import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  PlusCircle,
  LogOut,
  User,
  LogIn,
  UserPlus,
  Store,
  ShieldAlert,
  ShoppingCart,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  currentPage,
  setCurrentPage,
}) => {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();

  const handleBrandClick = () => {
    if (user) {
      setCurrentPage('home');
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <div className="nav-brand" onClick={handleBrandClick}>
            <div className="brand-icon">
              <ShoppingBag size={18} />
            </div>
            <span>StoreCraft</span>
          </div>

          {user && (
            <div className="nav-tabs">
              <button
                className={`nav-tab-btn ${currentPage === 'home' || currentPage === 'detail' ? 'active' : ''}`}
                onClick={() => setCurrentPage('home')}
              >
                <Store size={15} />
                <span>Shop</span>
              </button>
              <button
                className={`nav-tab-btn ${currentPage === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentPage('admin')}
              >
                <ShieldAlert size={15} />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <button
                className="cart-nav-btn"
                onClick={() => setIsCartOpen(true)}
                title="View Shopping Cart"
              >
                <ShoppingCart size={17} />
                <span>Cart</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>

              {currentPage === 'admin' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={onOpenCreateModal}
                  title="Add New Product"
                >
                  <PlusCircle size={15} />
                  <span>Add Product</span>
                </button>
              )}

              <div className="user-badge">
                <User size={14} />
                <span>
                  <strong>{user.name}</strong>
                </span>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={logout}
                title="Sign out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`btn btn-sm ${currentPage === 'login' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage('login')}
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
              <button
                className={`btn btn-sm ${currentPage === 'register' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage('register')}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

