const logger = require('../config/logger');
const { errorCounter } = require('../config/metrics');

// Custom error classes
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Application error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  // Increment error counter
  errorCounter.labels(error.name || 'UnknownError', req.path || 'unknown').inc();

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError' || error.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Bad Request';
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(statusCode).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res) => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return;
  }

  const message = `Route ${req.method} ${req.originalUrl} not found`;
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: {
      message,
      statusCode: 404,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
};
