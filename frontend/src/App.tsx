import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminPage } from './pages/AdminPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductModal } from './components/ProductModal';
import { Product } from './types';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'detail' | 'admin'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync route based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If logged in and on an auth page, send to home
        if (currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('home');
        }
      } else {
        // If not logged in and trying to view protected pages, force to login
        if (currentPage === 'home' || currentPage === 'detail' || currentPage === 'admin') {
          setCurrentPage('login');
        }
      }
    }
  }, [user, isLoading, currentPage]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleNavigate = (page: 'home' | 'login' | 'register' | 'detail' | 'admin') => {
    if (!user && (page === 'home' || page === 'detail' || page === 'admin')) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const handleViewProduct = (product: Product) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    setSelectedProduct(product);
    setCurrentPage('detail');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
        onOpenCreateModal={() => {
          if (user) {
            setIsCreateModalOpen(true);
          } else {
            setCurrentPage('login');
          }
        }}
      />

      <main style={{ flex: 1 }}>
        {currentPage === 'login' && (
          <LoginPage
            onSuccess={() => setCurrentPage('home')}
            onNavigateRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSuccess={() => setCurrentPage('login')}
            onNavigateLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'home' && user && (
          <HomePage
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'admin' && user && (
          <AdminPage />
        )}

        {currentPage === 'detail' && user && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => {
              setSelectedProduct(null);
              setCurrentPage('home');
            }}
          />
        )}
      </main>

      {/* Cart Drawer & Checkout Modal */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Global Add Product Modal for Navbar action */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // refreshes are triggered internally by components
        }}
        productToEdit={null}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

