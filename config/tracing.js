// OpenTelemetry Configuration for Distributed Tracing
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const logger = require('./logger');

const initializeTracing = () => {
  try {
    // Initialize Jaeger exporter for traces
    const jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      serviceName: process.env.SERVICE_NAME || 'dashboard-monitoring',
    });

    // Initialize Prometheus exporter for metrics
    const prometheusExporter = new PrometheusExporter({
      port: parseInt(process.env.PROMETHEUS_METRICS_PORT) || 9464,
      endpoint: '/metrics',
    });

    // Create SDK configuration
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'dashboard-monitoring',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: process.env.SERVICE_NAMESPACE || 'monitoring',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      }),
      traceExporter: jaegerExporter,
      metricReader: prometheusExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Customize auto-instrumentations
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable filesystem instrumentation to reduce noise
          },
          '@opentelemetry/instrumentation-express': {
            enabled: true,
            requestHook: (span, info) => {
              span.setAttributes({
                'http.client_ip': info.req.ip,
                'user.id': info.req.user?.id || 'anonymous',
              });
            },
          },
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            requestHook: (span, request) => {
              span.setAttributes({
                'http.request.header.user_agent': request.getHeader('user-agent'),
              });
            },
          },
          '@opentelemetry/instrumentation-mongodb': {
            enabled: true,
          },
        }),
      ],
    });

    // Initialize the SDK
    sdk.start();

    logger.info('🔍 OpenTelemetry tracing initialized successfully', {
      serviceName: process.env.SERVICE_NAME || 'dashboard-monitoring',
      jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      prometheusPort: parseInt(process.env.PROMETHEUS_METRICS_PORT) || 9464,
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => logger.info('OpenTelemetry terminated'))
        .catch((error) => logger.error('Error terminating OpenTelemetry', error))
        .finally(() => process.exit(0));
    });

    return sdk;
  } catch (error) {
    logger.error('Failed to initialize OpenTelemetry:', error);
    throw error;
  }
};

// Create custom spans for business logic
const { trace } = require('@opentelemetry/api');

const createCustomSpan = (operationName, callback) => {
  const tracer = trace.getTracer('dashboard-monitoring', '1.0.0');
  
  return tracer.startActiveSpan(operationName, (span) => {
    let result;
    try {
      result = callback(span);
      
      // Handle async operations
      if (result && typeof result.then === 'function') {
        return result
          .then((res) => {
            span.setStatus({ code: 1 }); // SUCCESS
            return res;
          })
          .catch((error) => {
            span.recordException(error);
            span.setStatus({ code: 2, message: error.message }); // ERROR
            throw error;
          })
          .finally(() => {
            span.end();
          });
      }
      
      // Handle sync operations
      span.setStatus({ code: 1 }); // SUCCESS
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message }); // ERROR
      throw error;
    } finally {
      if (!result || typeof result.then !== 'function') {
        span.end();
      }
    }
  });
};

// Performance monitoring wrapper
const monitorPerformance = (operationName) => {
  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    
    createCustomSpan(`${operationName}:${req.method}:${req.route?.path || req.path}`, (span) => {
      span.setAttributes({
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.get('User-Agent'),
        'http.client_ip': req.ip,
      });

      // Track response
      res.on('finish', () => {
        const duration = process.hrtime.bigint() - startTime;
        span.setAttributes({
          'http.status_code': res.statusCode,
          'http.response_size': res.get('content-length') || 0,
          'operation.duration_ns': Number(duration),
        });
      });

      next();
    });
  };
};

module.exports = {
  initializeTracing,
  createCustomSpan,
  monitorPerformance,
  tracer: trace.getTracer('dashboard-monitoring', '1.0.0'),
};
