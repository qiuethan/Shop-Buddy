import React from 'react';
import type { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-image.svg';
  };

  const handleClick = () => {
    window.open(product.link, '_blank', 'noopener,noreferrer');
  };

  // Safe render function to handle objects that might be passed as React children
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      // Handle price range objects like {from: "10", to: "20"}
      if (value.from && value.to) {
        return `$${value.from} - $${value.to}`;
      }
      // Handle other objects by converting to JSON string
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={safeRender(product.title)}
          className="product-image"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      
      <div className="product-info">
        <h4 className="product-title">{safeRender(product.title)}</h4>
        
        <div className="product-price">
          <span className="price">{safeRender(product.price)}</span>
        </div>
        
        <div className="product-meta">
          <span className="product-source">{safeRender(product.source)}</span>
          
          {product.rating && (
            <div className="product-rating">
              <span className="rating">⭐ {safeRender(product.rating)}</span>
              {product.reviews && (
                <span className="reviews">({safeRender(product.reviews)} reviews)</span>
              )}
            </div>
          )}
        </div>
        
        <button className="view-product-btn" onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}>
          View Product →
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 