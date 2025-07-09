const axios = require('axios');
const { API_TIMEOUTS, SEARCH_LIMITS } = require('../utils/constants');
const { parseAndEmbedProducts } = require('../utils/product.utils');

/**
 * Generate search keywords and determine optimal search count using GPT-4o API
 * @param {string} problem - User's problem description
 * @returns {Promise<object>} Generated keywords and recommended search count
 */
async function generateSearchKeywords(problem) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are an expert shopping assistant. Given any problem or need, generate specific product search keywords AND determine how many searches are needed (1-5) based on complexity. Consider all types of problems: tech issues, home improvement, health, lifestyle, hobbies, work, etc.'
          },
          {
            role: 'user',
            content: `Problem: "${problem}"

Analyze the complexity and determine:
1. How many different searches are needed (1-5)?
   - Simple problems (like "buy headphones"): 1-2 searches
   - Medium complexity (like "laptop running slow"): 2-3 searches  
   - Complex problems (like "build treehouse"): 3-5 searches
2. What specific product search keywords would help find the best solutions?

Rules for keywords:
- Focus on specific products, tools, software, or solutions needed
- Use terms people would search for when shopping online
- Include brand names or product categories when relevant
- Keep keywords concise (2-4 words each)
- Generate the exact number of keywords as the search count you determined

Examples:
- "laptop running slowly" (3 searches) → "laptop cooling pad, SSD upgrade, antivirus software"
- "want to learn guitar" (2 searches) → "beginner acoustic guitar, guitar learning apps"
- "kitchen faucet leaking" (4 searches) → "kitchen faucet replacement, plumber tape, faucet repair kit, pipe wrench"

Format your response as:
SEARCHES: [number]
KEYWORDS: [keyword1, keyword2, etc.]`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: API_TIMEOUTS.OPENAI
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Parse the AI response
    const searchesMatch = content.match(/SEARCHES:\s*(\d+)/i);
    const keywordsMatch = content.match(/KEYWORDS:\s*(.+)/i);
    
    if (searchesMatch && keywordsMatch) {
      const recommendedSearches = Math.min(5, Math.max(1, parseInt(searchesMatch[1])));
      const keywords = keywordsMatch[1].trim();
      
      console.log(`🤖 AI recommended ${recommendedSearches} searches for: "${problem}"`);
      console.log(`🔍 Generated keywords: ${keywords}`);
      
      return {
        keywords,
        recommendedSearches
      };
    } else {
      // Fallback parsing if format not followed
      console.log('⚠️ AI response format unexpected, using fallback parsing');
      const lines = content.split('\n');
      const keywords = lines.find(line => line.includes(',')) || content;
      const searchCount = Math.min(5, Math.max(1, keywords.split(',').length));
      
      return {
        keywords: keywords.replace(/^[^:]*:?\s*/, '').trim(),
        recommendedSearches: searchCount
      };
    }

  } catch (error) {
    console.error('Error generating keywords:', error);
    // Fallback: extract keywords from problem description
    const fallbackKeywords = problem.split(' ').slice(0, 3).join(' ');
    return {
      keywords: fallbackKeywords,
      recommendedSearches: 2 // Safe default
    };
  }
}

/**
 * Curate and rank products using GPT-4o API
 * @param {string} problem - User's problem description
 * @param {Array} products - Array of products to curate
 * @returns {Promise<Array>} Curated products
 */
async function curateProducts(problem, products) {
  try {
    if (products.length === 0) {
      return [];
    }

    // Group products by search source to ensure diversity
    const productsBySource = {};
    products.forEach(product => {
      const source = product.searchSource || 'unknown';
      if (!productsBySource[source]) {
        productsBySource[source] = [];
      }
      productsBySource[source].push(product);
    });

    // Sample products proportionally from each search category
    const productsToProcess = [];
    const sources = Object.keys(productsBySource);
    const maxPerSource = Math.ceil(20 / sources.length); // Distribute 20 products across sources
    
    console.log(`Sampling products from ${sources.length} search categories:`, sources);
    
    sources.forEach(source => {
      const sourceProducts = productsBySource[source].slice(0, maxPerSource);
      console.log(`- ${source}: taking ${sourceProducts.length} products`);
      productsToProcess.push(...sourceProducts);
    });
    
    console.log(`Total products for curation: ${productsToProcess.length} (from ${products.length} total)`);

    // Limit to 20 products maximum
    const finalProductsToProcess = productsToProcess.slice(0, 20);
    
    const productsList = finalProductsToProcess.map((product, index) => 
      `${index + 1}. ${product.title} - ${product.price} (${product.source}${product.rating ? `, ${product.rating}⭐` : ''}) [from: ${product.searchSource}]`
    ).join('\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        max_tokens: 200,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are an expert product curator. Analyze products and select the best ones for solving the given problem. Consider relevance, price, ratings, and variety.`
          },
          {
            role: 'user',
            content: `Problem: "${problem}"

Products:
${productsList}

Select the ${Math.min(SEARCH_LIMITS.CURATED_PRODUCTS, finalProductsToProcess.length)} most relevant and useful products for this problem.

Rules:
- Choose products that directly solve or help with the problem
- Prefer higher-rated products when available
- Include variety across different product categories [from: xxx]
- Prioritize well-known sources when quality is similar
- Ensure diversity - pick products from different search categories when possible

Respond with only the numbers (1-${finalProductsToProcess.length}) separated by commas.
Example: 1, 3, 5, 7, 9, 12, 15, 18`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: API_TIMEOUTS.OPENAI
      }
    );

    const selectedIds = response.data.choices[0].message.content.trim()
      .split(',')
      .map(id => parseInt(id.trim()) - 1)
      .filter(id => !isNaN(id) && id >= 0 && id < finalProductsToProcess.length);

    const curatedProducts = selectedIds.map(id => finalProductsToProcess[id]);
    
    // Log which categories the curated products come from
    const categoryDistribution = {};
    curatedProducts.forEach(product => {
      const category = product.searchSource || 'unknown';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });
    console.log('Curated products by category:', categoryDistribution);

    return curatedProducts;

  } catch (error) {
    console.error('Error curating products:', error);
    // Fallback: return first 8 products
    return products.slice(0, SEARCH_LIMITS.CURATED_PRODUCTS);
  }
}

/**
 * Generate comprehensive solution with integrated products and alternatives
 * @param {string} problem - User's problem description
 * @param {Array} products - Array of curated products
 * @param {Array} allProducts - All available products for finding alternatives
 * @returns {Promise<object>} Solution with embedded products and alternatives
 */
async function generateComprehensiveSolution(problem, products, allProducts = []) {
  try {
    // Prepare product data with IDs for referencing
    const productData = products.map((product, index) => ({
      id: `[PRODUCT_${index + 1}]`,
      title: product.title,
      price: product.price,
      source: product.source,
      rating: product.rating,
      reviews: product.reviews,
      link: product.link
    }));

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are an expert problem-solving assistant. Create comprehensive, step-by-step solutions that naturally integrate specific product recommendations. Use a friendly, helpful tone and provide actionable advice.'
          },
          {
            role: 'user',
            content: `Problem: "${problem}"

Available Products:
${productData.map(p => `${p.id}: ${p.title} - ${p.price} (${p.source}${p.rating ? `, ${p.rating}⭐` : ''})`).join('\n')}

CRITICAL INSTRUCTIONS:
- Create a comprehensive solution with 3-5 main steps/sections
- ALWAYS use the exact product IDs when referencing products: [PRODUCT_1], [PRODUCT_2], etc.
- NEVER create your own links or markdown for products
- NEVER use product titles or prices directly in links
- Only reference products using their exact IDs like [PRODUCT_1]
- Provide specific techniques, tips, and actionable advice
- Make it feel like getting advice from a knowledgeable friend
- Use clear headings for each section
- Include relevant products where they make sense in the solution flow
- Don't force products into every step - only include where genuinely helpful

CORRECT FORMAT EXAMPLES:
✅ "You can use [PRODUCT_1] for this step"
✅ "I recommend [PRODUCT_2] because it's perfect for this"
✅ "Consider getting [PRODUCT_3] to help with this"

INCORRECT FORMAT EXAMPLES:
❌ "[Product Name - $29.99](https://example.com)"
❌ "the [Product Name](link)"
❌ "Product Name for $29.99"

Format as markdown with:
- ## for main section headings
- **bold** for important points
- Clear, conversational language
- Practical, actionable steps

Solution:`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: API_TIMEOUTS.OPENAI
      }
    );

    const solutionText = response.data.choices[0]?.message?.content?.trim() || '';
    
    if (!solutionText) {
      throw new Error('Empty solution received from AI');
    }
    
    // Parse the solution and replace product IDs with actual product objects
    const solutionWithProducts = parseAndEmbedProducts(solutionText, products);
    
    // Find alternatives for each embedded product using AI
    if (Array.isArray(solutionWithProducts.embeddedProducts) && allProducts.length > 0) {
      console.log('🔍 Finding AI-powered alternatives for embedded products...');
      
      const embeddedWithAlternatives = await Promise.all(
        solutionWithProducts.embeddedProducts.map(async (embeddedProduct) => {
          const alternatives = await findAlternativeProducts(embeddedProduct.product, products, allProducts, problem);
          return {
            ...embeddedProduct,
            alternatives: alternatives
          };
        })
      );
      
      solutionWithProducts.embeddedProducts = embeddedWithAlternatives;
      
      console.log(`✅ Found alternatives for ${embeddedWithAlternatives.length} embedded products`);
    }
    
    // Debug logging
    console.log('Generated solution text preview:', solutionText.substring(0, 300) + '...');
    console.log('Embedded products count:', solutionWithProducts.embeddedProducts?.length || 0);
    console.log('Sample embedded product with alternatives:', {
      ...solutionWithProducts.embeddedProducts?.[0],
      alternatives: solutionWithProducts.embeddedProducts?.[0]?.alternatives?.length || 0
    } || null);
    
    // Ensure the structure is valid
    if (!solutionWithProducts || typeof solutionWithProducts.text !== 'string') {
      throw new Error('Invalid solution structure');
    }
    
    // Ensure embeddedProducts is always an array
    if (!Array.isArray(solutionWithProducts.embeddedProducts)) {
      solutionWithProducts.embeddedProducts = [];
    }
    
    return solutionWithProducts;

  } catch (error) {
    console.error('Error generating comprehensive solution:', error);
    // Fallback: return a simple solution structure with proper format
    return {
      text: `Here's how to solve your problem: "${problem}"\n\nWhile I couldn't generate a detailed solution right now, I've found some helpful products that might assist you. Check out the products below for potential solutions.`,
      embeddedProducts: products.slice(0, 3).map((product, index) => ({
        id: `fallback_${index}_${Date.now()}`,
        productIndex: index,
        product: product,
        context: "This product might help with your problem",
        alternatives: []
      }))
    };
  }
}

/**
 * Find alternative products using AI for a given product
 * @param {object} targetProduct - The product to find alternatives for
 * @param {Array} curatedProducts - Curated products list
 * @param {Array} allProducts - All available products
 * @param {string} problem - Original user problem for context
 * @returns {Promise<Array>} Array of AI-selected alternative products
 */
async function findAlternativeProducts(targetProduct, curatedProducts, allProducts, problem) {
  try {
    // Filter out the target product and already curated products
    const availableProducts = allProducts.filter(product =>
      product.id !== targetProduct.id &&
      !curatedProducts.some(cp => cp.id === product.id)
    );

    if (availableProducts.length === 0) {
      return [];
    }

    // Limit to reasonable number for AI processing (top 30 by rating/relevance)
    const sortedAvailable = availableProducts.sort((a, b) => {
      // Prioritize products with ratings
      if (a.rating && !b.rating) return -1;
      if (!a.rating && b.rating) return 1;
      
      // Higher ratings first
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      
      return 0;
    }).slice(0, 30);

    // Prepare product list for AI
    const productsList = sortedAvailable.map((product, index) => 
      `${index + 1}. ${product.title} - ${product.price} (${product.source}${product.rating ? `, ${product.rating}⭐` : ''}) [Category: ${product.searchSource}]`
    ).join('\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        max_tokens: 150,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are an expert product analyst. Select the best alternative products that can serve as substitutes for a recommended product in solving a specific problem. Focus on functionality, compatibility, and relevance.'
          },
          {
            role: 'user',
            content: `Problem: "${problem}"

Recommended Product: ${targetProduct.title} - ${targetProduct.price} (${targetProduct.source}${targetProduct.rating ? `, ${targetProduct.rating}⭐` : ''})

Available Alternative Products:
${productsList}

Select 2-3 alternative products that would be good substitutes for the recommended product in solving this problem.

Consider:
- Same or similar functionality 
- Compatible with the solution approach
- Different price points or brands for user choice
- Quality and ratings when available
- Avoid products that serve completely different purposes

Respond with only the numbers (1-${sortedAvailable.length}) separated by commas.
Example: 2, 7, 15`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: API_TIMEOUTS.OPENAI
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      console.log('No AI response for alternatives, falling back to algorithmic selection');
      return fallbackAlternativeSelection(targetProduct, availableProducts);
    }

    // Parse AI response
    const selectedIds = aiResponse
      .split(',')
      .map(id => parseInt(id.trim()) - 1)
      .filter(id => !isNaN(id) && id >= 0 && id < sortedAvailable.length);

    const aiSelectedAlternatives = selectedIds.map(id => sortedAvailable[id]);

    console.log(`🤖 AI selected ${aiSelectedAlternatives.length} alternatives for "${targetProduct.title}"`);
    console.log(`   Alternatives: ${aiSelectedAlternatives.map(p => p.title.substring(0, 30) + '...').join(', ')}`);

    return aiSelectedAlternatives;

  } catch (error) {
    console.error('Error finding AI alternatives:', error);
    // Fallback to algorithmic selection
    return fallbackAlternativeSelection(targetProduct, allProducts.filter(product =>
      product.id !== targetProduct.id &&
      !curatedProducts.some(cp => cp.id === product.id)
    ));
  }
}

/**
 * Fallback alternative selection (algorithmic approach)
 * @param {object} targetProduct - The target product
 * @param {Array} availableProducts - Available products to choose from
 * @returns {Array} Array of alternative products
 */
function fallbackAlternativeSelection(targetProduct, availableProducts) {
  try {
    // Get products from the same search source first
    const sameCategory = availableProducts.filter(product => 
      product.searchSource === targetProduct.searchSource
    );

    // If not enough from same category, get from other categories
    const otherProducts = availableProducts.filter(product =>
      product.searchSource !== targetProduct.searchSource
    );

    // Combine and prioritize alternatives
    const potentialAlternatives = [...sameCategory, ...otherProducts];

    // Sort by rating and relevance
    const sortedAlternatives = potentialAlternatives.sort((a, b) => {
      // Prioritize products with ratings
      if (a.rating && !b.rating) return -1;
      if (!a.rating && b.rating) return 1;
      
      // If both have ratings, sort by rating descending
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      
      // Secondary sort by price (lower first)
      const priceA = parseFloat(String(a.price || '0').replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(String(b.price || '0').replace(/[^0-9.]/g, ''));
      
      return priceA - priceB;
    });

    console.log(`⚙️  Fallback selection: ${Math.min(3, sortedAlternatives.length)} alternatives for "${targetProduct.title}"`);

    // Return top 3 alternatives
    return sortedAlternatives.slice(0, 3);

  } catch (error) {
    console.error('Error in fallback alternative selection:', error);
    return [];
  }
}

module.exports = {
  generateSearchKeywords,
  curateProducts,
  generateComprehensiveSolution
}; 