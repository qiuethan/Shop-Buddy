/**
 * Error handler middleware for Express
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      status: 400,
      details: err.message
    };
  } else if (err.code === 'ECONNABORTED') {
    error = {
      message: 'Request timeout',
      status: 408,
      details: 'The request took too long to complete'
    };
  } else if (err.response && err.response.status) {
    // Axios error with response
    error = {
      message: 'External API Error',
      status: err.response.status,
      details: err.response.data?.message || err.message
    };
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    error = {
      message: 'Network Error',
      status: 503,
      details: 'Unable to connect to external service'
    };
  } else if (err.message) {
    error = {
      message: err.message,
      status: err.status || 500
    };
  }

  res.status(error.status).json({
    error: error.message,
    details: error.details,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 handler middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async error wrapper for route handlers
 * @param {function} fn - Async route handler function
 * @returns {function} Wrapped function that catches async errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 