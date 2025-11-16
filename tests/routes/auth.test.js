/**
 * Authentication Route Tests
 * Comprehensive test suite for authentication endpoints
 */

const request = require('supertest');
const app = require('../../app');
// User model removed - no authentication required
// const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'viewer'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
      
      // Verify user was created in database
      const user = await User.findOne({ username: userData.username });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with password mismatch', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Passwords do not match');
    });

    test('should fail with duplicate username', async () => {
      // Create a user first
      await global.testUtils.createTestUser({ username: 'existinguser' });

      const userData = {
        username: 'existinguser',
        email: 'different@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should fail with weak password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser({
        username: 'loginuser',
        email: 'login@example.com'
      });
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.username).toBe(loginData.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    test('should login successfully with email', async () => {
      const loginData = {
        username: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.username);
    });

    test('should fail with invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail for inactive user', async () => {
      // Deactivate user
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const loginData = {
        username: 'loginuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is deactivated');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let testUser, authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
      authToken = await global.testUtils.createTestToken(testUser);
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let testUser, authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser({
        profile: {
          firstName: 'Test',
          lastName: 'User',
          department: 'Engineering'
        }
      });
      authToken = await global.testUtils.createTestToken(testUser);
    });

    test('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.profile.firstName).toBe('Test');
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    let testUser, authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
      authToken = await global.testUtils.createTestToken(testUser);
    });

    test('should update profile successfully', async () => {
      const updateData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          department: 'DevOps'
        }
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.firstName).toBe('Updated');
      expect(response.body.data.user.profile.department).toBe('DevOps');

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.profile.firstName).toBe('Updated');
    });

    test('should update password successfully', async () => {
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
    });

    test('should fail with incorrect current password', async () => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let testUser, refreshToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
      refreshToken = jwt.sign(
        { userId: testUser._id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });

    test('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify new token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    test('should fail without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
