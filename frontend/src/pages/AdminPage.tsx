import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import api from '../services/api';
import { ProductModal } from '../components/ProductModal';
import { DeleteModal } from '../components/DeleteModal';
import {
  Package,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  DollarSign,
  AlertTriangle,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { limit: 100, search: searchTerm, category },
      });
      setProducts(res.data.products || []);
    } catch (e) {
      console.error('Error loading inventory products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, category]);

  // Inventory Metrics
  const totalProducts = products.length;
  const totalValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  return (
    <div className="container page-content">
      {/* Admin Header */}
      <div className="hero-section" style={{ marginBottom: '1.5rem' }}>
        <div className="hero-header">
          <div>
            <h1 className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package size={26} />
              <span>Inventory & Admin Control</span>
            </h1>
            <p className="hero-subtitle">
              Manage product listings, update prices, track stock levels, and control catalog data.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-outline btn-sm" onClick={fetchProducts} title="Refresh inventory">
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle size={16} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-subtle)' }}>
              <Package size={20} color="var(--text-primary)" />
            </div>
            <div>
              <div className="stat-value">{totalProducts}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>
              <DollarSign size={20} color="var(--success)" />
            </div>
            <div>
              <div className="stat-value">${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-label">Inventory Valuation</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-bg)' }}>
              <AlertTriangle size={20} color="var(--danger)" />
            </div>
            <div>
              <div className="stat-value">{lowStockCount}</div>
              <div className="stat-label">Low Stock Items</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-subtle)' }}>
              <Layers size={20} color="var(--text-primary)" />
            </div>
            <div>
              <div className="stat-value">{categoriesCount}</div>
              <div className="stat-label">Active Categories</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={17} />
            <input
              type="text"
              className="search-input"
              placeholder="Search products by name, ID or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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

      {/* Products Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '0.75rem' }}>Loading inventory catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={40} className="empty-state-icon" />
            <h3>No products found</h3>
            <p style={{ marginTop: '0.35rem' }}>
              Add a new product or modify your search filters to view catalog items.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Created By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const creatorName =
                  typeof p.createdBy === 'object' && p.createdBy?.name
                    ? p.createdBy.name
                    : 'Admin Staff';

                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={
                            p.imageUrl ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                          }
                          alt={p.name}
                          className="table-product-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {p._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag" style={{ position: 'static' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`stock-status ${p.stock <= 0 ? 'out-of-stock' : 'in-stock'}`}
                      >
                        {p.stock <= 0 ? '0 (Out)' : `${p.stock} units`}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {creatorName}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditingProduct(p)}
                          title="Edit product"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingProduct(p)}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isCreateModalOpen || editingProduct !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        productToEdit={editingProduct}
      />

      <DeleteModal
        isOpen={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onSuccess={fetchProducts}
        product={deletingProduct}
      />
    </div>
  );
};
