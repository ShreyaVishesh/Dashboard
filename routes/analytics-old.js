/**
 * Advanced Analytics API Routes
 * Provides advanced metrics analytics, aggregations, and insights
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const logger = require('../config/logger');

const router = express.Router();

/**
 * @swagger
 * /api/v1/analytics/metrics/aggregate:
 *   get:
 *     summary: Get aggregated metrics data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: metric
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric name to aggregate
 *       - name: interval
 *         in: query
 *         schema:
 *           type: string
 *           enum: [1m, 5m, 15m, 1h, 6h, 24h]
 *           default: 5m
 *         description: Aggregation interval
 *       - name: aggregation
 *         in: query
 *         schema:
 *           type: string
 *           enum: [avg, sum, min, max, count]
 *           default: avg
 *         description: Aggregation function
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time (ISO string)
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time (ISO string)
 *     responses:
 *       200:
 *         description: Aggregated metrics data
 */
router.get('/metrics/aggregate',
  [
    query('metric').notEmpty().withMessage('Metric name is required'),
    query('interval').optional().isIn(['1m', '5m', '15m', '1h', '6h', '24h']),
    query('aggregation').optional().isIn(['avg', 'sum', 'min', 'max', 'count']),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const {
        metric,
        interval = '5m',
        aggregation = 'avg',
        from,
        to
      } = req.query;

      // Return mock aggregated data
      const mockData = {
        dataPoints: [
          { timestamp: new Date(Date.now() - 300000), value: Math.random() * 100 },
          { timestamp: new Date(Date.now() - 240000), value: Math.random() * 100 },
          { timestamp: new Date(Date.now() - 180000), value: Math.random() * 100 },
          { timestamp: new Date(Date.now() - 120000), value: Math.random() * 100 },
          { timestamp: new Date(Date.now() - 60000), value: Math.random() * 100 },
          { timestamp: new Date(), value: Math.random() * 100 }
        ],
        summary: {
          avg: 75.5,
          min: 45.2,
          max: 95.8,
          count: 6
        }
      };

      res.json({
        success: true,
        data: mockData,
        options: {
          metric,
          interval,
          aggregation,
          timeRange: {
            from: from ? new Date(from) : new Date(Date.now() - 3600000),
            to: to ? new Date(to) : new Date()
          }
        }
      });

    } catch (error) {
      logger.error('Error aggregating metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to aggregate metrics'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/analytics/metrics/stats:
 *   get:
 *     summary: Get comprehensive metrics statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timeWindow
 *         in: query
 *         schema:
 *           type: string
 *           default: 1h
 *         description: Time window for statistics
 *       - name: services
 *         in: query
 *         schema:
 *           type: string
 *         description: Comma-separated list of services to include
 *       - name: instances
 *         in: query
 *         schema:
 *           type: string
 *         description: Comma-separated list of instances to include
 *     responses:
 *       200:
 *         description: Metrics statistics
 */
router.get('/metrics/stats', async (req, res) => {
    try {
      const {
        timeWindow = '1h',
        services,
        instances
      } = req.query;

      // Return mock statistics data
      const mockStats = {
        overview: {
          totalRequests: Math.floor(Math.random() * 10000),
          avgResponseTime: Math.random() * 500,
          errorRate: Math.random() * 0.05,
          throughput: Math.random() * 100
        },
        services: services ? services.split(',').map(service => ({
          name: service.trim(),
          status: 'healthy',
          requestCount: Math.floor(Math.random() * 1000),
          avgResponseTime: Math.random() * 200,
          errorRate: Math.random() * 0.02
        })) : [
          {
            name: 'api-service',
            status: 'healthy',
            requestCount: 2847,
            avgResponseTime: 156,
            errorRate: 0.012
          },
          {
            name: 'monitoring-service',
            status: 'healthy',  
            requestCount: 1523,
            avgResponseTime: 89,
            errorRate: 0.008
          }
        ],
        timeWindow
      };

      res.json({
        success: true,
        data: mockStats
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error getting metrics stats:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to get metrics statistics'
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/analytics/metrics/percentiles:
 *   get:
 *     summary: Calculate metric percentiles
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: metric
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric name
 *       - name: percentiles
 *         in: query
 *         schema:
 *           type: string
 *           default: "50,90,95,99"
 *         description: Comma-separated percentiles to calculate
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time (ISO string)
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time (ISO string)
 *     responses:
 *       200:
 *         description: Calculated percentiles
 */
router.get('/metrics/percentiles',
  authenticate,
  authorize('metrics', 'read'),
  [
    query('metric').notEmpty().withMessage('Metric name is required'),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601()
  ],
  async (req, res) => {
    return createCustomSpan('api.analytics.percentiles', async (span) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array()
          });
        }

        const {
          metric,
          percentiles = '50,90,95,99',
          from,
          to
        } = req.query;

        const options = {
          percentiles: percentiles.split(',').map(p => parseInt(p.trim()))
        };

        if (from) options.from = new Date(from);
        if (to) options.to = new Date(to);

        span.setAttributes({
          'analytics.metric': metric,
          'analytics.percentiles': percentiles
        });

        const result = await MetricsService.calculatePercentiles(metric, options);

        res.json({
          success: true,
          data: result
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error calculating percentiles:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to calculate percentiles'
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/analytics/alerts/stats:
 *   get:
 *     summary: Get alert statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timeWindow
 *         in: query
 *         schema:
 *           type: string
 *           default: 24h
 *         description: Time window for statistics
 *       - name: severity
 *         in: query
 *         schema:
 *           type: string
 *           enum: [critical, warning, info]
 *         description: Filter by severity
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [firing, pending, resolved]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Alert statistics
 */
router.get('/alerts/stats',
  authenticate,
  authorize('alerts', 'read'),
  async (req, res) => {
    return createCustomSpan('api.analytics.alert_stats', async (span) => {
      try {
        const {
          timeWindow = '24h',
          severity,
          status
        } = req.query;

        const options = { timeWindow };
        if (severity) options.severity = severity;
        if (status) options.status = status;

        const stats = await AlertService.getAlertStats(options);

        res.json({
          success: true,
          data: stats
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error getting alert stats:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to get alert statistics'
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/analytics/alerts/test-rule:
 *   post:
 *     summary: Test alert rule against historical data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rule:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   query:
 *                     type: string
 *                   condition:
 *                     type: string
 *                     enum: [gt, gte, lt, lte, eq, ne]
 *                   threshold:
 *                     type: number
 *                   duration:
 *                     type: string
 *               options:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     format: date-time
 *                   to:
 *                     type: string
 *                     format: date-time
 *                   interval:
 *                     type: string
 *                     default: 5m
 *     responses:
 *       200:
 *         description: Rule test results
 */
router.post('/alerts/test-rule',
  authenticate,
  authorize('alerts', 'write'),
  async (req, res) => {
    return createCustomSpan('api.analytics.test_rule', async (span) => {
      try {
        const { rule, options = {} } = req.body;

        if (!rule || !rule.name || !rule.query || !rule.condition || typeof rule.threshold !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Invalid rule specification'
          });
        }

        span.setAttributes({
          'analytics.rule_name': rule.name,
          'analytics.rule_query': rule.query
        });

        const testResults = await AlertService.testRule(rule, options);

        res.json({
          success: true,
          data: testResults
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error testing alert rule:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to test alert rule'
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/analytics/system/health:
 *   get:
 *     summary: Get comprehensive system health metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health data
 */
router.get('/system/health',
  authenticate,
  authorize('system', 'read'),
  async (req, res) => {
    return createCustomSpan('api.analytics.system_health', async (span) => {
      try {
        const healthData = {
          timestamp: new Date(),
          services: {
            database: await checkDatabaseHealth(),
            metrics: await checkMetricsHealth(),
            alerts: await checkAlertsHealth()
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            version: process.version,
            platform: process.platform
          }
        };

        // Calculate overall health status
        const serviceStatuses = Object.values(healthData.services);
        const overallHealth = serviceStatuses.every(s => s.status === 'healthy') ? 'healthy' : 
                            serviceStatuses.some(s => s.status === 'unhealthy') ? 'unhealthy' : 'degraded';

        healthData.overall = {
          status: overallHealth,
          score: calculateHealthScore(serviceStatuses)
        };

        res.json({
          success: true,
          data: healthData
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error getting system health:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to get system health'
        });
      }
    });
  }
);

// Helper functions
async function checkDatabaseHealth() {
  try {
    const mongoose = require('mongoose');
    const start = Date.now();
    
    await mongoose.connection.db.admin().ping();
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkMetricsHealth() {
  try {
    const { Metric } = require('../models/Monitoring');
    const start = Date.now();
    
    const recentMetrics = await Metric.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });
    
    const responseTime = Date.now() - start;
    
    return {
      status: recentMetrics > 0 ? 'healthy' : 'degraded',
      responseTime,
      recentMetricsCount: recentMetrics
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkAlertsHealth() {
  try {
    const { AlertInstance } = require('../models/Monitoring');
    const start = Date.now();
    
    const firingAlerts = await AlertInstance.countDocuments({
      status: 'firing'
    });
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      firingAlertsCount: firingAlerts
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

function calculateHealthScore(serviceStatuses) {
  const weights = { healthy: 100, degraded: 50, unhealthy: 0 };
  const totalWeight = serviceStatuses.reduce((sum, service) => {
    return sum + (weights[service.status] || 0);
  }, 0);
  
  return Math.round(totalWeight / serviceStatuses.length);
}

module.exports = router;
