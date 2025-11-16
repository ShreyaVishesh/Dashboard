/**
 * Test Setup Configuration
 * Global test setup for the Dashboard Monitoring System
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests

/**
 * Global test setup - runs once before all tests
 */
beforeAll(async () => {
  try {
    // Start in-memory MongoDB instance with increased timeout
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'dashboard_test'
      },
      binary: {
        version: '6.0.0'
      }
    });
    
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10
    });

    console.log('🗄️ Test database connected');
  } catch (error) {
    console.error('Failed to start test database:', error);
    throw error;
  }
}, 60000); // 60 seconds timeout

/**
 * Global test teardown - runs once after all tests
 */
afterAll(async () => {
  try {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    // Stop the in-memory MongoDB instance
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('🗄️ Test database disconnected');
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}, 30000); // 30 seconds timeout

/**
 * Setup before each test
 */
beforeEach(async () => {
  try {
    // Clear all collections before each test
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
}, 10000); // 10 seconds timeout

/**
 * Cleanup after each test
 */
afterEach(async () => {
  // Additional cleanup if needed
  jest.clearAllMocks();
});

// Increase timeout for async operations
jest.setTimeout(60000);

// Global test utilities
const testUtils = {
  /**
   * Create a test user
   */
  async createTestUser(userData = {}) {
    // User model removed - return mock user for testing
    const mockUser = {
      id: 'system',
      username: 'system',
      email: 'system@localhost',
      firstName: 'Test',
      lastName: 'User',
      role: 'viewer',
      isActive: true,
      ...userData
    };
    
    return mockUser;
  },

  /**
   * Create a test JWT token
   */
  async createTestToken(user) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: user.id || 'system', 
        username: user.username || 'system', 
        role: user.role || 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  /**
   * Create test metrics data
   */
  async createTestMetrics(count = 5) {
    const { Metric } = require('../models/Monitoring');
    const metrics = [];
    
    for (let i = 0; i < count; i++) {
      metrics.push({
        name: `test_metric_${i}`,
        value: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 60000), // 1 minute intervals
        labels: {
          instance: 'localhost:8000',
          job: 'dashboard',
          test: 'true'
        }
      });
    }
    
    return await Metric.insertMany(metrics);
  },

  /**
   * Create test alert rule
   */
  async createTestAlertRule(ruleData = {}) {
    const { AlertRule } = require('../models/Monitoring');
    
    const defaultRule = {
      name: `Test Alert Rule ${Date.now()}`,
      description: 'Test alert for unit testing',
      query: 'test_metric',
      condition: 'gt',
      threshold: 50,
      duration: '5m',
      severity: 'warning',
      isActive: true,
      ...ruleData
    };
    
    return await AlertRule.create(defaultRule);
  },

  /**
   * Wait for async operations
   */
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate mock request object
   */
  mockRequest(options = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      user: null,
      ...options
    };
  },

  /**
   * Generate mock response object
   */
  mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Generate mock next function
   */
  mockNext() {
    return jest.fn();
  }
};

// Make testUtils available globally
global.testUtils = testUtils;

module.exports = testUtils;
