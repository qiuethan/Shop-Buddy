const axios = require('axios');
const { 
  STORE_ENGINES, 
  API_TIMEOUTS, 
  SEARCH_LIMITS 
} = require('../utils/constants');
const { 
  getAmazonCountryCode,
  getTargetDomain,
  getBestBuyDomain,
  getEbayDomain,
  getWalmartDomain,
  getAdvancedFilters
} = require('../utils/location.utils');
const { 
  removeDuplicateProducts, 
  formatProduct 
} = require('../utils/product.utils');

/**
 * Search for products across multiple engines using SerpAPI
 * @param {string} keywords - Search keywords
 * @param {Array} stores - Selected stores
 * @param {string} maxPrice - Maximum price filter
 * @param {string} location - User location
 * @param {number} recommendedSearches - AI-recommended number of searches (optional)
 * @returns {Promise<Array>} Array of products
 */
async function searchProducts(keywords, stores = ['all'], maxPrice = '', location = 'United States', recommendedSearches = null) {
  try {
    console.log('\n=== SerpAPI Multi-Search ===');
    console.log('Stores:', stores);
    console.log('Max price:', maxPrice);
    console.log('Location:', location);
    console.log('AI recommended searches:', recommendedSearches);

    // Clean and parse keywords
    const cleanKeywords = keywords.replace(/['"]/g, '').trim();
    const keywordList = cleanKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    console.log('Original keywords:', keywords);
    console.log('Cleaned keywords:', cleanKeywords);
    console.log('Keyword list:', keywordList);
    
    // Perform multiple targeted searches for better coverage
    const allProducts = [];
    
    // Use AI-recommended searches if provided, otherwise fall back to original logic
    const maxSearches = recommendedSearches !== null 
      ? Math.min(recommendedSearches, keywordList.length)
      : Math.min(SEARCH_LIMITS.MAX_SEARCHES, keywordList.length);
    
    console.log(`🎯 Performing ${maxSearches} searches ${recommendedSearches !== null ? '(AI-recommended)' : '(default limit)'}`);
    
    for (let i = 0; i < maxSearches; i++) {
      const searchQuery = keywordList[i];
      console.log(`Search ${i + 1}/${maxSearches}: "${searchQuery}"`);
      
      const products = await performSingleSearch(searchQuery, stores, maxPrice, location);
      console.log(`Search ${i + 1} returned: ${products.length} products`);
      
      // Add products with search source tracking
      products.forEach(product => {
        product.searchSource = searchQuery;
        allProducts.push(product);
      });
    }
    
    // Remove duplicates based on product_id or title similarity
    const uniqueProducts = removeDuplicateProducts(allProducts);
    console.log(`Total unique products after ${maxSearches} searches: ${uniqueProducts.length}`);
    
    // Log link types for debugging
    const linkStats = uniqueProducts.reduce((acc, product) => {
      acc[product.linkType] = (acc[product.linkType] || 0) + 1;
      return acc;
    }, {});
    console.log('Link types distribution:', linkStats);
    
    return uniqueProducts;
    
  } catch (error) {
    console.error('Error in multi-search:', error);
    throw new Error('Failed to search for products');
  }
}

/**
 * Perform a single search across selected stores
 * @param {string} searchQuery - Search query
 * @param {Array} stores - Selected stores
 * @param {string} maxPrice - Maximum price filter
 * @param {string} location - User location
 * @returns {Promise<Array>} Array of products
 */
async function performSingleSearch(searchQuery, stores = ['all'], maxPrice = '', location = 'United States') {
  try {
    const allProducts = [];
    
    // If no specific stores or 'all' is selected, use Google Shopping engine
    if (stores.includes('all') || stores.length === 0) {
      const products = await performEngineSearch('google_shopping', searchQuery, maxPrice, location);
      allProducts.push(...products);
    } else {
      // Use dedicated store engines for each selected store
      for (const store of stores) {
        const products = await performEngineSearch(store, searchQuery, maxPrice, location);
        allProducts.push(...products);
      }
    }
    
    return allProducts;
    
  } catch (error) {
    console.error('Error in single search:', error);
    return [];
  }
}

/**
 * Perform search using a specific engine
 * @param {string} storeEngine - Store engine to use
 * @param {string} searchQuery - Search query
 * @param {string} maxPrice - Maximum price filter
 * @param {string} location - User location
 * @returns {Promise<Array>} Array of products
 */
async function performEngineSearch(storeEngine, searchQuery, maxPrice = '', location = 'United States') {
  try {
    const engineName = STORE_ENGINES[storeEngine] || 'google_shopping';
    console.log(`Using engine: ${engineName} for store: ${storeEngine}`);
    
    let searchParams = {
      engine: engineName,
      api_key: process.env.SERPAPI_KEY,
      num: SEARCH_LIMITS.MAX_PRODUCTS
    };

    // Configure engine-specific parameters
    switch (engineName) {
      case 'amazon':
        searchParams = configureAmazonSearch(searchParams, searchQuery, maxPrice, location);
        break;
      case 'walmart':
        searchParams = configureWalmartSearch(searchParams, searchQuery, maxPrice, location);
        break;
      case 'home_depot':
        searchParams = configureHomeDepotSearch(searchParams, searchQuery, maxPrice, location);
        break;
      case 'ebay':
        searchParams = configureEbaySearch(searchParams, searchQuery, maxPrice, location);
        break;
      case 'google_shopping':
        searchParams = configureGoogleShoppingSearch(searchParams, searchQuery, maxPrice, location, storeEngine);
        break;
    }

    console.log(`Search params for ${engineName}:`, searchParams);

    const response = await axios.get('https://serpapi.com/search', {
      params: searchParams,
      timeout: API_TIMEOUTS.SERPAPI
    });

    const results = response.data;
    console.log(`${engineName} API Response keys:`, Object.keys(results));
    
    // Check for API errors
    if (results.error) {
      console.error(`${engineName} API Error:`, results.error);
      return [];
    }
    
    if (results.search_metadata?.status === 'Error') {
      console.error(`${engineName} Search Error:`, results.search_metadata);
      return [];
    }
    
    // Log sample product links to verify location
    if (results.products && results.products.length > 0) {
      console.log(`${engineName} sample product links:`, results.products.slice(0, 2).map(p => p.link || p.product_link || p.url || 'No link'));
    } else if (results.organic_results && results.organic_results.length > 0) {
      console.log(`${engineName} sample organic result links:`, results.organic_results.slice(0, 2).map(p => p.link || p.product_link || p.url || 'No link'));
    } else if (results.shopping_results && results.shopping_results.length > 0) {
      console.log(`${engineName} sample shopping result links:`, results.shopping_results.slice(0, 2).map(p => p.link || p.product_link || p.url || 'No link'));
    }

    // Extract products based on engine
    const products = extractProductsFromResponse(results, engineName, storeEngine, location);
    console.log(`Extracted ${products.length} products from ${engineName}`);

    return products;

  } catch (error) {
    console.error(`Error searching ${storeEngine}:`, error.message);
    return [];
  }
}

/**
 * Configure Amazon search parameters
 */
function configureAmazonSearch(params, searchQuery, maxPrice, location) {
  const amazonParams = {
    engine: 'amazon',
    api_key: process.env.SERPAPI_KEY,
    k: searchQuery,  // Amazon API uses 'k' parameter, not 'q'
    amazon_domain: getAmazonCountryCode(location)
  };

  // Add language parameter based on location
  const languageMap = {
    'United States': 'en_US',
    'Canada': 'en_CA', 
    'United Kingdom': 'en_GB',
    'Australia': 'en_AU',
    'Germany': 'de_DE',
    'France': 'fr_FR',
    'Japan': 'ja_JP',
    'Brazil': 'pt_BR'
  };
  
  if (languageMap[location]) {
    amazonParams.language = languageMap[location];
  }

  // Add device parameter (recommended by SerpAPI)
  amazonParams.device = 'desktop';

  // Add price filtering parameters
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    amazonParams.price_max = parseFloat(maxPrice);
    console.log(`Amazon price filtering - Max price: $${maxPrice}`);
  }

  // Remove the generic 'num' parameter as Amazon uses different pagination
  // Amazon uses 'page' parameter for pagination instead
  delete amazonParams.num;

  console.log(`Amazon search config - Location: "${location}", Domain: "${amazonParams.amazon_domain}", Language: "${amazonParams.language || 'default'}", Price Max: "${amazonParams.price_max || 'none'}"`);
  
  return amazonParams;
}

/**
 * Configure Walmart search parameters
 */
function configureWalmartSearch(params, searchQuery, maxPrice, location) {
  const walmartParams = {
    ...params,
    query: searchQuery
  };

  // Add domain for location (Walmart API doesn't support gl/hl parameters)
  const domain = getWalmartDomain(location);
  if (domain !== 'walmart.com') {
    walmartParams.walmart_domain = domain;
  }

  // Note: Walmart API does not support price filtering parameters
  if (maxPrice) {
    console.log(`Walmart search config - Price filtering not supported by Walmart API, max price ${maxPrice} will be ignored`);
  }

  console.log(`Walmart search config - Original location: "${location}", Domain: "${domain}"`);
  
  return walmartParams;
}

/**
 * Configure Home Depot search parameters
 */
function configureHomeDepotSearch(params, searchQuery, maxPrice, location) {
  const homeDepotParams = {
    ...params,
    q: searchQuery
  };

  // Home Depot API uses 'country' parameter, not gl/hl
  if (location === 'Canada') {
    homeDepotParams.country = 'ca';
    
    // Add price filtering for Canada using minmax parameter
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      homeDepotParams.minmax = `price:[0 TO ${parseFloat(maxPrice)}]`;
      console.log(`Home Depot Canada price filtering - Max price: CAD $${maxPrice}`);
    }
  } else {
    // Default to US for all other locations
    homeDepotParams.country = 'us';
    
    // Add price filtering for US using upperbound parameter
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      homeDepotParams.upperbound = parseFloat(maxPrice);
      console.log(`Home Depot US price filtering - Max price: USD $${maxPrice}`);
    }
  }

  console.log(`Home Depot search config - Original location: "${location}", Country parameter: "${homeDepotParams.country}", Price filtering: "${homeDepotParams.minmax || homeDepotParams.upperbound || 'none'}"`);

  return homeDepotParams;
}

/**
 * Get eBay _salic parameter for location
 */
function getEbaySalic(location) {
  const ebayLocationMap = {
    'Canada': '2',
    'United Kingdom': '3', 
    'Australia': '15',
    'Germany': '77',
    'France': '71',
    'Italy': '101',
    'Spain': '186'
  };
  
  return ebayLocationMap[location] || null; // Default to null for US (no _salic needed)
}

/**
 * Configure eBay search parameters
 */
function configureEbaySearch(params, searchQuery, maxPrice, location) {
  const ebayParams = {
    ...params,
    _nkw: searchQuery
  };

  // Add domain for location
  const domain = getEbayDomain(location);
  if (domain !== 'ebay.com') {
    ebayParams.ebay_domain = domain;
  }

  // Add _salic parameter for location (eBay-specific location parameter)
  const salic = getEbaySalic(location);
  if (salic) {
    ebayParams._salic = salic;
  }

  // Add price filtering parameters
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    ebayParams._udhi = parseFloat(maxPrice);  // _udhi = upper limit
    console.log(`eBay price filtering - Max price: $${maxPrice}`);
  }

  console.log(`eBay search config - Original location: "${location}", Domain: "${domain}", _salic: "${salic || 'none (US default)'}", Price Max: "${ebayParams._udhi || 'none'}"`);
  
  return ebayParams;
}

/**
 * Configure Google Shopping search parameters
 */
function configureGoogleShoppingSearch(params, searchQuery, maxPrice, location, storeEngine) {
  const googleParams = {
    ...params,
    q: searchQuery,
    ...getAdvancedFilters(maxPrice, location)
  };

  // Add site filtering for Target and Best Buy
  if (storeEngine === 'target') {
    googleParams.q = `${searchQuery} site:${getTargetDomain(location)}`;
  } else if (storeEngine === 'bestbuy') {
    googleParams.q = `${searchQuery} site:${getBestBuyDomain(location)}`;
  }

  // Add direct_link parameter for supported countries
  const directLinkCountries = ['us', 'ca', 'au'];
  if (directLinkCountries.includes(googleParams.gl)) {
    googleParams.direct_link = 'true';
  }

  console.log(`Google Shopping search config - Original location: "${location}", Store: "${storeEngine}", Country: "${googleParams.gl}", Language: "${googleParams.hl}"`);

  return googleParams;
}

/**
 * Extract products from API response based on engine
 * @param {object} results - API response
 * @param {string} engineName - Engine name
 * @param {string} storeEngine - Store engine
 * @param {string} location - User location for link conversion
 * @returns {Array} Extracted products
 */
function extractProductsFromResponse(results, engineName, storeEngine, location = 'United States') {
  let products = [];

  switch (engineName) {
    case 'amazon':
      // Amazon API returns results in organic_results array
      products = results.organic_results || [];
      console.log(`Amazon extraction: found ${products.length} organic_results`);
      
      // Also check for ads/sponsored results
      if (results.ads) {
        console.log(`Amazon extraction: found ${results.ads.length} ads`);
        products = [...products, ...results.ads];
      }
      
      // Fallback to products array if no organic results
      if (products.length === 0 && results.products) {
        products = results.products;
        console.log(`Amazon extraction: fallback to ${products.length} products`);
      }
      
      return products.map(product => formatProduct(product, 'Amazon', location));

    case 'walmart':
      products = results.organic_results || [];
      return products.map(product => formatProduct(product, 'Walmart', location));

    case 'home_depot':
      products = results.products || [];
      return products.map(product => formatProduct(product, 'Home Depot', location));

    case 'ebay':
      products = results.organic_results || [];
      return products.map(product => formatProduct(product, 'eBay', location));

    case 'google_shopping':
      products = results.shopping_results || [];
      const sourceName = storeEngine === 'target' ? 'Target' : 
                        storeEngine === 'bestbuy' ? 'Best Buy' : 'Google Shopping';
      return products.map(product => formatProduct(product, sourceName, location));

    default:
      console.warn(`Unknown engine: ${engineName}`);
      return [];
  }
}

module.exports = {
  searchProducts,
  performSingleSearch,
  performEngineSearch
}; 