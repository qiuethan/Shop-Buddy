const express = require('express');
const { findSolutions, validateSolutionRequest, getHealthCheck } = require('../services/solution.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { burstLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', asyncHandler(async (req, res) => {
  const healthCheck = getHealthCheck();
  res.json(healthCheck);
}));

/**
 * Find solutions endpoint
 * POST /api/find-solutions
 * Rate limited by searchLimiter in main app
 */
router.post('/find-solutions', asyncHandler(async (req, res) => {
  // Additional security validation
  const contentType = req.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({
      error: 'Invalid Content-Type',
      message: 'Content-Type must be application/json'
    });
  }

  // Validate request
  const validation = validateSolutionRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }

  const { problem, stores = ['all'], maxPrice = '', location = 'United States' } = req.body;

  // Log search request for monitoring
  console.log(`🔍 Search request from IP: ${req.ip} - Problem: "${problem.substring(0, 50)}..." - Stores: [${stores.join(', ')}]`);

  // Find solutions
  const result = await findSolutions(problem, stores, maxPrice, location);

  res.json(result);
}));

/**
 * Get supported stores endpoint
 * GET /api/stores
 * Updated to match client-side configuration (removed eBay, Best Buy, Target)
 */
router.get('/stores', burstLimiter, asyncHandler(async (req, res) => {
  const stores = [
    { id: 'all', name: 'All Stores', icon: '🛒', description: 'Search across all available stores' },
    { id: 'amazon', name: 'Amazon', icon: '📦', description: 'World\'s largest online marketplace' },
    { id: 'walmart', name: 'Walmart', icon: '🏪', description: 'America\'s largest retailer' },
    { id: 'homedepot', name: 'Home Depot', icon: '🔨', description: 'Home improvement and tools' }
  ];

  res.json({ 
    stores,
    timestamp: new Date().toISOString(),
    count: stores.length
  });
}));

/**
 * Get supported locations endpoint
 * GET /api/locations
 */
router.get('/locations', burstLimiter, asyncHandler(async (req, res) => {
  const { SUPPORTED_LOCATIONS } = require('../utils/constants');
  
  res.json({ 
    locations: SUPPORTED_LOCATIONS.map(location => ({
      name: location,
      code: location.toLowerCase().replace(/\s+/g, '_')
    })),
    timestamp: new Date().toISOString(),
    count: SUPPORTED_LOCATIONS.length
  });
}));

module.exports = router; 