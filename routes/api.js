// Main API Routes - Centralized routing configuration
const express = require('express');
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const router = express.Router();

// Basic API rate limiting
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.',
});

router.use(apiRateLimit);

// Add request ID and correlation ID for tracing
router.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  req.correlationId = req.headers['x-correlation-id'] || req.requestId;
  
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  next();
});

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Users
 *     description: User management operations
 *   - name: Monitoring
 *     description: Metrics, alerts, and system monitoring
 *   - name: Analytics
 *     description: Advanced analytics and data insights
 *   - name: Dashboard
 *     description: Dashboard operations and statistics
 */

// Mount route modules - auth and users removed
router.use('/monitoring', require('./monitoring'));
router.use('/analytics', require('./analytics'));

// Trade/Energy Operations Endpoint
const { electrodeOperationsTotal, electrodeResponseTime } = require('../config/metrics');

router.post('/trade', (req, res) => {
  const startTime = Date.now();
  const { type } = req.body; // 'buy' or 'sell'
  
  try {
    // Validate trade type
    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trade type. Must be "buy" or "sell"',
        requestId: req.requestId,
      });
    }
    
    // Simulate trade operation
    const amount = Math.floor(Math.random() * 50) + 10;
    const price = (0.120 + Math.random() * 0.020).toFixed(3);
    const value = (amount * price).toFixed(2);
    
    // Record metrics
    electrodeOperationsTotal.labels(type, 'success').inc();
    const duration = (Date.now() - startTime) / 1000;
    electrodeResponseTime.labels(type).observe(duration);
    
    logger.info(`Trade executed: ${type} ${amount} tokens at ₹${price}`, {
      requestId: req.requestId,
      tradeType: type,
      amount,
      price,
      value,
    });
    
    res.json({
      success: true,
      message: `${type === 'buy' ? 'Buy' : 'Sell'} order executed successfully`,
      data: {
        type,
        amount,
        pricePerUnit: price,
        totalValue: value,
        timestamp: new Date().toISOString(),
      },
      requestId: req.requestId,
    });
  } catch (error) {
    electrodeOperationsTotal.labels(type, 'error').inc();
    logger.error('Trade execution failed', { error: error.message, requestId: req.requestId });
    res.status(500).json({
      success: false,
      message: 'Trade execution failed',
      requestId: req.requestId,
    });
  }
});

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard Monitoring API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/v1 - API information',
      'GET /api/v1/monitoring/metrics - Get metrics',
      'POST /api/v1/monitoring/metrics - Submit metrics',
      'GET /api/v1/monitoring/alerts/rules - Get alert rules',
      'POST /api/v1/monitoring/alerts/rules - Create alert rule',
      'GET /api/v1/monitoring/alerts/instances - Get alert instances',
      'GET /api/v1/monitoring/system/events - Get system events',
      'GET /api/v1/monitoring/dashboard/stats - Get dashboard stats',
      'GET /api/v1/analytics/performance - Get performance analytics',
      'GET /api/v1/analytics/metrics - Get analytical metrics',
    ],
    documentation: '/api-docs',
  });
});

// Global error handler for API routes
router.use((error, req, res, next) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
    correlationId: req.correlationId,
  });

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    requestId: req.requestId,
    ...(isDevelopment && { 
      stack: error.stack,
      details: error.details,
    }),
  });
});

module.exports = router;
