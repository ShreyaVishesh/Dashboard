// Simplified monitoring routes without auth
const express = require('express');
const logger = require('../config/logger');

const router = express.Router();

// Simple metrics endpoint (returns mock data for now)
router.get('/metrics', async (req, res) => {
  try {
    const mockMetrics = {
      success: true,
      data: {
        http_requests_total: 1500,
        http_request_duration_seconds: 0.25,
        memory_usage_bytes: 128000000,
        cpu_usage_percent: 15.5,
        active_connections: 12
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(mockMetrics);
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

// Simple alerts endpoint
router.get('/alerts/rules', async (req, res) => {
  try {
    const mockAlerts = {
      success: true,
      data: [
        {
          id: '1',
          name: 'High CPU Usage',
          condition: 'cpu_usage > 80%',
          severity: 'warning',
          enabled: true
        },
        {
          id: '2',
          name: 'Service Down',
          condition: 'http_requests_total == 0',
          severity: 'critical',
          enabled: true
        }
      ]
    };
    
    res.json(mockAlerts);
  } catch (error) {
    logger.error('Error fetching alert rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert rules'
    });
  }
});

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = {
      success: true,
      data: {
        alerts: {
          active: 2,
          resolved: 5
        },
        services: {
          total: 4,
          healthy: 3,
          unhealthy: 1
        },
        metrics: {
          collected_last_hour: 3600,
          rate_per_minute: 60
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    };
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;
 *   schemas:
 *     Metric:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [counter, gauge, histogram, summary]
 *         value:
 *           type: number
 *         labels:
 *           type: object
 *         source:
 *           type: object
 *           properties:
 *             service:
 *               type: string
 *             instance:
 *               type: string
 *             host:
 *               type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/monitoring/metrics:
 *   get:
 *     summary: Get metrics data
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: Metric name filter
 *       - name: service
 *         in: query
 *         schema:
 *           type: string
 *         description: Service name filter
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of results
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get('/metrics', 
  authenticate,
  authorize('metrics', 'read'),
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('from').optional().isISO8601().withMessage('From must be a valid ISO 8601 date'),
    query('to').optional().isISO8601().withMessage('To must be a valid ISO 8601 date'),
  ],
  async (req, res) => {
    return createCustomSpan('monitoring:get_metrics', async (span) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const {
          name,
          service,
          from,
          to,
          limit = 100,
          page = 1,
        } = req.query;

        // Build query
        const query = {};
        
        if (name) {
          query.name = name;
        }
        
        if (service) {
          query['source.service'] = service;
        }

        // Time range filter
        if (from || to) {
          query.timestamp = {};
          if (from) query.timestamp.$gte = new Date(from);
          if (to) query.timestamp.$lte = new Date(to);
        }

        span.setAttributes({
          'monitoring.query.name': name || 'all',
          'monitoring.query.service': service || 'all',
          'monitoring.query.limit': parseInt(limit),
        });

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [metrics, totalCount] = await Promise.all([
          Metric.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean(),
          Metric.countDocuments(query)
        ]);

        res.json({
          success: true,
          data: metrics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error fetching metrics:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch metrics',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/metrics:
 *   post:
 *     summary: Submit new metric data
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Metric'
 *     responses:
 *       201:
 *         description: Metrics submitted successfully
 */
router.post('/metrics',
  authenticate,
  authorize('metrics', 'write'),
  [
    body('*.name').notEmpty().withMessage('Metric name is required'),
    body('*.type').isIn(['counter', 'gauge', 'histogram', 'summary']).withMessage('Invalid metric type'),
    body('*.value').isNumeric().withMessage('Metric value must be numeric'),
    body('*.source.service').notEmpty().withMessage('Service name is required'),
    body('*.source.instance').notEmpty().withMessage('Instance name is required'),
    body('*.source.host').notEmpty().withMessage('Host name is required'),
  ],
  async (req, res) => {
    return createCustomSpan('monitoring:submit_metrics', async (span) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const metricsData = Array.isArray(req.body) ? req.body : [req.body];

        span.setAttributes({
          'monitoring.metrics_count': metricsData.length,
        });

        // Process and save metrics
        const processedMetrics = metricsData.map(metric => ({
          ...metric,
          timestamp: metric.timestamp ? new Date(metric.timestamp) : new Date(),
        }));

        const savedMetrics = await Metric.insertMany(processedMetrics);

        // Log metric submission
        await SystemEvent.create({
          type: 'api_key_used', // This would be more specific in real implementation
          severity: 'info',
          actor: {
            type: 'user',
            id: req.user._id.toString(),
            name: req.user.username,
          },
          message: `${metricsData.length} metrics submitted`,
          details: {
            metricsCount: metricsData.length,
            services: [...new Set(metricsData.map(m => m.source.service))],
          },
          correlationId: req.correlationId,
        });

        res.status(201).json({
          success: true,
          message: 'Metrics submitted successfully',
          data: {
            processed: savedMetrics.length,
            metrics: savedMetrics,
          },
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error submitting metrics:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit metrics',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/alerts/rules:
 *   get:
 *     summary: Get alert rules
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert rules retrieved successfully
 */
router.get('/alerts/rules',
  authenticate,
  authorize('alerts', 'read'),
  async (req, res) => {
    return createCustomSpan('monitoring:get_alert_rules', async (span) => {
      try {
        const { enabled, severity } = req.query;

        const query = {};
        if (enabled !== undefined) {
          query.isEnabled = enabled === 'true';
        }
        if (severity) {
          query.severity = severity;
        }

        const alertRules = await AlertRule.find(query)
          .populate('createdBy', 'username email')
          .populate('updatedBy', 'username email')
          .sort({ createdAt: -1 });

        span.setAttributes({
          'monitoring.alert_rules_count': alertRules.length,
        });

        res.json({
          success: true,
          data: alertRules,
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error fetching alert rules:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch alert rules',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/alerts/rules:
 *   post:
 *     summary: Create new alert rule
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Alert rule created successfully
 */
router.post('/alerts/rules',
  authenticate,
  authorize('alerts', 'write'),
  [
    body('name').notEmpty().withMessage('Rule name is required'),
    body('query.metric').notEmpty().withMessage('Metric name is required'),
    body('query.timeWindow').matches(/^[0-9]+[smhd]$/).withMessage('Invalid time window format'),
    body('condition.operator').isIn(['>', '<', '>=', '<=', '==', '!=']).withMessage('Invalid operator'),
    body('condition.threshold').isNumeric().withMessage('Threshold must be numeric'),
    body('severity').isIn(['critical', 'warning', 'info']).withMessage('Invalid severity'),
  ],
  async (req, res) => {
    return createCustomSpan('monitoring:create_alert_rule', async (span) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const alertRule = new AlertRule({
          ...req.body,
          createdBy: req.user._id,
        });

        await alertRule.save();

        span.setAttributes({
          'monitoring.alert_rule_id': alertRule._id.toString(),
          'monitoring.alert_rule_name': alertRule.name,
          'monitoring.alert_rule_severity': alertRule.severity,
        });

        // Log alert rule creation
        await SystemEvent.create({
          type: 'alert_created',
          severity: 'info',
          actor: {
            type: 'user',
            id: req.user._id.toString(),
            name: req.user.username,
          },
          target: {
            type: 'alert',
            resource: 'alert_rule',
            id: alertRule._id.toString(),
            name: alertRule.name,
          },
          message: `Alert rule '${alertRule.name}' created`,
          correlationId: req.correlationId,
        });

        res.status(201).json({
          success: true,
          message: 'Alert rule created successfully',
          data: alertRule,
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error creating alert rule:', error);
        
        if (error.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'Alert rule with this name already exists',
          });
        }

        res.status(500).json({
          success: false,
          message: 'Failed to create alert rule',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/alerts/instances:
 *   get:
 *     summary: Get alert instances (fired alerts)
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert instances retrieved successfully
 */
router.get('/alerts/instances',
  authenticate,
  authorize('alerts', 'read'),
  async (req, res) => {
    return createCustomSpan('monitoring:get_alert_instances', async (span) => {
      try {
        const { state, severity, limit = 50, page = 1 } = req.query;

        const query = {};
        if (state) query.state = state;
        if (severity) query.severity = severity;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [instances, totalCount] = await Promise.all([
          AlertInstance.find(query)
            .populate('rule', 'name description')
            .populate('acknowledgedBy', 'username email')
            .populate('silencedBy', 'username email')
            .sort({ firedAt: -1 })
            .limit(parseInt(limit))
            .skip(skip),
          AlertInstance.countDocuments(query)
        ]);

        span.setAttributes({
          'monitoring.alert_instances_count': instances.length,
          'monitoring.query.state': state || 'all',
          'monitoring.query.severity': severity || 'all',
        });

        res.json({
          success: true,
          data: instances,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error fetching alert instances:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch alert instances',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/system/events:
 *   get:
 *     summary: Get system events (audit log)
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System events retrieved successfully
 */
router.get('/system/events',
  authenticate,
  requireRole(['admin', 'operator']),
  async (req, res) => {
    return createCustomSpan('monitoring:get_system_events', async (span) => {
      try {
        const { type, severity, from, to, limit = 100, page = 1 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (severity) query.severity = severity;

        if (from || to) {
          query.timestamp = {};
          if (from) query.timestamp.$gte = new Date(from);
          if (to) query.timestamp.$lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [events, totalCount] = await Promise.all([
          SystemEvent.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean(),
          SystemEvent.countDocuments(query)
        ]);

        span.setAttributes({
          'monitoring.system_events_count': events.length,
        });

        res.json({
          success: true,
          data: events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit)),
          },
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error fetching system events:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch system events',
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/monitoring/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard/stats',
  authenticate,
  authorize('dashboard', 'read'),
  async (req, res) => {
    return createCustomSpan('monitoring:get_dashboard_stats', async (span) => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get various statistics in parallel
        const [
          activeAlerts,
          totalMetrics,
          recentEvents,
          serviceCount,
          healthyServices,
        ] = await Promise.all([
          AlertInstance.countDocuments({ state: 'firing' }),
          Metric.countDocuments({ timestamp: { $gte: oneHourAgo } }),
          SystemEvent.countDocuments({ timestamp: { $gte: oneDayAgo } }),
          Metric.distinct('source.service').then(services => services.length),
          Metric.aggregate([
            { $match: { timestamp: { $gte: oneHourAgo } } },
            { $group: { _id: '$source.service', lastSeen: { $max: '$timestamp' } } },
            { $match: { lastSeen: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } } },
            { $count: 'healthy' }
          ]).then(result => result[0]?.healthy || 0),
        ]);

        const stats = {
          alerts: {
            active: activeAlerts,
            // Add more alert statistics as needed
          },
          metrics: {
            total: totalMetrics,
            rate: Math.round(totalMetrics / 60), // per minute
          },
          services: {
            total: serviceCount,
            healthy: healthyServices,
            unhealthy: serviceCount - healthyServices,
          },
          events: {
            recent: recentEvents,
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
          },
        };

        span.setAttributes({
          'monitoring.stats.active_alerts': activeAlerts,
          'monitoring.stats.total_services': serviceCount,
          'monitoring.stats.healthy_services': healthyServices,
        });

        res.json({
          success: true,
          data: stats,
          timestamp: now,
        });

      } catch (error) {
        span.recordException(error);
        logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch dashboard statistics',
        });
      }
    });
  }
);

module.exports = router;
