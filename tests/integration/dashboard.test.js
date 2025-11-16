/**
 * Integration Tests
 * Comprehensive end-to-end testing of the Dashboard Monitoring System
 */

const request = require('supertest');
const app = require('../../app');
// User model removed - no authentication required
// const User = require('../../models/User');
const { Metric, AlertRule } = require('../../models/Monitoring');

describe('Dashboard Integration Tests', () => {
  let adminToken, operatorToken, viewerToken;
  let testUser, testMetrics, testAlertRule;

  beforeAll(async () => {
    // Create test users
    const adminUser = await global.testUtils.createTestUser({
      username: 'integrationadmin',
      email: 'admin@integration.test',
      role: 'admin',
      permissions: ['read', 'write', 'admin']
    });

    const operatorUser = await global.testUtils.createTestUser({
      username: 'integrationoperator',
      email: 'operator@integration.test',
      role: 'operator',
      permissions: ['read', 'write']
    });

    const viewerUser = await global.testUtils.createTestUser({
      username: 'integrationviewer',
      email: 'viewer@integration.test',
      role: 'viewer',
      permissions: ['read']
    });

    // Generate tokens
    adminToken = await global.testUtils.createTestToken(adminUser);
    operatorToken = await global.testUtils.createTestToken(operatorUser);
    viewerToken = await global.testUtils.createTestToken(viewerUser);

    testUser = adminUser;
  });

  describe('Authentication Flow', () => {
    test('should complete full authentication cycle', async () => {
      // Register new user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newintegrationuser',
          email: 'newuser@integration.test',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'viewer'
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // Login with new user
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'newintegrationuser',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      const userToken = loginResponse.body.data.token;

      // Get profile
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(profileResponse.body.data.user.username).toBe('newintegrationuser');

      // Update profile
      const updateResponse = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          profile: {
            firstName: 'Integration',
            lastName: 'User'
          }
        })
        .expect(200);

      expect(updateResponse.body.data.user.profile.firstName).toBe('Integration');

      // Logout
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('User Management Flow', () => {
    test('should manage users with proper authorization', async () => {
      // Admin can list all users
      const listResponse = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.users.length).toBeGreaterThan(0);

      // Admin can create user
      const createResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'manageduser',
          email: 'managed@integration.test',
          password: 'password123',
          role: 'operator'
        })
        .expect(201);

      const createdUserId = createResponse.body.data.user._id;

      // Admin can get specific user
      const getUserResponse = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(getUserResponse.body.data.user.username).toBe('manageduser');

      // Admin can update user
      const updateResponse = await request(app)
        .put(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'viewer',
          isActive: false
        })
        .expect(200);

      expect(updateResponse.body.data.user.role).toBe('viewer');
      expect(updateResponse.body.data.user.isActive).toBe(false);

      // Operator should not be able to create users
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          username: 'unauthorizeduser',
          email: 'unauthorized@integration.test',
          password: 'password123',
          role: 'viewer'
        })
        .expect(403);

      // Viewer should not be able to list users
      await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });

  describe('Metrics Management Flow', () => {
    beforeEach(async () => {
      // Create test metrics
      testMetrics = await global.testUtils.createTestMetrics(10);
    });

    test('should handle metrics CRUD operations', async () => {
      // Submit new metrics
      const metricsData = [
        {
          name: 'integration_test_metric',
          type: 'gauge',
          value: 75.5,
          timestamp: new Date().toISOString(),
          source: {
            service: 'integration-test',
            instance: 'test-1',
            host: 'localhost'
          },
          labels: {
            environment: 'test',
            version: '1.0.0'
          }
        }
      ];

      const submitResponse = await request(app)
        .post('/api/v1/monitoring/metrics')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(metricsData)
        .expect(201);

      expect(submitResponse.body.success).toBe(true);

      // Query metrics
      const queryResponse = await request(app)
        .get('/api/v1/monitoring/metrics')
        .set('Authorization', `Bearer ${viewerToken}`)
        .query({
          name: 'integration_test_metric',
          limit: 10
        })
        .expect(200);

      expect(queryResponse.body.success).toBe(true);
      expect(queryResponse.body.data.length).toBeGreaterThan(0);

      // Get metrics statistics
      const statsResponse = await request(app)
        .get('/api/v1/analytics/metrics/stats')
        .set('Authorization', `Bearer ${viewerToken}`)
        .query({
          timeWindow: '1h'
        })
        .expect(200);

      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.data.overview).toBeDefined();

      // Aggregate metrics
      const aggregateResponse = await request(app)
        .get('/api/v1/analytics/metrics/aggregate')
        .set('Authorization', `Bearer ${viewerToken}`)
        .query({
          metric: 'test_metric_0',
          interval: '5m',
          aggregation: 'avg'
        })
        .expect(200);

      expect(aggregateResponse.body.success).toBe(true);
    });
  });

  describe('Alert Management Flow', () => {
    beforeEach(async () => {
      // Create test alert rule
      testAlertRule = await global.testUtils.createTestAlertRule({
        name: 'Integration Test Alert',
        query: 'integration_test_metric',
        condition: 'gt',
        threshold: 80,
        severity: 'warning'
      });
    });

    test('should manage alert rules and instances', async () => {
      // Create alert rule
      const createRuleResponse = await request(app)
        .post('/api/v1/monitoring/alert-rules')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'New Integration Alert',
          description: 'Test alert for integration',
          query: 'test_metric',
          condition: 'gt',
          threshold: 90,
          duration: '5m',
          severity: 'critical',
          labels: {
            team: 'integration'
          },
          annotations: {
            summary: 'Integration test alert'
          }
        })
        .expect(201);

      const createdRuleId = createRuleResponse.body.data.alertRule._id;

      // List alert rules
      const listRulesResponse = await request(app)
        .get('/api/v1/monitoring/alert-rules')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(listRulesResponse.body.success).toBe(true);
      expect(listRulesResponse.body.data.length).toBeGreaterThan(0);

      // Get specific alert rule
      const getRuleResponse = await request(app)
        .get(`/api/v1/monitoring/alert-rules/${createdRuleId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(getRuleResponse.body.data.name).toBe('New Integration Alert');

      // Update alert rule
      const updateRuleResponse = await request(app)
        .put(`/api/v1/monitoring/alert-rules/${createdRuleId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          threshold: 95,
          isActive: false
        })
        .expect(200);

      expect(updateRuleResponse.body.data.threshold).toBe(95);
      expect(updateRuleResponse.body.data.isActive).toBe(false);

      // Test alert rule
      const testRuleResponse = await request(app)
        .post('/api/v1/analytics/alerts/test-rule')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          rule: {
            name: 'Test Rule',
            query: 'test_metric_0',
            condition: 'gt',
            threshold: 50,
            duration: '1m'
          },
          options: {
            from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
            interval: '5m'
          }
        })
        .expect(200);

      expect(testRuleResponse.body.success).toBe(true);
      expect(testRuleResponse.body.data.rule).toBeDefined();

      // Get alert statistics
      const alertStatsResponse = await request(app)
        .get('/api/v1/analytics/alerts/stats')
        .set('Authorization', `Bearer ${viewerToken}`)
        .query({
          timeWindow: '24h'
        })
        .expect(200);

      expect(alertStatsResponse.body.success).toBe(true);
      expect(alertStatsResponse.body.data.overview).toBeDefined();
    });
  });

  describe('System Health and Analytics', () => {
    test('should provide comprehensive system health data', async () => {
      // Get system health
      const healthResponse = await request(app)
        .get('/api/v1/analytics/system/health')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(healthResponse.body.success).toBe(true);
      expect(healthResponse.body.data.services).toBeDefined();
      expect(healthResponse.body.data.system).toBeDefined();
      expect(healthResponse.body.data.overall).toBeDefined();

      expect(healthResponse.body.data.services.database).toHaveProperty('status');
      expect(healthResponse.body.data.services.metrics).toHaveProperty('status');
      expect(healthResponse.body.data.services.alerts).toHaveProperty('status');

      expect(healthResponse.body.data.system.uptime).toBeGreaterThan(0);
      expect(healthResponse.body.data.system.memory).toBeDefined();

      expect(healthResponse.body.data.overall.status).toBeDefined();
      expect(healthResponse.body.data.overall.score).toBeGreaterThanOrEqual(0);
    });

    test('should calculate percentiles for metrics', async () => {
      // Create metrics with known values for percentile testing
      const knownMetrics = [];
      for (let i = 1; i <= 100; i++) {
        knownMetrics.push({
          name: 'percentile_test_metric',
          type: 'gauge',
          value: i, // Values 1-100
          timestamp: new Date(Date.now() - i * 1000),
          source: {
            service: 'test',
            instance: 'test',
            host: 'test'
          },
          labels: {}
        });
      }

      await Metric.insertMany(knownMetrics);

      const percentilesResponse = await request(app)
        .get('/api/v1/analytics/metrics/percentiles')
        .set('Authorization', `Bearer ${viewerToken}`)
        .query({
          metric: 'percentile_test_metric',
          percentiles: '50,90,95,99'
        })
        .expect(200);

      expect(percentilesResponse.body.success).toBe(true);
      expect(percentilesResponse.body.data.percentiles).toBeDefined();
      expect(percentilesResponse.body.data.percentiles.p50).toBeCloseTo(50, 0);
      expect(percentilesResponse.body.data.percentiles.p90).toBeCloseTo(90, 0);
      expect(percentilesResponse.body.data.percentiles.p95).toBeCloseTo(95, 0);
      expect(percentilesResponse.body.data.percentiles.p99).toBeCloseTo(99, 0);
    });
  });

  describe('API Key Authentication', () => {
    let apiKey;

    test('should authenticate with API key', async () => {
      // Generate API key
      const apiKeyResponse = await request(app)
        .post('/api/v1/users/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integration Test Key',
          expiresIn: '30d'
        })
        .expect(201);

      apiKey = apiKeyResponse.body.data.key;

      // Use API key for authentication
      const metricsResponse = await request(app)
        .get('/api/v1/monitoring/metrics')
        .set('X-API-Key', apiKey)
        .query({
          limit: 5
        })
        .expect(200);

      expect(metricsResponse.body.success).toBe(true);

      // Revoke API key
      const revokeResponse = await request(app)
        .delete(`/api/v1/users/api-keys/${apiKeyResponse.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(revokeResponse.body.success).toBe(true);

      // Try to use revoked API key
      await request(app)
        .get('/api/v1/monitoring/metrics')
        .set('X-API-Key', apiKey)
        .expect(401);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle various error scenarios gracefully', async () => {
      // Invalid JSON in request body
      await request(app)
        .post('/api/v1/monitoring/metrics')
        .set('Authorization', `Bearer ${operatorToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Missing required fields
      await request(app)
        .post('/api/v1/monitoring/alert-rules')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          name: 'Incomplete Rule'
          // Missing required fields
        })
        .expect(400);

      // Unauthorized access
      await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      // Non-existent resource
      await request(app)
        .get('/api/v1/users/507f1f77bcf86cd799439011') // Valid ObjectId but doesn't exist
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // Invalid ObjectId format
      await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    test('should handle rate limiting', async () => {
      // This test would require actual rate limiting to be enforced
      // For now, we just verify the rate limiting middleware is in place
      const response = await request(app)
        .get('/api/v1/monitoring/metrics')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Data Consistency and Validation', () => {
    test('should maintain data consistency across operations', async () => {
      // Create user
      const createUserResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'consistencytest',
          email: 'consistency@test.com',
          password: 'password123',
          role: 'operator'
        })
        .expect(201);

      const userId = createUserResponse.body.data.user._id;

      // Verify user exists in database
      const user = await User.findById(userId);
      expect(user).toBeTruthy();
      expect(user.username).toBe('consistencytest');

      // Update user
      await request(app)
        .put(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'viewer'
        })
        .expect(200);

      // Verify update in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.role).toBe('viewer');

      // Delete user (deactivate)
      await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deactivated
      const deactivatedUser = await User.findById(userId);
      expect(deactivatedUser.isActive).toBe(false);
    });
  });
});
