const helmet = require('helmet');

// Enhanced security middleware configuration
const securityMiddleware = () => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images from stores
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.openai.com", "https://serpapi.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Disable for API compatibility

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: "same-origin" },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frameguard (X-Frame-Options)
    frameguard: { action: 'deny' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // IE No Open
    ieNoOpen: true,

    // Don't Sniff Mimetype
    noSniff: true,

    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: false,

    // Referrer Policy
    referrerPolicy: { policy: "no-referrer" },

    // X-XSS-Protection
    xssFilter: true,
  });
};

// Request validation middleware
const validateRequest = (req, res, next) => {
  // Basic request size validation
  const contentLength = parseInt(req.get('Content-Length')) || 0;
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request size exceeds maximum allowed limit'
    });
  }

  // Validate required headers for POST requests
  if (req.method === 'POST' && !req.get('Content-Type')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Content-Type header is required for POST requests'
    });
  }

  next();
};

// IP whitelist middleware (for admin endpoints if needed)
const createIPWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No restrictions if no IPs specified
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn(`Access denied for IP: ${clientIP}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address'
      });
    }

    next();
  };
};

// Request logging with security context
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'None';

  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - Origin: ${origin} - UA: ${userAgent}`);

  // Log suspicious activity
  if (req.url.includes('..') || req.url.includes('<script>')) {
    console.warn(`🚨 Suspicious request detected from IP: ${ip} - URL: ${req.url}`);
  }

  next();
};

// API key validation middleware (if implementing API keys)
const validateAPIKey = (req, res, next) => {
  // Skip API key validation in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const apiKey = req.get('X-API-Key') || req.query.apiKey;
  const validAPIKeys = process.env.VALID_API_KEYS ? 
    process.env.VALID_API_KEYS.split(',') : [];

  // If no API keys are configured, skip validation
  if (validAPIKeys.length === 0) {
    return next();
  }

  if (!apiKey || !validAPIKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  next();
};

module.exports = {
  securityMiddleware,
  validateRequest,
  createIPWhitelist,
  securityLogger,
  validateAPIKey
}; 