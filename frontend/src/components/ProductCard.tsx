import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
}) => {
  const { addToCart, cart } = useCart();

  const isOutOfStock = product.stock <= 0;
  const cartItem = cart.find((item) => item.product._id === product._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="product-card">
      <div className="product-image-wrap" onClick={() => onView(product)} style={{ cursor: 'pointer' }}>
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <span className="category-tag">{product.category}</span>
      </div>

      <div className="product-body">
        <h3 className="product-title" title={product.name} onClick={() => onView(product)} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <div className="card-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onView(product)}
            title="View Details"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            disabled={isOutOfStock}
            onClick={() => addToCart(product)}
            title={isOutOfStock ? 'Item is out of stock' : 'Add item to your cart'}
          >
            {inCartQty > 0 ? (
              <>
                <Check size={14} />
                <span>In Cart ({inCartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

