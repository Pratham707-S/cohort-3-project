import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { DeleteModal } from '../components/DeleteModal';
import { Search, PackageOpen, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface HomePageProps {
  onViewProduct: (product: Product) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onViewProduct,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filters & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 8 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category) params.category = category;

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotalCount(res.data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, category, page]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  return (
    <div className="container page-content">
      <div className="hero-section">
        <div className="hero-header">
          <div>
            <h1 className="hero-title">Discover & Manage Products</h1>
            <p className="hero-subtitle">
              Browse the catalog, search items, or manage your inventory in real-time.
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchProducts}
            title="Refresh list"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>

        
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="category-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Books">Books</option>
            <option value="Beauty">Beauty</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <PackageOpen size={48} className="empty-state-icon" />
          <h3>No products found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            {searchTerm || category
              ? 'Try changing your search keywords or filter category.'
              : 'No products available yet. Click "Add Product" to create your first item.'}
          </p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={onViewProduct}
              />
            ))}
          </div>

         
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: '#fff' }}>{page}</strong> of {totalPages} ({totalCount} total)
              </span>

              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
  
      <ProductModal
        isOpen={isCreateModalOpen || editingProduct !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onSuccess={fetchProducts}
        product={deletingProduct}
      />
    </div>
  );
};
