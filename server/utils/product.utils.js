/**
 * Remove duplicate products from an array based on similarity
 * @param {Array} products - Array of products
 * @returns {Array} Array of unique products
 */
function removeDuplicateProducts(products) {
  const unique = [];
  const seenTitles = new Set();
  
  for (const product of products) {
    // Clean and normalize title for comparison
    const normalizedTitle = product.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Check if we've seen a very similar title
    const isDuplicate = Array.from(seenTitles).some(seenTitle => {
      const similarity = calculateSimilarity(normalizedTitle, seenTitle);
      return similarity > 0.8; // 80% similarity threshold
    });
    
    if (!isDuplicate) {
      seenTitles.add(normalizedTitle);
      unique.push(product);
    }
  }
  
  return unique;
}

/**
 * Calculate similarity between two strings using Jaccard similarity
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Convert product links to location-specific domains
 * @param {string} link - Original product link
 * @param {string} source - Product source (Amazon, Walmart, etc.)
 * @param {string} location - User location
 * @returns {string} Location-specific link
 */
function convertLinkToLocation(link, source, location) {
  if (!link || link === '#') return link;
  
  try {
    const url = new URL(link);
    const originalDomain = url.hostname;
    
    // Amazon domain conversion
    if (source === 'Amazon' && url.hostname.includes('amazon')) {
      const locationDomains = {
        'United States': 'amazon.com',
        'Canada': 'amazon.ca',
        'United Kingdom': 'amazon.co.uk',
        'Australia': 'amazon.com.au',
        'Germany': 'amazon.de',
        'France': 'amazon.fr',
        'Japan': 'amazon.co.jp',
        'Brazil': 'amazon.com.br'
      };
      
      const targetDomain = locationDomains[location];
      if (targetDomain && targetDomain !== originalDomain) {
        url.hostname = targetDomain;
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → ${targetDomain} (${location})`);
        return convertedLink;
      }
    }
    
    // Walmart domain conversion
    if (source === 'Walmart' && url.hostname.includes('walmart')) {
      const locationDomains = {
        'United States': 'walmart.com',
        'Canada': 'walmart.ca'
      };
      
      const targetDomain = locationDomains[location];
      if (targetDomain && targetDomain !== originalDomain) {
        url.hostname = targetDomain;
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → ${targetDomain} (${location})`);
        return convertedLink;
      }
    }
    
    // eBay domain conversion
    if (source === 'eBay' && url.hostname.includes('ebay')) {
      const locationDomains = {
        'United States': 'ebay.com',
        'Canada': 'ebay.ca',
        'United Kingdom': 'ebay.co.uk',
        'Australia': 'ebay.com.au',
        'Germany': 'ebay.de',
        'France': 'ebay.fr',
        'Japan': 'ebay.co.jp'
      };
      
      const targetDomain = locationDomains[location];
      if (targetDomain && targetDomain !== originalDomain) {
        url.hostname = targetDomain;
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → ${targetDomain} (${location})`);
        return convertedLink;
      }
    }
    
    // Home Depot domain conversion
    if (source === 'Home Depot' && url.hostname.includes('homedepot')) {
      const locationDomains = {
        'United States': 'homedepot.com',
        'Canada': 'homedepot.ca'
      };
      
      const targetDomain = locationDomains[location];
      if (targetDomain && targetDomain !== originalDomain) {
        url.hostname = targetDomain;
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → ${targetDomain} (${location})`);
        return convertedLink;
      }
    }
    
    // Target domain conversion (US only)
    if (source === 'Target' && url.hostname.includes('target')) {
      if (location === 'United States' && url.hostname !== 'target.com') {
        url.hostname = 'target.com';
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → target.com (${location})`);
        return convertedLink;
      }
    }
    
    // Best Buy domain conversion
    if (source === 'Best Buy' && url.hostname.includes('bestbuy')) {
      const locationDomains = {
        'United States': 'bestbuy.com',
        'Canada': 'bestbuy.ca'
      };
      
      const targetDomain = locationDomains[location];
      if (targetDomain && targetDomain !== originalDomain) {
        url.hostname = targetDomain;
        const convertedLink = url.toString();
        console.log(`🔗 Link converted: ${originalDomain} → ${targetDomain} (${location})`);
        return convertedLink;
      }
    }
    
    // Google Shopping - try to detect and convert common retailers
    if (source === 'Google Shopping') {
      // Try to detect the retailer from the URL and convert accordingly
      if (url.hostname.includes('amazon')) {
        return convertLinkToLocation(link, 'Amazon', location);
      } else if (url.hostname.includes('walmart')) {
        return convertLinkToLocation(link, 'Walmart', location);
      } else if (url.hostname.includes('ebay')) {
        return convertLinkToLocation(link, 'eBay', location);
      } else if (url.hostname.includes('homedepot')) {
        return convertLinkToLocation(link, 'Home Depot', location);
      } else if (url.hostname.includes('target')) {
        return convertLinkToLocation(link, 'Target', location);
      } else if (url.hostname.includes('bestbuy')) {
        return convertLinkToLocation(link, 'Best Buy', location);
      }
    }
    
    return link; // Return original if no conversion needed
    
  } catch (error) {
    console.warn('Error converting link to location:', error.message);
    return link; // Return original link if URL parsing fails
  }
}

/**
 * Extract context around a product reference in text
 * @param {string} text - Full text
 * @param {string} productRef - Product reference to find
 * @returns {string} Context around the product reference
 */
function extractContextAroundProduct(text, productRef) {
  const refIndex = text.indexOf(productRef);
  const start = Math.max(0, refIndex - 100);
  const end = Math.min(text.length, refIndex + 100);
  return text.substring(start, end).trim();
}

/**
 * Parse solution text and replace product references with embedded products
 * @param {string} solutionText - Solution text with product references
 * @param {Array} products - Array of available products
 * @returns {object} Object with processed text and embedded products
 */
function parseAndEmbedProducts(solutionText, products) {
  const embeddedProducts = [];
  let processedText = solutionText;
  
  // Find all product references in the format [PRODUCT_X]
  const productReferences = solutionText.match(/\[PRODUCT_\d+\]/g) || [];
  
  productReferences.forEach(ref => {
    const productIndex = parseInt(ref.match(/\d+/)[0]) - 1;
    if (productIndex >= 0 && productIndex < products.length) {
      const product = products[productIndex];
      const productId = `product_${productIndex}_${Date.now()}`;
      
      // Replace the reference with a placeholder that the frontend can handle
      processedText = processedText.replace(ref, `{{PRODUCT_${productId}}}`);
      
      // Store the product info for the frontend
      embeddedProducts.push({
        id: productId,
        productIndex: productIndex,
        product: product,
        context: extractContextAroundProduct(solutionText, ref)
      });
    }
  });
  
  // Fallback: If AI created markdown links instead of using product IDs, try to match them
  if (embeddedProducts.length === 0) {
    console.log('No product references found, attempting to match markdown links...');
    
    // Look for markdown links that might contain product information
    const markdownLinks = solutionText.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    
    markdownLinks.forEach((link, index) => {
      if (index < products.length) {
        const product = products[index];
        const productId = `product_${index}_${Date.now()}`;
        
        // Replace the markdown link with a placeholder
        processedText = processedText.replace(link, `{{PRODUCT_${productId}}}`);
        
        // Store the product info for the frontend
        embeddedProducts.push({
          id: productId,
          productIndex: index,
          product: product,
          context: extractContextAroundProduct(solutionText, link)
        });
      }
    });
  }
  
  return {
    text: processedText,
    embeddedProducts: embeddedProducts
  };
}

/**
 * Format product data for API response
 * @param {object} product - Raw product data
 * @param {string} source - Product source
 * @param {string} location - User location for link conversion
 * @returns {object} Formatted product
 */
function formatProduct(product, source, location = 'United States') {
  // Helper function to safely convert values to strings
  const safeStringify = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      // Handle price range objects like {from: "10", to: "20"}
      if (value.from && value.to) {
        return `$${value.from} - $${value.to}`;
      }
      // For other objects, try to extract a meaningful string
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Extract image URL with source-specific logic
  let imageUrl = '/placeholder-image.svg';
  
  try {
    if (source === 'Home Depot') {
      // Home Depot uses 'thumbnails' with nested arrays: [[url1, url2, ...]]
      if (product.thumbnails && Array.isArray(product.thumbnails) && product.thumbnails.length > 0) {
        const firstThumbnailArray = product.thumbnails[0];
        if (Array.isArray(firstThumbnailArray) && firstThumbnailArray.length > 0) {
          imageUrl = firstThumbnailArray[0];
        }
      }
      // Fallback to standard fields if thumbnails extraction failed
      if (imageUrl === '/placeholder-image.svg') {
        imageUrl = product.thumbnail || product.image || '/placeholder-image.svg';
      }
    } else {
      // Standard image extraction for all other stores (Amazon, Walmart, eBay, etc.)
      imageUrl = product.thumbnail || product.image || '/placeholder-image.svg';
    }
  } catch (error) {
    imageUrl = '/placeholder-image.svg';
  }

  // Extract price with source-specific logic
  let price = 'Price not available';
  
  try {
    if (source === 'Walmart') {
      // Walmart uses primary_offer.offer_price
      if (product.primary_offer && product.primary_offer.offer_price) {
        const priceValue = product.primary_offer.offer_price;
        const currency = product.primary_offer.currency || 'USD';
        price = currency === 'USD' ? `$${priceValue}` : `${priceValue} ${currency}`;
      } else {
        // Fallback to standard price field
        price = safeStringify(product.price, 'Price not available');
      }
    } else {
      // Standard price extraction for other stores
      price = safeStringify(product.price, 'Price not available');
    }
  } catch (error) {
    price = 'Price not available';
  }

  // Basic product structure with safe string conversion
  const formattedProduct = {
    id: product.product_id || product.us_item_id || `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: safeStringify(product.title, 'Unknown Product'),
    price: price,
    image: imageUrl,
    source: source,
    linkType: 'unknown'
  };

  // Handle different link types and prioritize direct links with source-specific logic
  let rawLink = '';
  
  if (source === 'Walmart') {
    // Walmart uses product_page_url
    if (product.product_page_url) {
      rawLink = product.product_page_url;
      formattedProduct.linkType = 'product_page';
    } else {
      // Fallback to standard link fields
      if (product.direct_link) {
        rawLink = product.direct_link;
        formattedProduct.linkType = 'direct';
      } else if (product.product_link) {
        rawLink = product.product_link;
        formattedProduct.linkType = 'product';
      } else if (product.link) {
        rawLink = product.link;
        formattedProduct.linkType = 'link';
      } else {
        rawLink = '#';
        formattedProduct.linkType = 'none';
      }
    }
  } else {
    // Standard link extraction for other stores
    if (product.direct_link) {
      rawLink = product.direct_link;
      formattedProduct.linkType = 'direct';
    } else if (product.product_link) {
      rawLink = product.product_link;
      formattedProduct.linkType = 'product';
    } else if (product.link) {
      rawLink = product.link;
      formattedProduct.linkType = 'link';
    } else if (product.url) {
      rawLink = product.url;
      formattedProduct.linkType = 'url';
    } else if (product.comparisons_link) {
      rawLink = product.comparisons_link;
      formattedProduct.linkType = 'comparison';
    } else {
      rawLink = '#';
      formattedProduct.linkType = 'none';
      console.warn('No link found for product:', product.title, 'Available keys:', Object.keys(product));
    }
  }

  // Convert link to location-specific domain (only for Google Shopping results)
  // Amazon API should return correct links, but Google Shopping might need conversion
  if (source === 'Google Shopping') {
    formattedProduct.link = convertLinkToLocation(rawLink, source, location);
  } else {
    formattedProduct.link = rawLink;
  }

  // Add rating and reviews if available - ensure they're numbers
  if (product.rating) {
    const rating = parseFloat(product.rating);
    if (!isNaN(rating)) {
      formattedProduct.rating = rating;
    }
  }
  if (product.reviews) {
    const reviews = parseInt(product.reviews);
    if (!isNaN(reviews)) {
      formattedProduct.reviews = reviews;
    }
  }

  return formattedProduct;
}

module.exports = {
  removeDuplicateProducts,
  calculateSimilarity,
  extractContextAroundProduct,
  parseAndEmbedProducts,
  formatProduct,
  convertLinkToLocation
}; 