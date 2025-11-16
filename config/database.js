// Database Configuration with MongoDB and Mongoose
const mongoose = require('mongoose');
const logger = require('./logger');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  // MongoDB connection configuration
  getConnectionOptions() {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 1,
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000,
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
      heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY) || 10000,
      retryWrites: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 5000
      },
      readPreference: 'primaryPreferred',
      authSource: process.env.DB_AUTH_SOURCE || 'admin',
    };
  }

  // Get database connection string
  getConnectionString() {
    const {
      DB_HOST = 'localhost',
      DB_PORT = '27017',
      DB_NAME = 'dashboard_monitoring',
      DB_USERNAME,
      DB_PASSWORD,
      DB_REPLICA_SET,
      DB_SSL = 'false',
    } = process.env;

    let connectionString = 'mongodb://';
    
    if (DB_USERNAME && DB_PASSWORD) {
      connectionString += `${DB_USERNAME}:${DB_PASSWORD}@`;
    }
    
    connectionString += `${DB_HOST}:${DB_PORT}/${DB_NAME}`;

    // Add connection options
    const params = [];
    if (DB_REPLICA_SET) {
      params.push(`replicaSet=${DB_REPLICA_SET}`);
    }
    if (DB_SSL === 'true') {
      params.push('ssl=true');
    }

    if (params.length > 0) {
      connectionString += `?${params.join('&')}`;
    }

    return connectionString;
  }

  // Connect to MongoDB
  async connect() {
    try {
      const connectionString = this.getConnectionString();
      const options = this.getConnectionOptions();

      logger.info('🔗 Attempting to connect to MongoDB...', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '27017',
        database: process.env.DB_NAME || 'dashboard_monitoring',
      });

      this.connection = await mongoose.connect(connectionString, options);
      this.isConnected = true;
      this.retryCount = 0;

      logger.info('✅ Successfully connected to MongoDB', {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      });

      // Setup event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      this.isConnected = false;
      logger.error('❌ Failed to connect to MongoDB:', {
        error: error.message,
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
      });

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.info(`⏳ Retrying connection in ${this.retryDelay / 1000} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
      }
    }
  }

  // Setup MongoDB event listeners
  setupEventListeners() {
    const db = mongoose.connection;

    db.on('connected', () => {
      logger.info('📡 MongoDB connected successfully');
      this.isConnected = true;
    });

    db.on('error', (error) => {
      logger.error('💥 MongoDB connection error:', error);
      this.isConnected = false;
    });

    db.on('disconnected', () => {
      logger.warn('📡 MongoDB disconnected');
      this.isConnected = false;
    });

    db.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected successfully');
      this.isConnected = true;
    });

    // Handle application termination
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      this.gracefulShutdown('SIGTERM');
    });
  }

  // Graceful shutdown
  async gracefulShutdown(signal) {
    logger.info(`📡 Received ${signal}. Closing MongoDB connection...`);
    
    try {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed successfully');
    } catch (error) {
      logger.error('❌ Error during MongoDB connection closure:', error);
    } finally {
      process.exit(0);
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'unhealthy', message: 'Not connected to database' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      const stats = await mongoose.connection.db.stats();
      
      return {
        status: 'healthy',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState,
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexes: stats.indexes,
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: error.message,
      };
    }
  }

  // Get connection status
  getStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      isConnected: this.isConnected,
      readyState: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }

  // Database operations wrapper with error handling and logging
  async executeOperation(operationName, operation) {
    const startTime = Date.now();
    
    try {
      logger.debug(`🔍 Executing database operation: ${operationName}`);
      const result = await operation();
      const duration = Date.now() - startTime;
      
      logger.debug(`✅ Database operation completed: ${operationName}`, {
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ Database operation failed: ${operationName}`, {
        duration: `${duration}ms`,
        error: error.message,
      });
      throw error;
    }
  }
}

// Create and export database manager instance
const dbManager = new DatabaseManager();

module.exports = {
  dbManager,
  mongoose,
  connect: () => dbManager.connect(),
  healthCheck: () => dbManager.healthCheck(),
  getStatus: () => dbManager.getStatus(),
};
