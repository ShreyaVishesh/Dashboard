#!/usr/bin/env node
/**
 * Generate realistic cAdvisor-style metrics and send to Prometheus
 * Simulates container monitoring data that will display properly on Grafana dashboards
 */

const axios = require('axios');
const prom = require('prom-client');

// Configuration
const PROMETHEUS_PUSHGATEWAY = process.env.PUSHGATEWAY_URL || 'http://localhost:9091';
const APP_URL = process.env.APP_URL || 'http://localhost:8000';

// Container definitions
const CONTAINERS = [
  { name: 'electrode-app', id: 'abc123def456', image: 'electrode:latest' },
  { name: 'mongodb', id: 'def456ghi789', image: 'mongo:latest' },
  { name: 'prometheus', id: 'ghi789jkl012', image: 'prom/prometheus:latest' },
  { name: 'grafana', id: 'jkl012mno345', image: 'grafana/grafana:latest' },
];

// Create a separate registry for demo metrics
const register = new prom.Registry();

// Define cAdvisor-style metrics
const containerCpuUsage = new prom.Gauge({
  name: 'container_cpu_usage_seconds_total',
  help: 'Cumulative cpu time consumed',
  labelNames: ['container', 'container_id', 'image', 'pod_name', 'namespace'],
  registers: [register],
});

const containerMemoryUsage = new prom.Gauge({
  name: 'container_memory_usage_bytes',
  help: 'Current memory usage in bytes',
  labelNames: ['container', 'container_id', 'id'],
  registers: [register],
});

const containerMemoryLimit = new prom.Gauge({
  name: 'container_memory_limit_bytes',
  help: 'Memory limit in bytes',
  labelNames: ['container', 'container_id'],
  registers: [register],
});

const containerMemoryCache = new prom.Gauge({
  name: 'container_memory_cache_bytes',
  help: 'Memory cache in bytes',
  labelNames: ['container', 'container_id'],
  registers: [register],
});

const containerNetworkReceiveBytes = new prom.Gauge({
  name: 'container_network_receive_bytes_total',
  help: 'Cumulative count of bytes received',
  labelNames: ['container', 'container_id', 'interface'],
  registers: [register],
});

const containerNetworkTransmitBytes = new prom.Gauge({
  name: 'container_network_transmit_bytes_total',
  help: 'Cumulative count of bytes transmitted',
  labelNames: ['container', 'container_id', 'interface'],
  registers: [register],
});

const containerFsUsage = new prom.Gauge({
  name: 'container_fs_usage_bytes',
  help: 'Number of bytes that are consumed by the container on this filesystem',
  labelNames: ['container', 'container_id', 'fstype', 'mountpoint'],
  registers: [register],
});

const containerFsLimit = new prom.Gauge({
  name: 'container_fs_limit_bytes',
  help: 'Number of bytes that can be consumed by the container on this filesystem',
  labelNames: ['container', 'container_id', 'fstype', 'mountpoint'],
  registers: [register],
});

const httpRequestsTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
});

const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Active HTTP connections gauge - THIS IS KEY FOR SHOWING DATA
const activeConnections = new prom.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

const electrodeOperationsTotal = new prom.Counter({
  name: 'electrode_operations_total',
  help: 'Total number of electrode operations',
  labelNames: ['operation_type', 'status'],
  registers: [register],
});

const electrodeOperationDuration = new prom.Histogram({
  name: 'electrode_operation_duration_seconds',
  help: 'Electrode operation duration in seconds',
  labelNames: ['operation_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * Generate realistic CPU metrics
 */
function generateCpuMetrics() {
  CONTAINERS.forEach(container => {
    // More realistic CPU patterns with sustained usage
    const baseCpu = container.name === 'mongodb' 
      ? Math.random() * 0.6 + 0.4  // MongoDB: 40-100% for sustained load
      : Math.random() * 0.5 + 0.2;  // Others: 20-70%
    
    const cpuValue = Math.max(0, Math.min(1, baseCpu)) * 1e10;  // Much larger values
    
    containerCpuUsage.labels(
      container.name,
      container.id,
      container.image,
      container.name,
      'default'
    ).set(cpuValue + Math.random() * 1e9);  // Add continuous increment
  });
}

/**
 * Generate realistic memory metrics
 */
function generateMemoryMetrics() {
  const memoryConfigs = {
    'electrode-app': { limit: 512 * 1024 * 1024, baseUsage: 0.45 },
    'mongodb': { limit: 1024 * 1024 * 1024, baseUsage: 0.65 },
    'prometheus': { limit: 512 * 1024 * 1024, baseUsage: 0.55 },
    'grafana': { limit: 256 * 1024 * 1024, baseUsage: 0.40 },
  };

  CONTAINERS.forEach(container => {
    const config = memoryConfigs[container.name];
    const limit = config.limit;
    // Add variation to memory usage to show trending
    const usage = limit * (config.baseUsage + (Math.random() - 0.5) * 0.15);
    const cache = usage * (0.15 + Math.random() * 0.1);

    containerMemoryUsage.labels(
      container.name,
      container.id,
      container.id
    ).set(Math.max(0, usage));

    containerMemoryLimit.labels(
      container.name,
      container.id
    ).set(limit);

    containerMemoryCache.labels(
      container.name,
      container.id
    ).set(Math.max(0, cache));
  });
}

/**
 * Generate network metrics
 */
function generateNetworkMetrics() {
  CONTAINERS.forEach(container => {
    ['eth0', 'docker0'].forEach(iface => {
      const rxBytes = Math.random() * 50000000 + 1000000;
      const txBytes = Math.random() * 30000000 + 500000;

      containerNetworkReceiveBytes.labels(
        container.name,
        container.id,
        iface
      ).set(rxBytes);

      containerNetworkTransmitBytes.labels(
        container.name,
        container.id,
        iface
      ).set(txBytes);
    });
  });
}

/**
 * Generate filesystem metrics
 */
function generateFilesystemMetrics() {
  CONTAINERS.forEach(container => {
    const mountPoints = ['/', '/var/lib/docker'];
    
    mountPoints.forEach(mp => {
      const limit = Math.random() * 90e9 + 10e9;  // 10-100 GB
      const usage = limit * (Math.random() * 0.5 + 0.3);

      containerFsUsage.labels(
        container.name,
        container.id,
        'ext4',
        mp
      ).set(usage);

      containerFsLimit.labels(
        container.name,
        container.id,
        'ext4',
        mp
      ).set(limit);
    });
  });
}

/**
 * Generate HTTP request metrics
 */
function generateHttpMetrics() {
  const endpoints = [
    { method: 'GET', endpoint: '/api/v1/monitoring/metrics', volume: 150 },
    { method: 'GET', endpoint: '/api/v1/monitoring/health', volume: 120 },
    { method: 'GET', endpoint: '/metrics', volume: 200 },
    { method: 'POST', endpoint: '/api/v1/trades', volume: 80 },
    { method: 'GET', endpoint: '/api/v1/analytics', volume: 90 },
    { method: 'POST', endpoint: '/api/v1/operations', volume: 70 },
  ];

  endpoints.forEach(({ method, endpoint, volume }) => {
    // Distribute requests across status codes (mostly 200s)
    const distribution = {
      '200': Math.floor(volume * 0.85),
      '201': Math.floor(volume * 0.05),
      '400': Math.floor(volume * 0.07),
      '500': Math.floor(volume * 0.03),
    };
    
    Object.entries(distribution).forEach(([status, count]) => {
      // Increment counter with realistic volume
      for (let i = 0; i < count; i++) {
        httpRequestsTotal.labels(method, endpoint, status).inc(1);
      }
      
      // Add request duration with status-aware latency
      let baseDuration = Math.random() * 0.8 + 0.1;
      if (status === '500') baseDuration *= 2;  // Errors are slower
      if (status === '400') baseDuration *= 1.3;
      
      for (let i = 0; i < Math.max(1, count / 10); i++) {
        httpRequestDuration.labels(method, endpoint).observe(baseDuration);
      }
    });
  });
}

/**
 * Generate application-specific metrics
 */
function generateApplicationMetrics() {
  // Simulate high volume of electrode operations
  const operationTypes = ['read', 'write', 'delete', 'update', 'query'];
  
  operationTypes.forEach(opType => {
    // Heavy volume of operations
    const successCount = Math.floor(Math.random() * 500 + 300);
    const errorCount = Math.floor(Math.random() * 50 + 10);
    
    // Generate success operations
    for (let i = 0; i < successCount; i++) {
      electrodeOperationsTotal.labels(opType, 'success').inc(1);
      electrodeOperationDuration.labels(opType).observe(
        Math.random() * 0.5 + 0.01
      );
    }
    
    // Generate error operations
    for (let i = 0; i < errorCount; i++) {
      electrodeOperationsTotal.labels(opType, 'error').inc(1);
      electrodeOperationDuration.labels(opType).observe(
        Math.random() * 2 + 0.5  // Errors take longer
      );
    }
  });
  
  // Set active connections (always visible)
  const activeConns = Math.floor(Math.random() * 150 + 20);
  activeConnections.set(activeConns);
}

/**
 * Push metrics to Prometheus Pushgateway
 */
async function pushMetricsToPushgateway() {
  try {
    const metrics = await register.metrics();
    const gatewayUrl = `${PROMETHEUS_PUSHGATEWAY}/metrics/job/electrode-demo/instance/demo-generator`;
    
    const response = await axios.post(gatewayUrl, metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
      timeout: 5000,
    });

    console.log(`✓ Pushed metrics to Pushgateway (${response.status})`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to push to Pushgateway: ${error.message}`);
    return false;
  }
}

/**
 * Send metrics to application endpoint
 */
async function sendMetricsToApp() {
  try {
    const metrics = await register.metrics();
    
    const response = await axios.post(
      `${APP_URL}/api/v1/monitoring/metrics-ingest`,
      { metrics },
      {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log(`✓ Sent metrics to app endpoint (${response.status})`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send to app: ${error.message}`);
    return false;
  }
}

/**
 * Generate and push metrics
 */
async function generateAndPush() {
  console.log('\n🚀 Generating demo metrics...');
  
  // Reset counters (simulating fresh metrics)
  register.resetMetrics?.();
  
  // Generate all metrics
  generateCpuMetrics();
  generateMemoryMetrics();
  generateNetworkMetrics();
  generateFilesystemMetrics();
  generateHttpMetrics();
  generateApplicationMetrics();

  console.log('✓ Generated CPU metrics');
  console.log('✓ Generated memory metrics');
  console.log('✓ Generated network metrics');
  console.log('✓ Generated filesystem metrics');
  console.log('✓ Generated HTTP metrics');
  console.log('✓ Generated application metrics');

  // Push to targets
  console.log('\n📡 Sending metrics to targets...');
  
  await Promise.all([
    pushMetricsToPushgateway(),
    sendMetricsToApp(),
  ]);

  console.log('✅ Metrics push complete\n');
}

/**
 * Run generator continuously
 */
async function runContinuous(intervalSeconds = 15) {
  console.log(`🔄 Running demo metrics generator every ${intervalSeconds}s`);
  console.log('Press Ctrl+C to stop\n');

  // Generate immediately
  await generateAndPush();

  // Then generate periodically
  setInterval(async () => {
    await generateAndPush();
  }, intervalSeconds * 1000);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'once';
  const interval = parseInt(args[1], 10) || 15;

  console.log('╔════════════════════════════════════════════╗');
  console.log('║   cAdvisor-style Demo Metrics Generator    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Configuration:`);
  console.log(`  Pushgateway: ${PROMETHEUS_PUSHGATEWAY}`);
  console.log(`  App URL: ${APP_URL}`);
  console.log(`  Containers: ${CONTAINERS.map(c => c.name).join(', ')}`);

  if (mode === 'continuous') {
    await runContinuous(interval);
  } else {
    // Run once
    await generateAndPush();
    console.log('Mode: Once (to run continuously, use: node generate-demo-metrics.js continuous [interval]');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down metrics generator...');
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
