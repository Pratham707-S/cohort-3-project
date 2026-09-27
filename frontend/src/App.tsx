import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { Product } from './types';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'detail'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        if (currentPage === 'home' || currentPage === 'detail') {
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

  const handleNavigate = (page: 'home' | 'login' | 'register' | 'detail') => {
    if (!user && (page === 'home' || page === 'detail')) {
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
        setCurrentPage={handleNavigate as any}
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
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
