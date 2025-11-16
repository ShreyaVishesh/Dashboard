/**
 * Metrics Service Tests
 * Comprehensive test suite for MetricsService
 */

const MetricsService = require('../../services/MetricsService');
const { Metric } = require('../../models/Monitoring');

describe('MetricsService', () => {
  beforeEach(async () => {
    // Create test metrics data
    const testMetrics = [];
    const now = new Date();
    
    // Create metrics over the last hour
    for (let i = 0; i < 60; i++) {
      testMetrics.push({
        name: 'test_cpu_usage',
        type: 'gauge',
        value: 50 + Math.random() * 40, // 50-90% CPU
        timestamp: new Date(now.getTime() - i * 60 * 1000), // Every minute
        source: {
          service: 'test-service',
          instance: 'test-instance-1',
          host: 'test-host'
        },
        labels: {
          environment: 'test',
          datacenter: 'dc1'
        }
      });
    }

    // Create different metric for testing
    for (let i = 0; i < 30; i++) {
      testMetrics.push({
        name: 'test_memory_usage',
        type: 'gauge',
        value: 60 + Math.random() * 30, // 60-90% memory
        timestamp: new Date(now.getTime() - i * 2 * 60 * 1000), // Every 2 minutes
        source: {
          service: 'test-service',
          instance: 'test-instance-2',
          host: 'test-host'
        },
        labels: {
          environment: 'test',
          datacenter: 'dc2'
        }
      });
    }

    await Metric.insertMany(testMetrics);
  });

  describe('aggregateMetrics', () => {
    test('should aggregate metrics by 5m intervals with average', async () => {
      const options = {
        metricName: 'test_cpu_usage',
        interval: '5m',
        aggregation: 'avg',
        from: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        to: new Date()
      };

      const result = await MetricsService.aggregateMetrics(options);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that each result has the expected structure
      result.forEach(point => {
        expect(point).toHaveProperty('_id');
        expect(point).toHaveProperty('value');
        expect(point).toHaveProperty('count');
        expect(point).toHaveProperty('timeBucket');
        expect(typeof point.value).toBe('number');
        expect(typeof point.count).toBe('number');
      });
    });

    test('should aggregate metrics with sum aggregation', async () => {
      const options = {
        metricName: 'test_cpu_usage',
        interval: '10m',
        aggregation: 'sum',
        from: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        to: new Date()
      };

      const result = await MetricsService.aggregateMetrics(options);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Sum values should be higher than individual values
      result.forEach(point => {
        expect(point.value).toBeGreaterThan(0);
      });
    });

    test('should return empty array for non-existent metric', async () => {
      const options = {
        metricName: 'non_existent_metric',
        interval: '5m',
        aggregation: 'avg',
        from: new Date(Date.now() - 30 * 60 * 1000),
        to: new Date()
      };

      const result = await MetricsService.aggregateMetrics(options);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    test('should handle different interval formats', async () => {
      const intervals = ['1m', '5m', '15m', '1h'];
      
      for (const interval of intervals) {
        const options = {
          metricName: 'test_cpu_usage',
          interval,
          aggregation: 'avg',
          from: new Date(Date.now() - 60 * 60 * 1000),
          to: new Date()
        };

        const result = await MetricsService.aggregateMetrics(options);
        expect(result).toBeInstanceOf(Array);
      }
    });
  });

  describe('getMetricsStats', () => {
    test('should return comprehensive metrics statistics', async () => {
      const options = {
        timeWindow: '1h',
        services: ['test-service'],
        instances: ['test-instance-1', 'test-instance-2']
      };

      const result = await MetricsService.getMetricsStats(options);

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('metricStats');
      expect(result).toHaveProperty('timeWindow');
      expect(result).toHaveProperty('generatedAt');

      expect(result.overview).toHaveProperty('totalMetrics');
      expect(result.overview).toHaveProperty('uniqueMetricCount');
      expect(result.overview).toHaveProperty('uniqueServiceCount');
      expect(result.overview).toHaveProperty('uniqueInstanceCount');

      expect(result.metricStats).toBeInstanceOf(Array);
      expect(result.timeWindow).toBe('1h');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    test('should filter by services correctly', async () => {
      const options = {
        timeWindow: '1h',
        services: ['test-service']
      };

      const result = await MetricsService.getMetricsStats(options);

      expect(result.overview.services).toContain('test-service');
      expect(result.overview.uniqueServiceCount).toBe(1);
    });

    test('should handle empty filters', async () => {
      const options = {
        timeWindow: '30m'
      };

      const result = await MetricsService.getMetricsStats(options);

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('metricStats');
      expect(result.overview.totalMetrics).toBeGreaterThan(0);
    });
  });

  describe('calculatePercentiles', () => {
    test('should calculate standard percentiles correctly', async () => {
      const options = {
        from: new Date(Date.now() - 60 * 60 * 1000),
        to: new Date(),
        percentiles: [50, 90, 95, 99]
      };

      const result = await MetricsService.calculatePercentiles('test_cpu_usage', options);

      expect(result).toHaveProperty('metric');
      expect(result).toHaveProperty('timeRange');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('percentiles');

      expect(result.metric).toBe('test_cpu_usage');
      expect(result.count).toBeGreaterThan(0);
      expect(result.percentiles).toHaveProperty('p50');
      expect(result.percentiles).toHaveProperty('p90');
      expect(result.percentiles).toHaveProperty('p95');
      expect(result.percentiles).toHaveProperty('p99');

      // Percentiles should be in ascending order
      expect(result.percentiles.p50).toBeLessThanOrEqual(result.percentiles.p90);
      expect(result.percentiles.p90).toBeLessThanOrEqual(result.percentiles.p95);
      expect(result.percentiles.p95).toBeLessThanOrEqual(result.percentiles.p99);
    });

    test('should handle custom percentiles', async () => {
      const options = {
        from: new Date(Date.now() - 30 * 60 * 1000),
        to: new Date(),
        percentiles: [25, 75]
      };

      const result = await MetricsService.calculatePercentiles('test_cpu_usage', options);

      expect(result.percentiles).toHaveProperty('p25');
      expect(result.percentiles).toHaveProperty('p75');
      expect(result.percentiles.p25).toBeLessThanOrEqual(result.percentiles.p75);
    });

    test('should return error for non-existent metric', async () => {
      const options = {
        from: new Date(Date.now() - 60 * 60 * 1000),
        to: new Date(),
        percentiles: [50, 90, 95, 99]
      };

      const result = await MetricsService.calculatePercentiles('non_existent_metric', options);

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('No data found');
    });
  });

  describe('batchInsertMetrics', () => {
    test('should insert valid metrics successfully', async () => {
      const metrics = [
        {
          name: 'batch_test_metric',
          type: 'counter',
          value: 100,
          timestamp: new Date(),
          source: {
            service: 'batch-service',
            instance: 'batch-instance',
            host: 'batch-host'
          },
          labels: { test: 'true' }
        },
        {
          name: 'batch_test_metric_2',
          type: 'gauge',
          value: 200,
          timestamp: new Date(),
          source: {
            service: 'batch-service',
            instance: 'batch-instance',
            host: 'batch-host'
          },
          labels: { test: 'true' }
        }
      ];

      const result = await MetricsService.batchInsertMetrics(metrics);

      expect(result).toHaveProperty('inserted');
      expect(result).toHaveProperty('duplicates');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('errorDetails');

      expect(result.inserted).toBe(2);
      expect(result.errors).toBe(0);
      expect(result.errorDetails).toHaveLength(0);

      // Verify metrics were actually inserted
      const insertedMetrics = await Metric.find({ name: { $in: ['batch_test_metric', 'batch_test_metric_2'] } });
      expect(insertedMetrics).toHaveLength(2);
    });

    test('should handle invalid metrics', async () => {
      const metrics = [
        {
          name: 'valid_metric',
          value: 100,
          timestamp: new Date(),
          source: { service: 'test', instance: 'test', host: 'test' }
        },
        {
          // Missing required fields
          name: 'invalid_metric'
        },
        {
          name: 'invalid_value_metric',
          value: 'not-a-number',
          timestamp: new Date(),
          source: { service: 'test', instance: 'test', host: 'test' }
        }
      ];

      const result = await MetricsService.batchInsertMetrics(metrics);

      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(2);
      expect(result.errorDetails).toHaveLength(2);
    });

    test('should validate only when validateOnly is true', async () => {
      const metrics = [
        {
          name: 'validation_test',
          value: 100,
          timestamp: new Date(),
          source: { service: 'test', instance: 'test', host: 'test' }
        }
      ];

      const result = await MetricsService.batchInsertMetrics(metrics, { validateOnly: true });

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('invalid');
      expect(result.valid).toBe(1);
      expect(result.invalid).toBe(0);

      // Verify no metrics were actually inserted
      const insertedMetrics = await Metric.find({ name: 'validation_test' });
      expect(insertedMetrics).toHaveLength(0);
    });

    test('should handle duplicates correctly', async () => {
      const metric = {
        name: 'duplicate_test',
        value: 100,
        timestamp: new Date(),
        source: {
          service: 'test-service',
          instance: 'test-instance',
          host: 'test-host'
        }
      };

      // Insert the same metric twice
      await MetricsService.batchInsertMetrics([metric]);
      const result = await MetricsService.batchInsertMetrics([metric], { skipDuplicates: true });

      expect(result.inserted).toBe(0);
      expect(result.duplicates).toBe(1);
    });
  });

  describe('cleanupOldMetrics', () => {
    test('should identify old metrics for cleanup in dry run', async () => {
      // Create old metrics
      const oldMetrics = [
        {
          name: 'old_metric',
          value: 100,
          timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
          source: { service: 'test', instance: 'test', host: 'test' }
        }
      ];

      await Metric.insertMany(oldMetrics);

      const result = await MetricsService.cleanupOldMetrics({
        retentionDays: 90,
        dryRun: true
      });

      expect(result).toHaveProperty('wouldDelete');
      expect(result).toHaveProperty('cutoffDate');
      expect(result).toHaveProperty('dryRun');
      expect(result.dryRun).toBe(true);
      expect(result.wouldDelete).toBeGreaterThan(0);
    });

    test('should delete old metrics when not in dry run', async () => {
      // Create old metrics
      const oldMetrics = [
        {
          name: 'old_metric_to_delete',
          value: 100,
          timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
          source: { service: 'test', instance: 'test', host: 'test' }
        }
      ];

      await Metric.insertMany(oldMetrics);

      const result = await MetricsService.cleanupOldMetrics({
        retentionDays: 90,
        dryRun: false
      });

      expect(result).toHaveProperty('deleted');
      expect(result).toHaveProperty('cutoffDate');
      expect(result).toHaveProperty('retentionDays');
      expect(result.deleted).toBeGreaterThan(0);

      // Verify metrics were actually deleted
      const remainingOldMetrics = await Metric.find({ name: 'old_metric_to_delete' });
      expect(remainingOldMetrics).toHaveLength(0);
    });
  });

  describe('parseInterval', () => {
    test('should parse different interval formats correctly', () => {
      expect(MetricsService.parseInterval('30s')).toBe(30 * 1000);
      expect(MetricsService.parseInterval('5m')).toBe(5 * 60 * 1000);
      expect(MetricsService.parseInterval('2h')).toBe(2 * 60 * 60 * 1000);
      expect(MetricsService.parseInterval('1d')).toBe(24 * 60 * 60 * 1000);
    });

    test('should throw error for invalid interval format', () => {
      expect(() => MetricsService.parseInterval('invalid')).toThrow('Invalid interval format');
      expect(() => MetricsService.parseInterval('5x')).toThrow('Invalid interval format');
      expect(() => MetricsService.parseInterval('')).toThrow('Invalid interval format');
    });
  });
});
