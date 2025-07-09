import React from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  totalFound?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, totalFound }) => {
  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>No products found for your search. Try describing your problem differently.</p>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <h3>
        🛍️ AI-Curated Products ({products.length} selected
        {totalFound && totalFound > products.length && ` from ${totalFound} found`})
      </h3>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid; 