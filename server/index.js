const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const corsOptions = require('./config/cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { 
  securityMiddleware, 
  validateRequest, 
  securityLogger 
} = require('./middleware/security');
const { 
  generalLimiter, 
  searchLimiter, 
  healthLimiter 
} = require('./middleware/rateLimiter');

// Import routes
const solutionRoutes = require('./routes/solutions');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for getting real IP addresses behind proxies)
app.set('trust proxy', 1);

// Security middleware (must be early in the stack)
app.use(securityMiddleware());

// CORS middleware
app.use(cors(corsOptions));

// Request logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(securityLogger);
} else {
  // In production, use basic logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
  });
}

// Rate limiting middleware
app.use('/api/health', healthLimiter); // Specific rate limit for health checks
app.use('/api/find-solutions', searchLimiter); // Strict limit for expensive search operations
app.use('/api', generalLimiter); // General rate limit for all other API endpoints

// Request validation and parsing middleware
app.use(validateRequest);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', solutionRoutes);

// Root endpoint with rate limiting
app.get('/', generalLimiter, (req, res) => {
  res.json({
    message: 'Shop Buddy API Server',
    version: '2.0.0',
    status: 'running',
    security: {
      rateLimit: true,
      cors: true,
      helmet: true
    },
    endpoints: {
      health: '/api/health',
      findSolutions: 'POST /api/find-solutions',
      stores: '/api/stores',
      locations: '/api/locations'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shop Buddy API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Security status
  console.log('🔒 Security features enabled:');
  console.log('   ✅ Rate limiting active');
  console.log('   ✅ CORS protection active');
  console.log('   ✅ Helmet security headers active');
  console.log('   ✅ Request validation active');
  
  // Check environment variables
  const requiredEnvVars = ['OPENAI_API_KEY', 'SERPAPI_KEY'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.log('✅ All required environment variables are set');
  }
}); 