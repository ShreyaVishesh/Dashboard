const prom = require('prom-client');

// Create a Registry to register the metrics
const register = new prom.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'electrode-monitoring-server',
  version: process.env.npm_package_version || '1.0.0',
});

// Enable the collection of default metrics
const collectDefaultMetrics = prom.collectDefaultMetrics;

// Enhanced HTTP request duration histogram
const reqResTime = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10], // More granular buckets
  registers: [register],
});

// HTTP request counter
const httpRequestsTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active connections gauge
const activeConnections = new prom.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

// Application uptime gauge
const uptimeGauge = new prom.Gauge({
  name: 'application_uptime_seconds',
  help: 'Application uptime in seconds',
  registers: [register],
});

// Memory usage gauges
const memoryUsageGauge = new prom.Gauge({
  name: 'nodejs_memory_usage_bytes',
  help: 'Node.js memory usage in bytes',
  labelNames: ['type'],
  registers: [register],
});

// Error counter
const errorCounter = new prom.Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type', 'endpoint'],
  registers: [register],
});

// Custom business metrics
const electrodeOperationsTotal = new prom.Counter({
  name: 'electrode_operations_total',
  help: 'Total number of electrode operations',
  labelNames: ['operation_type', 'status'],
  registers: [register],
});

const electrodeResponseTime = new prom.Histogram({
  name: 'electrode_operation_duration_seconds',
  help: 'Duration of electrode operations in seconds',
  labelNames: ['operation_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// Update uptime and memory usage periodically (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    uptimeGauge.set(process.uptime());
    
    const memUsage = process.memoryUsage();
    memoryUsageGauge.labels('rss').set(memUsage.rss);
    memoryUsageGauge.labels('heapUsed').set(memUsage.heapUsed);
    memoryUsageGauge.labels('heapTotal').set(memUsage.heapTotal);
    memoryUsageGauge.labels('external').set(memUsage.external);
  }, 10000); // Update every 10 seconds
}

module.exports = {
  register,
  collectDefaultMetrics,
  reqResTime,
  httpRequestsTotal,
  activeConnections,
  uptimeGauge,
  memoryUsageGauge,
  errorCounter,
  electrodeOperationsTotal,
  electrodeResponseTime,
};
