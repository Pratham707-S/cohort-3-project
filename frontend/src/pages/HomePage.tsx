import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import api from '../services/api';
 import { ProductCard } from '../components/ProductCard';
import { Search, PackageOpen, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';

interface HomePageProps {
  onViewProduct: (product: Product) => void;
}

const CATEGORIES = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Beauty',
  'Sports',
];

export const HomePage: React.FC<HomePageProps> = ({
  onViewProduct,
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 8 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category && category !== 'All') params.category = category;

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

  return (
    <div className="container page-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <Sparkles size={13} color="var(--accent)" />
              <span>Curated Lifestyle & Electronics</span>
            </div>
            <h1 className="hero-title">Timeless Essentials, Crafted For You</h1>
            <p className="hero-subtitle">
              Explore premium products, add them to your cart, and enjoy smooth instant ordering.
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

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search products by title, keyword, or specs..."
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

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => {
            const isActive = (cat === 'All' && !category) || category === cat;
            return (
              <button
                key={cat}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCategory(cat === 'All' ? '' : cat);
                  setPage(1);
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Catalog Display */}
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
              : 'No products available currently in the store.'}
          </p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onView={onViewProduct}
              />
            ))}
          </div>

          {/* Pagination */}
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
                Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of {totalPages} ({totalCount} total items)
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
    </div>
  );
};

