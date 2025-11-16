const { body, query, param, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

// Validation middleware factory
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    throw new ValidationError('Validation failed', 400, errorMessages);
  };
};

// Common validation rules
const validationRules = {
  // ID validation
  id: param('id').isMongoId().withMessage('Invalid ID format'),
  
  // Pagination
  page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  // Search
  search: query('search').optional().isLength({ min: 1, max: 100 }).trim().escape(),
  
  // Date ranges
  startDate: query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  endDate: query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  
  // Electrode specific validations
  electrodeId: body('electrodeId').isString().isLength({ min: 1, max: 50 }).withMessage('Electrode ID is required'),
  voltage: body('voltage').isNumeric().withMessage('Voltage must be a number'),
  current: body('current').isNumeric().withMessage('Current must be a number'),
  temperature: body('temperature').optional().isNumeric().withMessage('Temperature must be a number'),
  
  // File upload
  fileType: body('fileType').optional().isIn(['image', 'video', 'document']).withMessage('Invalid file type'),
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  Object.keys(req.query).forEach(key => {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].trim();
    }
  });

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

// Request size validation
const validateRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length'));
    const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxSizeBytes) {
      throw new ValidationError(`Request body too large. Maximum size is ${maxSize}`);
    }
    next();
  };
};

module.exports = {
  validate,
  validationRules,
  sanitizeInput,
  validateRequestSize,
};
