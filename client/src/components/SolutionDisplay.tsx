import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { EmbeddedProduct } from '../types';
import './SolutionDisplay.css';

interface SolutionDisplayProps {
  solution: {
    text: string;
    embeddedProducts: EmbeddedProduct[];
  };
  totalFound: number;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, totalFound }) => {
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());

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

  const toggleAlternatives = (productId: string) => {
    setExpandedAlternatives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Function to preprocess text and convert lists to simple dash format
  const preprocessText = (text: string): string => {
    return text
      .split('\n')
      .map(line => {
        // Convert list items (- or *) to simple dash format
        if (line.match(/^[\s]*[-*][\s]+(.+)$/)) {
          const content = line.replace(/^[\s]*[-*][\s]+/, '');
          return `- ${content}`;
        }
        return line;
      })
      .join('\n');
  };

  // Early return with error handling if solution is invalid
  if (!solution || !solution.text) {
    return (
      <div className="solution-display">
        <div className="solution-header">
          <h2>❌ Solution Error</h2>
          <p className="solution-subtitle">Unable to generate solution. Please try again.</p>
        </div>
      </div>
    );
  }

  // Ensure embeddedProducts exists and is an array
  const embeddedProducts = solution.embeddedProducts || [];

  // Function to render the solution text with embedded products
  const renderSolutionWithProducts = () => {
    if (!solution.text) return null;

    let processedText = solution.text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Find all product placeholders in the format {{PRODUCT_productId}}
    const productPlaceholders = processedText.match(/\{\{PRODUCT_[^}]+\}\}/g) || [];
    
    productPlaceholders.forEach((placeholder, index) => {
      const placeholderIndex = processedText.indexOf(placeholder, lastIndex);
      
      // Add text before the placeholder using ReactMarkdown
      if (placeholderIndex > lastIndex) {
        const textBefore = processedText.substring(lastIndex, placeholderIndex);
        const preprocessedText = preprocessText(textBefore);
        elements.push(
          <ReactMarkdown key={`text-${index}`}>
            {preprocessedText}
          </ReactMarkdown>
        );
      }
      
      // Find the corresponding product
      const productId = placeholder.match(/PRODUCT_([^}]+)/)?.[1];
      const embeddedProduct = embeddedProducts.find(p => p.id === productId);
      
      if (embeddedProduct && embeddedProduct.product) {
        const product = embeddedProduct.product;
        const alternatives = embeddedProduct.alternatives || [];
        const hasAlternatives = alternatives.length > 0;
        const isExpanded = expandedAlternatives.has(embeddedProduct.id);
        
        elements.push(
          <div key={`product-${index}`} className="embedded-product">
            <div className="product-card-inline">
              <div className="product-image-small">
                <img src={product.image || '/placeholder-image.svg'} alt={safeRender(product.title) || 'Product'} />
              </div>
              <div className="product-info-small">
                <h4 className="product-title-small">{safeRender(product.title) || 'Product Title Unavailable'}</h4>
                <div className="product-details-small">
                  <span className="price-small">{safeRender(product.price) || 'Price not available'}</span>
                  <span className="source-small">{safeRender(product.source) || 'Unknown'}</span>
                  {product.rating && (
                    <span className="rating-small">⭐ {safeRender(product.rating)}</span>
                  )}
                </div>
                <div className="product-actions">
                  <a 
                    href={product.link || '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-product-btn-small"
                    onClick={(e) => {
                      if (!product.link || product.link === '#') {
                        e.preventDefault();
                        alert('Product link not available');
                      }
                    }}
                  >
                    View Product →
                  </a>
                  {hasAlternatives && (
                    <button
                      className="alternatives-toggle-btn"
                      onClick={() => toggleAlternatives(embeddedProduct.id)}
                    >
                      {isExpanded ? 'Hide' : 'View'} Alternatives ({alternatives.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {hasAlternatives && isExpanded && (
              <div className="alternatives-section">
                <h5 className="alternatives-title">
                  🔄 Alternative Options
                </h5>
                <div className="alternatives-grid">
                  {alternatives.map((altProduct: any, altIndex: number) => (
                    <div key={`alt-${embeddedProduct.id}-${altIndex}`} className="alternative-product">
                      <div className="alt-product-image">
                        <img src={altProduct.image || '/placeholder-image.svg'} alt={safeRender(altProduct.title) || 'Alternative Product'} />
                      </div>
                      <div className="alt-product-info">
                        <h6 className="alt-product-title">{safeRender(altProduct.title)}</h6>
                        <div className="alt-product-details">
                          <span className="alt-price">{safeRender(altProduct.price)}</span>
                          <span className="alt-source">{safeRender(altProduct.source)}</span>
                          {altProduct.rating && (
                            <span className="alt-rating">⭐ {safeRender(altProduct.rating)}</span>
                          )}
                        </div>
                        <a 
                          href={altProduct.link || '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="alt-view-btn"
                          onClick={(e) => {
                            if (!altProduct.link || altProduct.link === '#') {
                              e.preventDefault();
                              alert('Product link not available');
                            }
                          }}
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      // Find and clean up any punctuation immediately after the placeholder
      let nextIndex = placeholderIndex + placeholder.length;
      const textAfterPlaceholder = processedText.substring(nextIndex);
      
      // Remove leading punctuation (periods, commas, colons, semicolons, etc.)
      const cleanedTextAfter = textAfterPlaceholder.replace(/^[.,;:!?\s]+/, '');
      const removedChars = textAfterPlaceholder.length - cleanedTextAfter.length;
      
      lastIndex = nextIndex + removedChars;
    });
    
    // Add remaining text after the last placeholder using ReactMarkdown
    if (lastIndex < processedText.length) {
      const remainingText = processedText.substring(lastIndex);
      const preprocessedText = preprocessText(remainingText);
      elements.push(
        <ReactMarkdown key="text-final">
          {preprocessedText}
        </ReactMarkdown>
      );
    }
    
    return elements;
  };

  return (
    <div className="solution-display">
      <div className="solution-header">
        <h2>💡 Complete Solution</h2>
        <p className="solution-subtitle">
          {embeddedProducts.length > 0 
            ? `Here's a comprehensive guide with ${embeddedProducts.length} recommended products`
            : "Here's a comprehensive guide to solve your problem"
          }
        </p>
      </div>
      
      <div className="solution-content">
        <div className="solution-text">
          {renderSolutionWithProducts()}
        </div>
      </div>
      
      <div className="solution-footer">
        <div className="solution-stats">
          <span className="stat">
            <strong>{embeddedProducts.length}</strong> Products Recommended
          </span>
          <span className="stat">
            <strong>{totalFound}</strong> Total Products Found
          </span>
        </div>
      </div>
    </div>
  );
};

export default SolutionDisplay; 