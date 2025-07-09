// Example problems for the search form
export const EXAMPLE_PROBLEMS = [
  "my laptop is running slowly",
  "my kitchen faucet is leaking", 
  "I need to organize my closet",
  "my car makes a weird noise",
  "I want to learn guitar"
];

// Available stores with metadata
export const AVAILABLE_STORES = [
  { id: 'all', name: 'All Stores', icon: '🛒' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'walmart', name: 'Walmart', icon: '🏪' },
  { id: 'homedepot', name: 'Home Depot', icon: '🔨' }
];

// Available locations
export const AVAILABLE_LOCATIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia', 
  'Germany',
  'France',
  'Japan',
  'Brazil'
];

// API endpoints
export const API_ENDPOINTS = {
  FIND_SOLUTIONS: '/find-solutions',
  HEALTH: '/health',
  STORES: '/stores',
  LOCATIONS: '/locations'
};

// Loading states
export const LOADING_MESSAGES = {
  FINDING_SOLUTIONS: 'Finding Solutions...',
  GENERATING_KEYWORDS: 'Generating Keywords...',
  SEARCHING_PRODUCTS: 'Searching Products...',
  CREATING_SOLUTION: 'Creating Solution...'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
}; 