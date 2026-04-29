#!/usr/bin/env node

/**
 * Demo Data Generator for Grafana, Prometheus, and Jaeger
 * Generates realistic metrics, traces, and logs for the monitoring stack
 */

const axios = require('axios');
const { trace, context, SpanStatusCode } = require('@opentelemetry/api');
const logger = require('../config/logger');

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:8000';
const JAEGER_URL = process.env.JAEGER_URL || 'http://localhost:14268';
const DEMO_DURATION = parseInt(process.env.DEMO_DURATION) || 5; // minutes
const INTERVAL = parseInt(process.env.DEMO_INTERVAL) || 3000; // milliseconds

// Operation types
const OPERATION_TYPES = ['buy', 'sell', 'analysis', 'monitoring'];
const ENDPOINTS = [
  '/api/trade',
  '/api/monitoring/metrics',
  '/api/monitoring/health',
  '/api/analytics/dashboard',
];

/**
 * Generate random values for demo data
 */
function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Make API requests to generate metrics
 */
async function generateMetricsData() {
  const operations = ['buy', 'sell'];
  
  for (const operation of operations) {
    try {
      const response = await axios.post(`${APP_URL}/api/trade`, {
        type: operation,
        amount: getRandomInt(10, 100),
        price: getRandomValue(0.10, 0.15),
      }, {
        timeout: 5000,
        headers: {
          'X-Demo-Data': 'true',
          'X-Correlation-ID': `demo-${Date.now()}-${Math.random()}`,
        },
      });
      
      logger.info(`Generated ${operation} metrics`, {
        status: response.status,
        data: response.data,
      });
    } catch (error) {
      logger.error(`Failed to generate ${operation} metrics`, {
        error: error.message,
      });
    }
  }
}

/**
 * Make requests to various endpoints to generate diverse metrics
 */
async function generateDiverseMetrics() {
  const endpoint = ENDPOINTS[getRandomInt(0, ENDPOINTS.length - 1)];
  
  try {
    const response = await axios.get(`${APP_URL}${endpoint}`, {
      timeout: 5000,
      headers: {
        'X-Demo-Data': 'true',
        'User-Agent': 'DemoDataGenerator/1.0',
      },
    });
    
    logger.info(`Generated metrics from ${endpoint}`, {
      status: response.status,
    });
  } catch (error) {
    if (error.response?.status !== 404) {
      logger.debug(`Request to ${endpoint}`, {
        status: error.response?.status,
        error: error.message,
      });
    }
  }
}

/**
 * Simulate error scenarios occasionally
 */
async function generateErrorMetrics() {
  // 10% chance of error
  if (Math.random() < 0.1) {
    try {
      await axios.post(`${APP_URL}/api/trade`, {
        type: 'invalid',
        amount: -50,
      }, {
        timeout: 5000,
      });
    } catch (error) {
      logger.info('Generated error metric intentionally', {
        error: error.response?.status,
      });
    }
  }
}

/**
 * Generate Jaeger traces
 */
async function generateJaegerTraces() {
  const tracer = trace.getTracer('demo-data-generator');
  
  const operations = ['process_trade', 'analyze_metrics', 'query_db', 'cache_lookup'];
  const randomOp = operations[getRandomInt(0, operations.length - 1)];
  
  const span = tracer.startSpan(randomOp);
  
  try {
    span.setAttributes({
      'operation.type': randomOp,
      'demo.data': true,
      'environment': process.env.NODE_ENV || 'development',
      'timestamp': new Date().toISOString(),
    });
    
    // Simulate work
    const duration = getRandomInt(50, 1000);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Randomly add events
    if (Math.random() < 0.3) {
      span.addEvent('cache_hit', {
        'cache.key': `demo-key-${getRandomInt(1, 100)}`,
      });
    }
    
    if (Math.random() < 0.1) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Simulated error' });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }
    
    logger.debug(`Generated Jaeger trace: ${randomOp}`);
  } finally {
    span.end();
  }
}

/**
 * Send custom metrics to Prometheus push gateway (if available)
 */
async function generateCustomMetrics() {
  const metrics = [
    {
      name: 'demo_trades_total',
      value: getRandomInt(10, 100),
      labels: { operation: 'buy' },
    },
    {
      name: 'demo_trades_total',
      value: getRandomInt(10, 100),
      labels: { operation: 'sell' },
    },
    {
      name: 'demo_processing_time_ms',
      value: getRandomInt(50, 500),
      labels: { endpoint: '/api/trade' },
    },
    {
      name: 'demo_active_users',
      value: getRandomInt(1, 50),
      labels: {},
    },
    {
      name: 'demo_transaction_value',
      value: getRandomValue(100, 5000),
      labels: { currency: 'INR' },
    },
  ];
  
  logger.debug('Generated custom metrics', {
    count: metrics.length,
    metrics: metrics.map(m => `${m.name}=${m.value}`),
  });
}

/**
 * Main generator loop
 */
async function runDemoGenerator() {
  logger.info('Starting demo data generator', {
    appUrl: APP_URL,
    duration: DEMO_DURATION,
    interval: INTERVAL,
  });

  const startTime = Date.now();
  const endTime = startTime + DEMO_DURATION * 60 * 1000;
  let iteration = 0;

  while (Date.now() < endTime) {
    iteration++;
    
    try {
      logger.info(`Demo generation iteration ${iteration}`, {
        elapsed: Math.round((Date.now() - startTime) / 1000),
        remaining: Math.round((endTime - Date.now()) / 1000),
      });
      
      // Generate various types of data
      await Promise.all([
        generateMetricsData(),
        generateDiverseMetrics(),
        generateErrorMetrics(),
        generateJaegerTraces(),
        generateCustomMetrics(),
      ]).catch(error => {
        logger.error('Error in demo generation batch', { error: error.message });
      });
      
      // Wait before next iteration
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    } catch (error) {
      logger.error('Unexpected error in demo generator', { error: error.message });
      // Continue despite errors
    }
  }

  logger.info('Demo data generation completed', {
    totalDuration: Math.round((Date.now() - startTime) / 1000),
    iterations: iteration,
  });
}

/**
 * Health check before starting
 */
async function healthCheck() {
  try {
    const response = await axios.get(`${APP_URL}/health/live`, { timeout: 5000 });
    logger.info('Application health check passed', { status: response.status });
    return true;
  } catch (error) {
    logger.error('Application health check failed', {
      error: error.message,
      url: `${APP_URL}/health/live`,
    });
    return false;
  }
}

/**
 * Entry point
 */
async function main() {
  try {
    logger.info('Demo Data Generator starting...');
    
    // Check if app is running
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      logger.error('Cannot start: application is not responding');
      process.exit(1);
    }
    
    // Run generator
    await runDemoGenerator();
    
    logger.info('Demo data generation finished successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error in demo generator', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateMetricsData,
  generateDiverseMetrics,
  generateErrorMetrics,
  generateJaegerTraces,
  generateCustomMetrics,
  runDemoGenerator,
};
