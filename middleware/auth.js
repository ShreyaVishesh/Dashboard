// No-op authentication middleware (authentication removed)
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// No-op authentication middleware - just pass through
const authenticate = (req, res, next) => {
  // Add mock user for compatibility with existing code
  req.user = {
    id: 'system',
    username: 'system',
    role: 'admin',
    email: 'system@localhost'
  };
  next();
};

// No-op API key authentication middleware - just pass through
const authenticateApiKey = (req, res, next) => {
  req.user = {
    id: 'system',
    username: 'system',
    role: 'admin',
    email: 'system@localhost'
  };
  req.authMethod = 'api_key';
  next();
};

// No-op authorization middleware - just pass through
const authorize = (resource, action = 'read') => {
  return (req, res, next) => {
    next();
  };
};

// No-op role requirement middleware - just pass through
const requireRole = (roles) => {
  return (req, res, next) => {
    next();
  };
};

// No-op optional authentication - just pass through
const optionalAuth = (req, res, next) => {
  req.user = {
    id: 'system',
    username: 'system',
    role: 'admin',
    email: 'system@localhost'
  };
  next();
};

// General rate limiting (keep this for basic security)
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 API requests per windowMs
  message: {
    success: false,
    message: 'API rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiting (legacy, now just general limiting)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticate,
  authenticateApiKey,
  authorize,
  requireRole,
  optionalAuth,
  generalRateLimit,
  apiRateLimit,
  authRateLimit,
};
