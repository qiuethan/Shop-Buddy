const rateLimit = require('express-rate-limit');

// Create a basic rate limiter for general API endpoints
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max, // Limit each IP to max requests per windowMs
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000) // Retry after in seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests, // Don't count successful requests
    keyGenerator: (req) => {
      // Use IP address and potentially user agent for more sophisticated limiting
      return req.ip + ':' + (req.get('User-Agent') || '');
    },
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000
      });
    }
  });
};

// Different rate limiters for different endpoint types

// General API rate limiter - more permissive for basic endpoints
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again in 15 minutes.'
);

// Strict rate limiter for expensive operations (AI/search)
const searchLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // limit each IP to 20 searches per 15 minutes
  'Too many search requests. Please wait before making more searches.',
  true // Don't count failed requests against the limit
);

// Very strict rate limiter for potential abuse endpoints
const strictLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 requests per hour
  'This endpoint is rate limited. Please try again later.'
);

// Quick burst limiter for preventing spam
const burstLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 requests per minute
  'Too many requests in a short time. Please slow down.'
);

// Health check limiter - more permissive
const healthLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // 30 health checks per minute should be plenty
  'Too many health check requests.'
);

module.exports = {
  generalLimiter,
  searchLimiter,
  strictLimiter,
  burstLimiter,
  healthLimiter,
  createRateLimiter
}; 