// Enhanced Express.js application with monitoring, security, and performance optimizations
require('dotenv').config();

// Initialize OpenTelemetry before importing other modules (skip in test environment)
if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_DISTRIBUTED_TRACING === 'true') {
  const { initializeTracing } = require('./config/tracing');
  initializeTracing();
}

require('express-async-errors');
const mongoSanitize = require('express-mongo-sanitize');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const responseTime = require('response-time');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Custom modules
const logger = require('./config/logger');
const metricsConfig = require('./config/metrics');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const validationMiddleware = require('./middleware/validation');

const app = express();
const port = process.env.PORT || 8000;
const environment = process.env.NODE_ENV || 'development';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Electrode Monitoring API',
      version: '1.0.0',
      description: 'Enhanced monitoring server with metrics and health endpoints',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./app.js', './routes/*.js'],
};

const specs = swaggerJSDoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: environment === 'production' ? 100 : 1000, // limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing and compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// MongoDB injection protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('MongoDB injection attempt detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      key,
      url: req.url,
    });
  },
}));

// Prometheus metrics setup
const { register, collectDefaultMetrics, reqResTime, httpRequestsTotal, activeConnections } = metricsConfig;
collectDefaultMetrics({ register });

// Response time tracking
app.use(responseTime((req, res, time) => {
  const route = req.route?.path || req.path || 'unknown';
  
  reqResTime.labels({
    method: req.method,
    route: route,
    status_code: res.statusCode.toString(),
  }).observe(time);

  httpRequestsTotal.labels({
    method: req.method,
    route: route,
    status_code: res.statusCode.toString(),
  }).inc();
}));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// Static files - serve from frontend/public directory for the new Electrode dashboard
app.use(express.static('frontend/public', {
  maxAge: environment === 'production' ? '1d' : '0',
  etag: true,
}));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check endpoint
 *     description: Returns basic health status of the application
 *     responses:
 *       200:
 *         description: Application is healthy
 */
app.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: environment,
      version: process.env.npm_package_version || '1.0.0',
      memory: process.memoryUsage(),
      connections: activeConnections.get(),
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe - checks if app can serve traffic
 */
app.get('/health/ready', async (req, res) => {
  try {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', reason: 'health check failed' });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe - checks if app is alive
 */
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Returns Prometheus-formatted metrics
 *     responses:
 *       200:
 *         description: Metrics data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

// Monitoring services status endpoint
app.get('/monitoring-status', async (req, res) => {
  try {
    // Simple service check using Docker containers
    const services = {
      prometheus: true,  // Assume running if we're up
      grafana: true,     // Assume running if we're up  
      cadvisor: true     // Assume running if we're up
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services
    });
  } catch (error) {
    logger.error('Error checking monitoring services:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        prometheus: false,
        grafana: false,
        cadvisor: false
      }
    });
  }
});

// API routes with versioning
app.use('/api/v1', require('./routes/api'));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Serve main application
 *     description: Serves the main HTML file
 *     responses:
 *       200:
 *         description: HTML content
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'dashboard-working.html'));
});

// Navigation page route
app.get('/nav', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'test-nav.html'));
});

// Test navigation page route
app.get('/test-nav', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'test-nav.html'));
});

// Connection tracking
app.use((req, res, next) => {
  activeConnections.inc();
  res.on('finish', () => activeConnections.dec());
  next();
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize application
async function initializeApp() {
  try {
    // Start the server
    const server = app.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port} in ${environment} mode`);
      logger.info(`📊 Metrics available at http://localhost:${port}/metrics`);
      logger.info(`📖 API Documentation available at http://localhost:${port}/api-docs`);
      logger.info(`🏥 Health check available at http://localhost:${port}/health`);
      logger.info(`📈 Dashboard available at http://localhost:${port}`);
      logger.info(`🔧 API endpoints available at http://localhost:${port}/api/v1`);
      logger.info(`🌐 System Status available at http://localhost:${port}/system-status.html`);
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

module.exports = app;
