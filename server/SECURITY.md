# Security Features

This document outlines the security measures implemented in the Shop Buddy API server.

## 🔒 Security Features Implemented

### 1. Rate Limiting
- **General API Endpoints**: 100 requests per 15 minutes per IP
- **Search Endpoints**: 20 requests per 15 minutes per IP (expensive AI operations)
- **Health Checks**: 30 requests per minute per IP
- **Burst Protection**: 10 requests per minute per IP for rapid requests

### 2. CORS Protection
- **Configurable Origins**: Supports multiple allowed origins for development and production
- **Development Mode**: More permissive in development environment
- **Production Mode**: Strict origin validation in production
- **Headers Control**: Specific allowed headers and methods
- **Credentials Support**: Secure cookie and authorization header handling

### 3. Helmet Security Headers
- **Content Security Policy**: Prevents XSS attacks
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer information
- **Hidden Server Info**: Removes Express server identification

### 4. Request Validation
- **Size Limits**: 10MB maximum request size
- **Content-Type Validation**: Enforces proper content types for POST requests
- **Header Validation**: Validates required headers

### 5. Logging and Monitoring
- **Security Logging**: Detailed request logging with IP, User-Agent, and Origin
- **Suspicious Activity Detection**: Logs potential security threats
- **Rate Limit Violations**: Warns about rate limit violations

## 🛡️ Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_key_here
SERPAPI_KEY=your_key_here

# Security (Optional)
CLIENT_URL=http://localhost:3000          # Allowed origin for CORS
FRONTEND_URL=http://localhost:3000        # Alternative origin name
VALID_API_KEYS=key1,key2,key3            # API keys for production (optional)
NODE_ENV=development                      # Environment mode
```

### Rate Limit Configuration

The rate limiters can be customized by modifying `server/middleware/rateLimiter.js`:

```javascript
// Example: Stricter search limits
const searchLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,             // Only 10 searches per 15 minutes
  'Search rate limit exceeded'
);
```

## 🚨 Security Monitoring

### Logged Events
- All API requests with IP, timestamp, and origin
- Rate limit violations
- Suspicious URL patterns (path traversal, script injection attempts)
- CORS violations
- Invalid content type attempts

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

## 🔧 Customizing Security

### Adding IP Whitelist
```javascript
const { createIPWhitelist } = require('./middleware/security');
const adminIPs = ['192.168.1.100', '10.0.0.5'];
app.use('/admin', createIPWhitelist(adminIPs));
```

### Custom Rate Limits
```javascript
const customLimiter = createRateLimiter(
  60 * 1000,  // 1 minute window
  5,          // 5 requests max
  'Custom endpoint rate limited'
);
app.use('/special-endpoint', customLimiter);
```

### API Key Protection
Enable API key validation by setting the `VALID_API_KEYS` environment variable:
```bash
VALID_API_KEYS=abc123,def456,ghi789
```

Clients must include the API key in requests:
```javascript
// Header method
fetch('/api/find-solutions', {
  headers: {
    'X-API-Key': 'abc123',
    'Content-Type': 'application/json'
  }
});

// Query parameter method
fetch('/api/find-solutions?apiKey=abc123');
```

## 🚀 Production Deployment

### Recommended Settings
```bash
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
VALID_API_KEYS=your-production-api-keys
TRUST_PROXY=1  # If behind a load balancer
```

### Additional Recommendations
1. Use HTTPS in production
2. Set up proper logging aggregation
3. Monitor rate limit violations
4. Regularly rotate API keys
5. Implement proper database security
6. Use environment-specific configurations
7. Set up health monitoring alerts

## 📊 Security Testing

Test the security features:

```bash
# Test rate limiting
for i in {1..25}; do curl http://localhost:5000/api/health; done

# Test CORS
curl -H "Origin: http://malicious-site.com" http://localhost:5000/api/health

# Test invalid content type
curl -X POST http://localhost:5000/api/find-solutions \
  -H "Content-Type: text/plain" \
  -d "invalid data"
```

## 🔄 Updates and Maintenance

- Regularly update dependencies for security patches
- Monitor rate limit effectiveness and adjust as needed
- Review CORS origins periodically
- Audit API key usage and rotate keys
- Check security headers with tools like [Security Headers](https://securityheaders.com/) 