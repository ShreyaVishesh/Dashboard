/**
 * User Model Tests - DISABLED (Authentication removed)
 * This test suite has been disabled because authentication has been removed from the application.
 */

// User model removed - no authentication required
// const User = require('../../models/User');
// const bcrypt = require('bcryptjs');

describe('User Model (Disabled)', () => {
  test('should skip user model tests - authentication disabled', () => {
    console.log('User model tests skipped - authentication has been removed');
    expect(true).toBe(true);
  });

  // Original tests disabled - leaving structure for reference
  xdescribe('User Creation', () => {
    test('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isActive).toBe(true); // Default value
      expect(savedUser.createdAt).toBeDefined();
    });

    test('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password.startsWith('$2')).toBe(true); // bcrypt hash format ($2a$ or $2b$)
    });

    test('should fail validation with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail validation with short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail validation with invalid role', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid-role'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      await User.create(userData);

      // Try to create another user with same username
      const duplicateUser = {
        ...userData,
        email: 'different@example.com'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer'
      };

      await User.create(userData);

      // Try to create another user with same email
      const duplicateUser = {
        ...userData,
        username: 'differentuser'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = await global.testUtils.createTestUser({
        username: 'methodtest',
        email: 'method@example.com',
        password: 'password123'
      });
    });

    test('comparePassword should return true for correct password', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    test('comparePassword should return false for incorrect password', async () => {
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    test('generateApiKey should create a new API key', async () => {
      const apiKeyData = await user.generateApiKey('Test API Key');
      
      expect(apiKeyData.key).toBeDefined();
      expect(apiKeyData.name).toBe('Test API Key');
      expect(apiKeyData.key.length).toBe(64); // 32 bytes in hex = 64 characters
      expect(user.apiKeys).toHaveLength(1);
      expect(user.apiKeys[0].name).toBe('Test API Key');
    });

    test('revokeApiKey should remove API key', async () => {
      const apiKeyData = await user.generateApiKey('Test API Key');
      const keyId = user.apiKeys[0]._id;
      
      await user.revokeApiKey(keyId);
      
      expect(user.apiKeys).toHaveLength(0);
    });

    test('updateLastLogin should update lastLogin timestamp', async () => {
      const beforeLogin = user.lastLogin;
      await user.updateLastLogin();
      
      expect(user.lastLogin).toBeDefined();
      expect(user.lastLogin).not.toBe(beforeLogin);
    });

    test('toJSON should exclude sensitive fields', () => {
      const json = user.toJSON();
      
      expect(json.password).toBeUndefined();
      expect(json.apiKeys).toBeUndefined();
      expect(json.loginAttempts).toBeUndefined();
      expect(json.lockUntil).toBeUndefined();
      expect(json.username).toBeDefined();
      expect(json.email).toBeDefined();
    });

    test('hasPermission should check user permissions correctly', async () => {
      // Create admin user
      const adminUser = await global.testUtils.createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'admin']
      });

      expect(adminUser.hasPermission('read')).toBe(true);
      expect(adminUser.hasPermission('write')).toBe(true);
      expect(adminUser.hasPermission('admin')).toBe(true);
      expect(adminUser.hasPermission('nonexistent')).toBe(false);

      // Create viewer user
      const viewerUser = await global.testUtils.createTestUser({
        username: 'viewer',
        email: 'viewer@example.com',
        role: 'viewer',
        permissions: ['read']
      });

      expect(viewerUser.hasPermission('read')).toBe(true);
      expect(viewerUser.hasPermission('write')).toBe(false);
      expect(viewerUser.hasPermission('admin')).toBe(false);
    });
  });

  describe('User Statics', () => {
    beforeEach(async () => {
      // Create test users
      await global.testUtils.createTestUser({
        username: 'user1',
        email: 'user1@example.com',
        role: 'admin',
        isActive: true
      });

      await global.testUtils.createTestUser({
        username: 'user2',
        email: 'user2@example.com',
        role: 'operator',
        isActive: false
      });

      await global.testUtils.createTestUser({
        username: 'user3',
        email: 'user3@example.com',
        role: 'viewer',
        isActive: true
      });
    });

    test('findByUsernameOrEmail should find user by username', async () => {
      const user = await User.findByUsernameOrEmail('user1');
      expect(user).toBeTruthy();
      expect(user.username).toBe('user1');
    });

    test('findByUsernameOrEmail should find user by email', async () => {
      const user = await User.findByUsernameOrEmail('user1@example.com');
      expect(user).toBeTruthy();
      expect(user.email).toBe('user1@example.com');
    });

    test('findByUsernameOrEmail should return null for non-existent user', async () => {
      const user = await User.findByUsernameOrEmail('nonexistent');
      expect(user).toBe(null);
    });

    test('findActiveUsers should return only active users', async () => {
      const activeUsers = await User.findActiveUsers();
      expect(activeUsers).toHaveLength(2);
      activeUsers.forEach(user => {
        expect(user.isActive).toBe(true);
      });
    });

    test('findByRole should return users with specific role', async () => {
      const adminUsers = await User.findByRole('admin');
      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0].role).toBe('admin');

      const viewerUsers = await User.findByRole('viewer');
      expect(viewerUsers).toHaveLength(1);
      expect(viewerUsers[0].role).toBe('viewer');
    });

    test('getUserStats should return correct statistics', async () => {
      const stats = await User.getUserStats();
      
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
      expect(stats.byRole.admin).toBe(1);
      expect(stats.byRole.operator).toBe(1);
      expect(stats.byRole.viewer).toBe(1);
    });
  });

  describe('Password Security', () => {
    test('should increment login attempts on failed login', async () => {
      const user = await global.testUtils.createTestUser();
      
      // Simulate failed login attempts
      user.loginAttempts = 1;
      await user.save();
      
      expect(user.loginAttempts).toBe(1);
    });

    test('should lock account after max login attempts', async () => {
      const user = await global.testUtils.createTestUser();
      
      // Set max login attempts
      user.loginAttempts = 5;
      user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      await user.save();
      
      expect(user.lockUntil).toBeDefined();
    });

    test('should reset login attempts on successful login', async () => {
      const user = await global.testUtils.createTestUser();
      
      user.loginAttempts = 3;
      await user.save();
      
      // Simulate successful login
      await user.updateLastLogin();
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
      
      expect(user.loginAttempts).toBe(0);
      expect(user.lockUntil).toBeUndefined();
    });
  });

  describe('API Key Management', () => {
    let user;

    beforeEach(async () => {
      user = await global.testUtils.createTestUser();
    });

    test('should generate multiple API keys', async () => {
      await user.generateApiKey('Key 1');
      await user.generateApiKey('Key 2');
      
      expect(user.apiKeys).toHaveLength(2);
      expect(user.apiKeys[0].name).toBe('Key 1');
      expect(user.apiKeys[1].name).toBe('Key 2');
      expect(user.apiKeys[0].key).not.toBe(user.apiKeys[1].key);
    });

    test('should set expiration date for API keys', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.generateApiKey('Expiring Key', expiresAt);
      
      expect(user.apiKeys[0].expiresAt).toBeDefined();
      expect(user.apiKeys[0].expiresAt.getTime()).toBeCloseTo(expiresAt.getTime(), -1000);
    });

    test('should track API key usage', async () => {
      await user.generateApiKey('Usage Key');
      const apiKey = user.apiKeys[0];
      
      // Simulate API key usage
      apiKey.lastUsed = new Date();
      apiKey.usageCount = 5;
      await user.save();
      
      expect(user.apiKeys[0].lastUsed).toBeDefined();
      expect(user.apiKeys[0].usageCount).toBe(5);
    });
  });
});
