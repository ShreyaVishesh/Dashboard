#!/usr/bin/env node

/**
 * Database Initialization Script
 * Initializes the database with default data and configurations
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model removed - no authentication required
// const User = require('../models/User');
const { AlertRule, SystemEvent } = require('../models/Monitoring');

async function initDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard_monitoring';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database');

    // User creation removed - no authentication required
    console.log('ℹ️ Skipping user creation (authentication disabled)');

    // Additional user creation removed - no authentication required

    // Create default alert rules
    const defaultRules = [
      {
        name: 'High CPU Usage',
        description: 'Alert when CPU usage exceeds 80%',
        query: 'cpu_usage_percent',
        condition: 'gt',
        threshold: 80,
        duration: '5m',
        severity: 'warning',
        isActive: true,
        labels: {
          team: 'devops',
          service: 'infrastructure'
        },
        annotations: {
          summary: 'High CPU usage detected',
          description: 'CPU usage is above 80% for more than 5 minutes'
        }
      },
      {
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds 90%',
        query: 'memory_usage_percent',
        condition: 'gt',
        threshold: 90,
        duration: '3m',
        severity: 'critical',
        isActive: true,
        labels: {
          team: 'devops',
          service: 'infrastructure'
        },
        annotations: {
          summary: 'High memory usage detected',
          description: 'Memory usage is above 90% for more than 3 minutes'
        }
      },
      {
        name: 'Disk Space Low',
        description: 'Alert when disk space is below 10%',
        query: 'disk_free_percent',
        condition: 'lt',
        threshold: 10,
        duration: '1m',
        severity: 'critical',
        isActive: true,
        labels: {
          team: 'devops',
          service: 'infrastructure'
        },
        annotations: {
          summary: 'Low disk space detected',
          description: 'Free disk space is below 10%'
        }
      },
      {
        name: 'HTTP Error Rate High',
        description: 'Alert when HTTP error rate exceeds 5%',
        query: 'http_error_rate',
        condition: 'gt',
        threshold: 5,
        duration: '2m',
        severity: 'warning',
        isActive: true,
        labels: {
          team: 'backend',
          service: 'api'
        },
        annotations: {
          summary: 'High HTTP error rate detected',
          description: 'HTTP error rate is above 5% for more than 2 minutes'
        }
      },
      {
        name: 'Response Time Slow',
        description: 'Alert when average response time exceeds 2 seconds',
        query: 'http_response_time_avg',
        condition: 'gt',
        threshold: 2000,
        duration: '5m',
        severity: 'warning',
        isActive: true,
        labels: {
          team: 'backend',
          service: 'api'
        },
        annotations: {
          summary: 'Slow response time detected',
          description: 'Average response time is above 2 seconds for more than 5 minutes'
        }
      }
    ];

    for (const ruleData of defaultRules) {
      const existingRule = await AlertRule.findOne({ name: ruleData.name });
      if (!existingRule) {
        await AlertRule.create(ruleData);
        console.log(`✅ Created alert rule: ${ruleData.name}`);
      } else {
        console.log(`ℹ️ Alert rule already exists: ${ruleData.name}`);
      }
    }

    // Create initialization system event
    await SystemEvent.create({
      level: 'info',
      message: 'Database initialization completed successfully',
      service: 'dashboard',
      timestamp: new Date(),
      correlationId: `init-${Date.now()}`,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        initializedBy: 'system'
      }
    });

    console.log('✅ Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Users: 0 (authentication disabled)');
    console.log(`- Alert Rules: ${await AlertRule.countDocuments()}`);
    console.log(`- System Events: ${await SystemEvent.countDocuments()}`);

    console.log('\n🔐 Authentication Status:');
    console.log('- Authentication: DISABLED');
    console.log('- All endpoints accessible without credentials');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
