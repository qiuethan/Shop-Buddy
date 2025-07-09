import React, { useState, useMemo } from 'react';
import type { CategorizedProducts, Product } from '../types';
import ProductCard from './ProductCard';
import './ProductBrowser.css';

interface ProductBrowserProps {
  categorizedProducts: CategorizedProducts;
  alternativeProducts: Product[];
  categories: string[];
}

interface FilterOptions {
  minPrice: string;
  maxPrice: string;
  minRating: string;
  source: string;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'alphabetical';
}

const ProductBrowser: React.FC<ProductBrowserProps> = ({ 
  categorizedProducts, 
  alternativeProducts, 
  categories 
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'alternatives'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([categories[0]]));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    source: '',
    sortBy: 'relevance'
  });

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const formatCategoryName = (category: string) => {
    return category
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('tool')) return '🔧';
    if (lowerCategory.includes('screw') || lowerCategory.includes('nail')) return '🔩';
    if (lowerCategory.includes('wood') || lowerCategory.includes('lumber')) return '🪵';
    if (lowerCategory.includes('drill')) return '🪚';
    if (lowerCategory.includes('saw')) return '🪚';
    if (lowerCategory.includes('paint')) return '🎨';
    if (lowerCategory.includes('kit') || lowerCategory.includes('building')) return '📦';
    if (lowerCategory.includes('safety') || lowerCategory.includes('protection')) return '🦺';
    if (lowerCategory.includes('storage') || lowerCategory.includes('shed')) return '🏠';
    if (lowerCategory.includes('electric') || lowerCategory.includes('power')) return '⚡';
    if (lowerCategory.includes('glue') || lowerCategory.includes('adhesive')) return '🧪';
    if (lowerCategory.includes('shoe') || lowerCategory.includes('repair')) return '👟';
    return '📋';
  };

  const parsePrice = (priceStr: string | number | null | undefined): number => {
    if (!priceStr && priceStr !== 0) return 0;
    const priceString = String(priceStr);
    const cleanPrice = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(cleanPrice) || 0;
  };

  const filterAndSortProducts = (products: Product[]) => {
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(searchLower);
        const sourceMatch = product.source.toLowerCase().includes(searchLower);
        if (!titleMatch && !sourceMatch) return false;
      }

      // Price filters
      const productPrice = parsePrice(product.price);
      if (filters.minPrice && productPrice < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && productPrice > parseFloat(filters.maxPrice)) return false;

      // Rating filter
      if (filters.minRating && (!product.rating || product.rating < parseFloat(filters.minRating))) return false;

      // Source filter
      if (filters.source && product.source !== filters.source) return false;

      return true;
    });

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // relevance
        // Keep original order (relevance-based)
        break;
    }

    return filtered;
  };

  const filteredCategorizedProducts = useMemo(() => {
    const result: CategorizedProducts = {};
    Object.keys(categorizedProducts).forEach(category => {
      result[category] = filterAndSortProducts(categorizedProducts[category]);
    });
    return result;
  }, [categorizedProducts, searchQuery, filters]);

  const filteredAlternativeProducts = useMemo(() => {
    return filterAndSortProducts(alternativeProducts);
  }, [alternativeProducts, searchQuery, filters]);

  const allSources = useMemo(() => {
    const sources = new Set<string>();
    Object.values(categorizedProducts).flat().forEach(product => sources.add(product.source));
    alternativeProducts.forEach(product => sources.add(product.source));
    return Array.from(sources).sort();
  }, [categorizedProducts, alternativeProducts]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      source: '',
      sortBy: 'relevance'
    });
  };

  const activeProductCount = activeTab === 'categories' 
    ? Object.values(filteredCategorizedProducts).flat().length
    : filteredAlternativeProducts.length;

  const totalProductCount = activeTab === 'categories'
    ? Object.values(categorizedProducts).flat().length
    : alternativeProducts.length;

  return (
    <div className="product-browser">
      <div className="browser-header">
        <div className="browser-tabs">
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            By Category ({categories.length})
          </button>
          <button 
            className={`tab ${activeTab === 'alternatives' ? 'active' : ''}`}
            onClick={() => setActiveTab('alternatives')}
          >
            Alternatives ({alternativeProducts.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="browser-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="results-count">
            {activeProductCount !== totalProductCount ? (
              <span>Showing {activeProductCount} of {totalProductCount} products</span>
            ) : (
              <span>{totalProductCount} products</span>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="price-input"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="price-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: e.target.value})}
              className="filter-select"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Store</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
              className="filter-select"
            >
              <option value="">All Stores</option>
              {allSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value as FilterOptions['sortBy']})}
              className="filter-select"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {activeTab === 'categories' && (
        <div className="categories-view">
          <div className="categories-sidebar">
            <h3>Categories</h3>
            <div className="category-list">
              {categories.map(category => (
                <div key={category} className="category-item">
                  <button
                    className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <span className="category-name">{formatCategoryName(category)}</span>
                    <span className="category-count">
                      ({filteredCategorizedProducts[category]?.length || 0})
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="category-content">
            {selectedCategory && filteredCategorizedProducts[selectedCategory] && (
              <div className="category-section">
                <div className="category-header">
                  <h3>
                    {getCategoryIcon(selectedCategory)} {formatCategoryName(selectedCategory)}
                  </h3>
                  <p className="category-subtitle">
                    {filteredCategorizedProducts[selectedCategory].length} products found
                  </p>
                </div>
                {filteredCategorizedProducts[selectedCategory].length > 0 ? (
                  <div className="products-grid">
                    {filteredCategorizedProducts[selectedCategory].map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No products match your current filters in this category.</p>
                    <button onClick={clearFilters} className="clear-filters-btn">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alternatives' && (
        <div className="alternatives-view">
          <div className="alternatives-header">
            <h3>🔄 Alternative Products</h3>
            <p className="alternatives-subtitle">
              Other high-quality products that could work for your needs
            </p>
          </div>
          
          {filteredAlternativeProducts.length > 0 ? (
            <div className="products-grid">
              {filteredAlternativeProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchQuery || Object.values(filters).some(f => f !== '' && f !== 'relevance') ? (
            <div className="no-results">
              <p>No alternative products match your current filters.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="no-alternatives">
              <p>No alternative products available. All relevant products are already included in the main solution.</p>
            </div>
          )}
        </div>
      )}

      {/* Expandable Categories View for Mobile */}
      <div className="categories-mobile">
        <h3>📱 Browse by Category</h3>
        {categories.map(category => (
          <div key={category} className="mobile-category">
            <button 
              className="mobile-category-toggle"
              onClick={() => toggleCategory(category)}
            >
              <span className="category-icon">{getCategoryIcon(category)}</span>
              <span className="category-name">{formatCategoryName(category)}</span>
              <span className="category-count">
                ({filteredCategorizedProducts[category]?.length || 0})
              </span>
              <span className="toggle-icon">
                {expandedCategories.has(category) ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedCategories.has(category) && filteredCategorizedProducts[category] && (
              <div className="mobile-category-content">
                {filteredCategorizedProducts[category].length > 0 ? (
                  <div className="products-grid">
                    {filteredCategorizedProducts[category].map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No products match your filters in this category.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductBrowser; 