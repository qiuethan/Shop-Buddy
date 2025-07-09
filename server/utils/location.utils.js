const {
  GOOGLE_COUNTRIES,
  AMAZON_DOMAINS,
  WALMART_DOMAINS,
  EBAY_DOMAINS,
  TARGET_DOMAINS,
  BESTBUY_DOMAINS
} = require('./constants');

/**
 * Get Amazon domain for the given location
 * @param {string} location - Location name
 * @returns {string} Amazon domain
 */
function getAmazonCountryCode(location) {
  return AMAZON_DOMAINS[location] || 'amazon.com';
}

/**
 * Get Target domain for the given location
 * @param {string} location - Location name
 * @returns {string} Target domain
 */
function getTargetDomain(location) {
  return TARGET_DOMAINS[location] || 'target.com';
}

/**
 * Get Best Buy domain for the given location
 * @param {string} location - Location name
 * @returns {string} Best Buy domain
 */
function getBestBuyDomain(location) {
  return BESTBUY_DOMAINS[location] || 'bestbuy.com';
}

/**
 * Get eBay domain for the given location
 * @param {string} location - Location name
 * @returns {string} eBay domain
 */
function getEbayDomain(location) {
  return EBAY_DOMAINS[location] || 'ebay.com';
}

/**
 * Get Walmart domain for the given location
 * @param {string} location - Location name
 * @returns {string} Walmart domain
 */
function getWalmartDomain(location) {
  return WALMART_DOMAINS[location] || 'walmart.com';
}

/**
 * Get language restriction for the given location
 * @param {string} location - Location name
 * @returns {string} Language code
 */
function getLanguageRestriction(location) {
  const languageMap = {
    'United States': 'lang_en',
    'Canada': 'lang_en|lang_fr',
    'United Kingdom': 'lang_en',
    'Australia': 'lang_en',
    'Germany': 'lang_de',
    'France': 'lang_fr',
    'Japan': 'lang_ja',
    'Brazil': 'lang_pt'
  };
  
  return languageMap[location] || 'lang_en';
}

/**
 * Get country restriction for the given location
 * @param {string} location - Location name
 * @returns {string} Country code
 */
function getCountryRestriction(location) {
  return GOOGLE_COUNTRIES[location] || 'us';
}

/**
 * Get advanced filters based on max price and location
 * @param {string} maxPrice - Maximum price filter
 * @param {string} location - Location name
 * @returns {object} Advanced filter parameters
 */
function getAdvancedFilters(maxPrice, location) {
  const filters = {
    gl: getCountryRestriction(location),
    hl: getLanguageRestriction(location).split('|')[0].replace('lang_', ''),
    google_domain: `google.${GOOGLE_COUNTRIES[location] === 'uk' ? 'co.uk' : 'com'}`,
    safe: 'active',
    filter: '1',
    nfpr: '1'
  };

  // Add recent results filter
  filters.tbs = 'qdr:y'; // Results from the past year

  // Add price filter if specified
  if (maxPrice && maxPrice.trim()) {
    const priceNum = parseFloat(maxPrice.replace(/[^0-9.]/g, ''));
    if (!isNaN(priceNum)) {
      filters.tbs = filters.tbs ? `${filters.tbs},p_ord:p,price:1,ppr_max:${priceNum}` : `p_ord:p,price:1,ppr_max:${priceNum}`;
    }
  }

  return filters;
}

module.exports = {
  getAmazonCountryCode,
  getTargetDomain,
  getBestBuyDomain,
  getEbayDomain,
  getWalmartDomain,
  getLanguageRestriction,
  getCountryRestriction,
  getAdvancedFilters
}; 