import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, LogOut, User, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  currentPage,
  setCurrentPage,
}) => {
  const { user, logout } = useAuth();

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
        <div className="nav-brand" onClick={handleBrandClick}>
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <span>StoreCraft</span>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenCreateModal}
                title="Add New Product"
              >
                <PlusCircle size={16} />
                <span>Add Product</span>
              </button>

              <div className="user-badge">
                <User size={15} />
                <span>
                  Hello, <strong>{user.name}</strong>
                </span>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={logout}
                title="Sign out"
              >
                <LogOut size={16} />
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
