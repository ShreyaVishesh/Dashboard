/**
 * MongoDB Initialization Script for Dashboard Monitoring System
 * This script creates the initial database structure, indexes, and admin user
 */

// Switch to the dashboard_monitoring database
db = db.getSiblingDB('dashboard_monitoring');

// Create collections with validation schemas
try {
    // Users collection with validation
    db.createCollection("users", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["username", "email", "password", "role"],
                properties: {
                    username: {
                        bsonType: "string",
                        minLength: 3,
                        maxLength: 50,
                        description: "Username must be a string between 3-50 characters"
                    },
                    email: {
                        bsonType: "string",
                        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                        description: "Email must be a valid email address"
                    },
                    password: {
                        bsonType: "string",
                        minLength: 8,
                        description: "Password must be at least 8 characters"
                    },
                    role: {
                        bsonType: "string",
                        enum: ["admin", "operator", "viewer"],
                        description: "Role must be one of admin, operator, or viewer"
                    },
                    isActive: {
                        bsonType: "bool",
                        description: "User active status"
                    },
                    lastLogin: {
                        bsonType: "date",
                        description: "Last login timestamp"
                    }
                }
            }
        }
    });

    // Metrics collection
    db.createCollection("metrics", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "value", "timestamp", "labels"],
                properties: {
                    name: {
                        bsonType: "string",
                        description: "Metric name is required"
                    },
                    value: {
                        bsonType: "number",
                        description: "Metric value must be a number"
                    },
                    timestamp: {
                        bsonType: "date",
                        description: "Timestamp is required"
                    },
                    labels: {
                        bsonType: "object",
                        description: "Labels object for metric categorization"
                    }
                }
            }
        }
    });

    // Alert rules collection
    db.createCollection("alertrules", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "query", "condition", "threshold", "severity"],
                properties: {
                    name: {
                        bsonType: "string",
                        description: "Alert rule name is required"
                    },
                    query: {
                        bsonType: "string",
                        description: "Prometheus query is required"
                    },
                    condition: {
                        bsonType: "string",
                        enum: ["gt", "lt", "eq", "ne", "gte", "lte"],
                        description: "Condition must be a valid operator"
                    },
                    threshold: {
                        bsonType: "number",
                        description: "Threshold must be a number"
                    },
                    severity: {
                        bsonType: "string",
                        enum: ["critical", "warning", "info"],
                        description: "Severity must be critical, warning, or info"
                    }
                }
            }
        }
    });

    // Alert instances collection
    db.createCollection("alertinstances");

    // System events collection
    db.createCollection("systemevents");

    print("✅ Collections created successfully");

    // Create indexes for better performance
    
    // Users indexes
    db.users.createIndex({ "username": 1 }, { unique: true });
    db.users.createIndex({ "email": 1 }, { unique: true });
    db.users.createIndex({ "apiKeys.key": 1 }, { sparse: true });
    db.users.createIndex({ "role": 1 });
    db.users.createIndex({ "isActive": 1 });

    // Metrics indexes
    db.metrics.createIndex({ "name": 1, "timestamp": -1 });
    db.metrics.createIndex({ "timestamp": -1 });
    db.metrics.createIndex({ "labels.instance": 1 });
    db.metrics.createIndex({ "labels.job": 1 });
    
    // Compound index for time-series queries
    db.metrics.createIndex({ 
        "name": 1, 
        "labels.instance": 1, 
        "timestamp": -1 
    });

    // Alert rules indexes
    db.alertrules.createIndex({ "name": 1 }, { unique: true });
    db.alertrules.createIndex({ "severity": 1 });
    db.alertrules.createIndex({ "isActive": 1 });

    // Alert instances indexes
    db.alertinstances.createIndex({ "ruleId": 1 });
    db.alertinstances.createIndex({ "status": 1 });
    db.alertinstances.createIndex({ "createdAt": -1 });
    db.alertinstances.createIndex({ "severity": 1 });

    // System events indexes
    db.systemevents.createIndex({ "timestamp": -1 });
    db.systemevents.createIndex({ "level": 1 });
    db.systemevents.createIndex({ "service": 1 });
    db.systemevents.createIndex({ "correlationId": 1 });

    print("✅ Indexes created successfully");

    // Create TTL indexes for data retention
    
    // Metrics retention: 90 days
    db.metrics.createIndex(
        { "timestamp": 1 }, 
        { expireAfterSeconds: 90 * 24 * 60 * 60 }
    );

    // Alert instances retention: 30 days for resolved alerts
    db.alertinstances.createIndex(
        { "resolvedAt": 1 }, 
        { 
            expireAfterSeconds: 30 * 24 * 60 * 60,
            partialFilterExpression: { "status": "resolved" }
        }
    );

    // System events retention: 30 days
    db.systemevents.createIndex(
        { "timestamp": 1 }, 
        { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );

    print("✅ TTL indexes created successfully");

    // Create default admin user
    const adminUser = {
        username: "admin",
        email: "admin@dashboard.local",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6MJj8/r9d6", // bcrypt hash of 'admin123'
        role: "admin",
        isActive: true,
        permissions: ["read", "write", "admin"],
        profile: {
            firstName: "System",
            lastName: "Administrator",
            department: "IT Operations",
            timezone: "UTC"
        },
        apiKeys: [],
        lastLogin: null,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Insert admin user if doesn't exist
    const existingAdmin = db.users.findOne({ username: "admin" });
    if (!existingAdmin) {
        db.users.insertOne(adminUser);
        print("✅ Default admin user created (username: admin, password: admin123)");
    } else {
        print("ℹ️ Admin user already exists, skipping creation");
    }

    // Create sample alert rules
    const sampleAlertRules = [
        {
            name: "High CPU Usage",
            description: "Alert when CPU usage exceeds 80%",
            query: "node_cpu_usage_percent",
            condition: "gt",
            threshold: 80,
            duration: "5m",
            severity: "warning",
            isActive: true,
            labels: {
                team: "devops",
                service: "infrastructure"
            },
            annotations: {
                summary: "High CPU usage detected",
                description: "CPU usage is above 80% for more than 5 minutes"
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: "High Memory Usage",
            description: "Alert when memory usage exceeds 90%",
            query: "node_memory_usage_percent",
            condition: "gt",
            threshold: 90,
            duration: "3m",
            severity: "critical",
            isActive: true,
            labels: {
                team: "devops",
                service: "infrastructure"
            },
            annotations: {
                summary: "High memory usage detected",
                description: "Memory usage is above 90% for more than 3 minutes"
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: "Disk Space Low",
            description: "Alert when disk space is below 10%",
            query: "node_disk_free_percent",
            condition: "lt",
            threshold: 10,
            duration: "1m",
            severity: "critical",
            isActive: true,
            labels: {
                team: "devops",
                service: "infrastructure"
            },
            annotations: {
                summary: "Low disk space detected",
                description: "Free disk space is below 10%"
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // Insert sample alert rules
    for (const rule of sampleAlertRules) {
        const existing = db.alertrules.findOne({ name: rule.name });
        if (!existing) {
            db.alertrules.insertOne(rule);
            print(`✅ Created sample alert rule: ${rule.name}`);
        }
    }

    // Create sample system events
    const sampleEvents = [
        {
            level: "info",
            message: "Database initialization completed",
            service: "mongodb",
            timestamp: new Date(),
            correlationId: "init-" + Date.now(),
            metadata: {
                collections_created: 6,
                indexes_created: 15,
                admin_user_created: true
            }
        },
        {
            level: "info",
            message: "System startup event",
            service: "dashboard",
            timestamp: new Date(),
            correlationId: "startup-" + Date.now(),
            metadata: {
                version: "1.0.0",
                environment: "production"
            }
        }
    ];

    db.systemevents.insertMany(sampleEvents);
    print("✅ Sample system events created");

    print("\n🎉 MongoDB initialization completed successfully!");
    print("\n📊 Database Statistics:");
    print("- Collections: " + db.getCollectionNames().length);
    print("- Users: " + db.users.countDocuments());
    print("- Alert Rules: " + db.alertrules.countDocuments());
    print("- System Events: " + db.systemevents.countDocuments());

    print("\n🔐 Default Credentials:");
    print("- Username: admin");
    print("- Password: admin123");
    print("- Email: admin@dashboard.local");

} catch (error) {
    print("❌ Error during database initialization:");
    print(error);
    throw error;
}
