const { generateSearchKeywords, curateProducts, generateComprehensiveSolution } = require('./openai.service');
const { searchProducts } = require('./serpapi.service');

/**
 * Find comprehensive solutions for a given problem
 * @param {string} problem - User's problem description
 * @param {Array} stores - Selected stores to search
 * @param {string} maxPrice - Maximum price filter
 * @param {string} location - User location
 * @returns {Promise<object>} Complete solution with keywords, products, and comprehensive solution
 */
async function findSolutions(problem, stores = ['all'], maxPrice = '', location = 'United States') {
  try {
    if (!problem || !problem.trim()) {
      throw new Error('Problem description is required');
    }

    console.log('=== Starting Solution Finding Process ===');
    console.log('Problem:', problem);
    console.log('Selected stores:', stores);
    console.log('Max price:', maxPrice);
    console.log('Location received from frontend:', location);
    console.log('Location type:', typeof location);

    // Step 1: Generate search keywords and get AI-recommended search count
    console.log('\n=== Step 1: Generating Keywords & Search Strategy ===');
    const searchData = await generateSearchKeywords(problem);
    const { keywords: searchKeywords, recommendedSearches } = searchData;
    console.log('Generated keywords:', searchKeywords);
    console.log('AI recommended searches:', recommendedSearches);

    // Step 2: Search for products using SerpAPI with AI-recommended search count
    console.log('\n=== Step 2: Searching Products ===');
    const allProducts = await searchProducts(searchKeywords, stores, maxPrice, location, recommendedSearches);
    console.log('Found products:', allProducts.length);

    // Step 3: Use AI to curate and rank the best products
    console.log('\n=== Step 3: Curating Products ===');
    const curatedProducts = await curateProducts(problem, allProducts);
    console.log('Curated products:', curatedProducts.length);

    // Step 4: Generate comprehensive solution with integrated products
    console.log('\n=== Step 4: Generating Solution ===');
    const comprehensiveSolution = await generateComprehensiveSolution(problem, curatedProducts, allProducts);
    console.log('Generated comprehensive solution with structure:', {
      hasText: !!comprehensiveSolution.text,
      embeddedProductsCount: comprehensiveSolution.embeddedProducts?.length || 0,
      sampleEmbeddedProduct: comprehensiveSolution.embeddedProducts?.[0] || null,
      alternativesInEmbedded: comprehensiveSolution.embeddedProducts?.[0]?.alternatives?.length || 0
    });

    // Step 5: Categorize products by their search source
    console.log('\n=== Step 5: Categorizing Products ===');
    const categorizedProducts = categorizeProductsBySource(allProducts, searchKeywords);
    console.log('Categorized products by source:', Object.keys(categorizedProducts).map(key => 
      `${key}: ${categorizedProducts[key].length} products`
    ));

    // Step 6: Prepare alternative products (products not selected for the main solution + all alternatives from embedded products)
    const embeddedProductIds = new Set(comprehensiveSolution.embeddedProducts?.map(ep => ep.product.id) || []);
    const alternativeProducts = curatedProducts.filter(product => !embeddedProductIds.has(product.id));
    
    // Add all alternatives from embedded products to the alternatives list
    const embeddedAlternatives = [];
    if (comprehensiveSolution.embeddedProducts) {
      comprehensiveSolution.embeddedProducts.forEach(embeddedProduct => {
        if (embeddedProduct.alternatives && embeddedProduct.alternatives.length > 0) {
          embeddedAlternatives.push(...embeddedProduct.alternatives);
        }
      });
    }
    
    // Combine and deduplicate alternatives
    const allAlternativeIds = new Set();
    const combinedAlternatives = [];
    
    // Add non-embedded curated products
    alternativeProducts.forEach(product => {
      if (!allAlternativeIds.has(product.id)) {
        allAlternativeIds.add(product.id);
        combinedAlternatives.push(product);
      }
    });
    
    // Add embedded alternatives
    embeddedAlternatives.forEach(product => {
      if (!allAlternativeIds.has(product.id)) {
        allAlternativeIds.add(product.id);
        combinedAlternatives.push(product);
      }
    });
    
    console.log('Alternative products prepared:', {
      nonEmbeddedAlternatives: alternativeProducts.length,
      embeddedAlternatives: embeddedAlternatives.length,
      totalCombinedAlternatives: combinedAlternatives.length
    });

    // Step 7: Prepare final response
    console.log('\n=== Step 7: Preparing Response ===');
    const response = {
      keywords: searchKeywords,
      solution: comprehensiveSolution,
      products: curatedProducts,
      categorizedProducts: categorizedProducts,
      alternativeProducts: combinedAlternatives,
      totalFound: allProducts.length,
      categories: Object.keys(categorizedProducts),
      searchSummary: {
        totalSearches: recommendedSearches, // Use AI-recommended count
        categoriesFound: Object.keys(categorizedProducts).length,
        productsRecommended: comprehensiveSolution.embeddedProducts?.length || 0,
        alternativesAvailable: combinedAlternatives.length,
        aiRecommendedSearches: recommendedSearches // Track what AI recommended
      }
    };

    console.log('Final response structure:', {
      hasKeywords: !!response.keywords,
      hasSolution: !!response.solution,
      hasSolutionText: !!response.solution?.text,
      embeddedProductsCount: response.solution?.embeddedProducts?.length || 0,
      productsCount: response.products?.length || 0,
      categorizedProductsKeys: Object.keys(response.categorizedProducts),
      alternativeProductsCount: response.alternativeProducts?.length || 0,
      totalFound: response.totalFound,
      aiRecommendedSearches: response.searchSummary.aiRecommendedSearches
    });

    console.log('=== Solution Finding Process Complete ===\n');
    return response;

  } catch (error) {
    console.error('Error in findSolutions:', error);
    throw error;
  }
}

/**
 * Categorize products by their search source
 * @param {Array} products - All products found
 * @param {Array} searchKeywords - Search keywords used
 * @returns {object} Products categorized by search source
 */
function categorizeProductsBySource(products, searchKeywords) {
  const categories = {};
  
  // Group products by their searchSource
  products.forEach(product => {
    const category = product.searchSource || 'General';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(product);
  });

  // Sort products within each category by relevance (products with ratings first, then by price)
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => {
      // Prioritize products with ratings
      if (a.rating && !b.rating) return -1;
      if (!a.rating && b.rating) return 1;
      
      // If both have ratings, sort by rating descending
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      
      // If neither has rating, sort by price ascending (if available)
      const priceA = parseFloat(String(a.price || '0').replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(String(b.price || '0').replace(/[^0-9.]/g, ''));
      
      if (priceA && priceB) {
        return priceA - priceB;
      }
      
      return 0;
    });
  });

  return categories;
}

/**
 * Validate solution finding request parameters
 * @param {object} params - Request parameters
 * @returns {object} Validation result
 */
function validateSolutionRequest(params) {
  const { problem, stores, maxPrice, location } = params;
  const errors = [];

  // Validate problem
  if (!problem || typeof problem !== 'string' || !problem.trim()) {
    errors.push('Problem description is required and must be a non-empty string');
  }

  // Validate stores
  if (stores && !Array.isArray(stores)) {
    errors.push('Stores must be an array');
  }

  // Validate maxPrice
  if (maxPrice && typeof maxPrice !== 'string') {
    errors.push('Max price must be a string');
  }

  // Validate location
  if (location && typeof location !== 'string') {
    errors.push('Location must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get health check for solution service
 * @returns {object} Health check result
 */
function getHealthCheck() {
  return {
    status: 'healthy',
    service: 'solution-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      openai: !!process.env.OPENAI_API_KEY,
      serpapi: !!process.env.SERPAPI_KEY
    }
  };
}

module.exports = {
  findSolutions,
  validateSolutionRequest,
  getHealthCheck
}; 