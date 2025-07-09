const STORE_ENGINES = {
  amazon: 'amazon',
  walmart: 'walmart',
  homedepot: 'home_depot',
  target: 'google_shopping',
  bestbuy: 'google_shopping',
  ebay: 'ebay',
  all: 'google_shopping'
};

const SUPPORTED_LOCATIONS = [
  'United States',
  'Canada', 
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Brazil'
];

const GOOGLE_COUNTRIES = {
  'United States': 'us',
  'Canada': 'ca',
  'United Kingdom': 'uk',
  'Australia': 'au',
  'Germany': 'de',
  'France': 'fr',
  'Japan': 'jp',
  'Brazil': 'br'
};

const AMAZON_DOMAINS = {
  'United States': 'amazon.com',
  'Canada': 'amazon.ca',
  'United Kingdom': 'amazon.co.uk',
  'Australia': 'amazon.com.au',
  'Germany': 'amazon.de',
  'France': 'amazon.fr',
  'Japan': 'amazon.co.jp',
  'Brazil': 'amazon.com.br'
};

const WALMART_DOMAINS = {
  'United States': 'walmart.com',
  'Canada': 'walmart.ca'
};

const EBAY_DOMAINS = {
  'United States': 'ebay.com',
  'Canada': 'ebay.ca',
  'United Kingdom': 'ebay.co.uk',
  'Australia': 'ebay.com.au',
  'Germany': 'ebay.de',
  'France': 'ebay.fr',
  'Japan': 'ebay.co.jp'
};

const TARGET_DOMAINS = {
  'United States': 'target.com'
};

const BESTBUY_DOMAINS = {
  'United States': 'bestbuy.com',
  'Canada': 'bestbuy.ca'
};

const API_TIMEOUTS = {
  OPENAI: 30000,  // Increased to 30 seconds for complex solution generation
  SERPAPI: 30000  // Increased to 30 seconds for thorough product searches
};

const SEARCH_LIMITS = {
  MAX_SEARCHES: 5, // Fallback limit - AI now determines optimal search count (1-5)
  MAX_PRODUCTS: 24,
  CURATED_PRODUCTS: 8
};

module.exports = {
  STORE_ENGINES,
  SUPPORTED_LOCATIONS,
  GOOGLE_COUNTRIES,
  AMAZON_DOMAINS,
  WALMART_DOMAINS,
  EBAY_DOMAINS,
  TARGET_DOMAINS,
  BESTBUY_DOMAINS,
  API_TIMEOUTS,
  SEARCH_LIMITS
}; 