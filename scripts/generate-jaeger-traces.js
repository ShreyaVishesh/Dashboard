#!/usr/bin/env node
/**
 * Generate realistic Jaeger distributed tracing spans
 * Simulates microservice interactions and request flows
 */

const axios = require('axios');
const jaeger = require('jaeger-client');

// Configuration
const JAEGER_AGENT_HOST = process.env.JAEGER_AGENT_HOST || 'localhost';
const JAEGER_AGENT_PORT = process.env.JAEGER_AGENT_PORT || 6831;
const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces';

// Service names
const SERVICES = {
  'electrode-api': { color: '2f5233' },
  'mongodb-service': { color: '47a447' },
  'cache-service': { color: '5cb85c' },
  'auth-service': { color: '0275d8' },
};

/**
 * Initialize Jaeger tracer
 */
function initJaeger(serviceName) {
  const initTracer = jaeger.initTracer(
    {
      serviceName,
      sampler: {
        type: 'const',
        param: 1,
      },
      reporter: {
        agentHost: JAEGER_AGENT_HOST,
        agentPort: JAEGER_AGENT_PORT,
        maxPacketSize: 65000,
      },
      tags: {
        'environment': 'demo',
        'version': '1.0.0',
      },
    },
    {
      logger: console,
    }
  );

  return initTracer;
}

/**
 * Generate a realistic request trace
 */
async function generateRequestTrace(tracer, serviceName, traceId) {
  const parentSpan = tracer.startSpan('HTTP GET /api/v1/monitoring/metrics', {
    tags: {
      'span.kind': 'server',
      'http.method': 'GET',
      'http.url': '/api/v1/monitoring/metrics',
      'component': 'http-server',
    },
  });

  const startTime = Date.now();
  const duration = Math.random() * 500 + 50;  // 50-550ms

  try {
    // Simulate database query
    const dbSpan = tracer.startSpan('db.query', {
      childOf: parentSpan,
      tags: {
        'db.type': 'mongodb',
        'db.instance': 'electrode_metrics',
        'db.statement': 'find({timestamp: {$gte: ISODate(...)}}).limit(100)',
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20));
    
    dbSpan.setTag('db.rows_returned', Math.floor(Math.random() * 100 + 50));
    dbSpan.finish();

    // Simulate cache interaction
    const cacheSpan = tracer.startSpan('cache.get', {
      childOf: parentSpan,
      tags: {
        'cache.backend': 'redis',
        'cache.key': 'metrics:aggregate:latest',
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 5));
    
    cacheSpan.setTag('cache.hit', Math.random() > 0.3);
    cacheSpan.finish();

    // Simulate data serialization
    const serializeSpan = tracer.startSpan('json.serialize', {
      childOf: parentSpan,
      tags: {
        'json.type': 'metrics_response',
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5));
    
    serializeSpan.setTag('json.size_bytes', Math.floor(Math.random() * 50000 + 10000));
    serializeSpan.finish();

    // Set response tags
    parentSpan.setTag('http.status_code', 200);
    parentSpan.setTag('http.response_size', 25000);
    parentSpan.setTag('sampling.priority', 1);

  } catch (error) {
    parentSpan.setTag('error', true);
    parentSpan.setTag('error.kind', error.name);
    parentSpan.log({
      event: 'error',
      'error.object': error,
      message: error.message,
      stack: error.stack,
    });
  } finally {
    parentSpan.finish();
  }
}

/**
 * Generate database operation traces
 */
async function generateDatabaseTrace(tracer) {
  const parentSpan = tracer.startSpan('db.transaction', {
    tags: {
      'span.kind': 'client',
      'db.type': 'mongodb',
    },
  });

  try {
    const operations = ['insert', 'update', 'find'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    const opSpan = tracer.startSpan(`db.${operation}`, {
      childOf: parentSpan,
      tags: {
        'db.operation': operation,
        'db.collection': 'trades',
        'db.num_documents': Math.floor(Math.random() * 100 + 1),
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
    
    opSpan.setTag('db.success', true);
    opSpan.finish();

    parentSpan.setTag('db.transaction_id', Math.random().toString(36).substr(2, 9));

  } finally {
    parentSpan.finish();
  }
}

/**
 * Generate service-to-service communication traces
 */
async function generateServiceTrace(tracer, fromService, toService) {
  const parentSpan = tracer.startSpan(`call_${toService}`, {
    tags: {
      'span.kind': 'client',
      'peer.service': toService,
      'component': 'http-client',
    },
  });

  try {
    const childSpan = tracer.startSpan(`${toService}.request`, {
      childOf: parentSpan,
      tags: {
        'http.method': 'GET',
        'http.url': `/api/v1/${toService}/data`,
        'peer.hostname': `${toService}.local`,
        'peer.port': 8000,
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20));
    
    childSpan.setTag('http.status_code', 200);
    childSpan.finish();

    parentSpan.setTag('success', true);

  } catch (error) {
    parentSpan.setTag('error', true);
    parentSpan.setTag('error.kind', 'timeout');
  } finally {
    parentSpan.finish();
  }
}

/**
 * Generate cache operation traces
 */
async function generateCacheTrace(tracer) {
  const operations = ['get', 'set', 'delete'];
  
  operations.forEach(async (operation) => {
    const span = tracer.startSpan(`cache.${operation}`, {
      tags: {
        'span.kind': 'client',
        'cache.backend': 'redis',
        'cache.key': `metrics:${operation}:${Date.now()}`,
        'cache.operation': operation,
      },
    });

    await new Promise(resolve => setTimeout(resolve, Math.random() * 15 + 2));
    
    span.setTag('cache.hit', operation === 'get' && Math.random() > 0.4);
    span.setTag('cache.ttl', Math.floor(Math.random() * 3600 + 60));
    span.finish();
  });
}

/**
 * Generate error traces
 */
async function generateErrorTrace(tracer) {
  const span = tracer.startSpan('error.operation', {
    tags: {
      'span.kind': 'internal',
      'error': true,
    },
  });

  try {
    throw new Error('Simulated application error');
  } catch (error) {
    span.setTag('error.kind', error.name);
    span.setTag('message', error.message);
    span.log({
      event: 'error',
      'error.object': error,
      timestamp: Date.now(),
    });
  } finally {
    span.finish();
  }
}

/**
 * Main trace generation function
 */
async function generateTraces() {
  console.log('🔍 Generating Jaeger traces...\n');

  // Generate traces for each service
  for (const [serviceName] of Object.entries(SERVICES)) {
    console.log(`  Generating traces for ${serviceName}...`);

    const tracer = initJaeger(serviceName);

    try {
      // Generate various types of traces
      const traceId = Math.random().toString(36).substr(2, 9);

      // Request traces
      for (let i = 0; i < 3; i++) {
        await generateRequestTrace(tracer, serviceName, traceId);
      }

      // Database traces
      for (let i = 0; i < 2; i++) {
        await generateDatabaseTrace(tracer);
      }

      // Cache traces
      await generateCacheTrace(tracer);

      // Service-to-service traces
      const otherServices = Object.keys(SERVICES).filter(s => s !== serviceName);
      if (otherServices.length > 0) {
        const targetService = otherServices[Math.floor(Math.random() * otherServices.length)];
        for (let i = 0; i < 2; i++) {
          await generateServiceTrace(tracer, serviceName, targetService);
        }
      }

      // Occasional error traces
      if (Math.random() > 0.7) {
        await generateErrorTrace(tracer);
      }

      // Give spans time to be sent
      await new Promise(resolve => setTimeout(resolve, 1000));

    } finally {
      tracer.close();
    }
  }

  console.log('\n✅ Trace generation complete!');
}

/**
 * Run continuous trace generation
 */
async function runContinuous(intervalSeconds = 10) {
  console.log(`🔄 Running Jaeger trace generator every ${intervalSeconds}s`);
  console.log('Press Ctrl+C to stop\n');

  // Generate immediately
  await generateTraces();

  // Then generate periodically
  setInterval(async () => {
    await generateTraces();
  }, intervalSeconds * 1000);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'once';
  const interval = parseInt(args[1], 10) || 10;

  console.log('╔════════════════════════════════════════╗');
  console.log('║   Jaeger Demo Trace Generator          ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Configuration:`);
  console.log(`  Jaeger Agent: ${JAEGER_AGENT_HOST}:${JAEGER_AGENT_PORT}`);
  console.log(`  Services: ${Object.keys(SERVICES).join(', ')}`);
  console.log();

  if (mode === 'continuous') {
    await runContinuous(interval);
  } else {
    // Run once
    await generateTraces();
    console.log('\nMode: Once (to run continuously, use: node generate-jaeger-traces.js continuous [interval])');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down trace generator...');
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
