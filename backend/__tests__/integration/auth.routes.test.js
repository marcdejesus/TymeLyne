const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bcrypt = require('bcryptjs');
const Profile = require('../../models/profile');
const authRoutes = require('../../routes/auth');
const dbHandler = require('../utils/db-setup');

// Mock dependencies
jest.mock('../../utils/emailService', () => require('../utils/email-mock'));
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mockedVerificationToken')
  }),
  createHash: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash')
  })),
  randomFillSync: jest.fn()
}));
// Mock uuid if needed
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-user-id')
}));

// Setup app with routes for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Connect to a test database before running any tests
let mongoServer;
beforeAll(async () => {
  await dbHandler.connect();
  process.env.JWT_SECRET = 'test_jwt_secret';
});

// Clear all test data after every test
afterEach(async () => {
  await dbHandler.clearDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Auth Routes - Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        fName: 'New',
        lName: 'User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      
      // Verify user was created in database
      const savedUser = await Profile.findOne({ email: 'newuser@example.com' });
      expect(savedUser).toBeTruthy();
      expect(savedUser.is_verified).toBe(false);
      expect(savedUser.verification_token).toBeTruthy();
    });
    
    it('should return 400 if email already exists', async () => {
      // Create a user first
      await new Profile({
        user_id: 'existing-id',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'hashedpassword',
      }).save();
      
      const userData = {
        email: 'existing@example.com', // Same email
        username: 'differentuser',
        password: 'password123',
        fName: 'Different',
        lName: 'User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });
    
    it('should return 400 if username already exists', async () => {
      // Create a user first
      await new Profile({
        user_id: 'existing-id',
        email: 'someuser@example.com',
        username: 'takenusername',
        password: 'hashedpassword',
      }).save();
      
      const userData = {
        email: 'different@example.com', 
        username: 'takenusername', // Same username
        password: 'password123',
        fName: 'Different',
        lName: 'User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Username is already taken');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a verified user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('correctpassword', salt);
      
      await new Profile({
        user_id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        is_verified: true
      }).save();
      
      // Create an unverified user
      await new Profile({
        user_id: 'unverified-user-id',
        email: 'unverified@example.com',
        username: 'unverifieduser',
        password: hashedPassword,
        is_verified: false
      }).save();
    });
    
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'correctpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('user_id', 'test-user-id');
    });
    
    it('should reject login for unverified users', async () => {
      const loginData = {
        email: 'unverified@example.com',
        password: 'correctpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body).toHaveProperty('message', 'Email not verified. Please verify your email before logging in.');
      expect(response.body).toHaveProperty('needsVerification', true);
    });
    
    it('should reject login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/verify/:token', () => {
    let validToken;
    
    beforeEach(async () => {
      validToken = 'valid-verification-token';
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Create user with verification token
      await new Profile({
        user_id: 'user-to-verify',
        email: 'toverify@example.com',
        username: 'toverify',
        password: 'hashedpassword',
        is_verified: false,
        verification_token: validToken,
        verification_token_expires: expiryDate
      }).save();
      
      // Create user with expired token
      const expiredDate = new Date(Date.now() - 1000); // In the past
      await new Profile({
        user_id: 'expired-token-user',
        email: 'expired@example.com',
        username: 'expiredtoken',
        password: 'hashedpassword',
        is_verified: false,
        verification_token: 'expired-token',
        verification_token_expires: expiredDate
      }).save();
    });
    
    it('should verify user with valid token', async () => {
      const response = await request(app)
        .get(`/api/auth/verify/${validToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Email verification successful. You can now log in.');
      expect(response.body).toHaveProperty('verified', true);
      
      // Check user is now verified in database
      const verifiedUser = await Profile.findOne({ user_id: 'user-to-verify' });
      expect(verifiedUser.is_verified).toBe(true);
      expect(verifiedUser.verification_token).toBeUndefined();
    });
    
    it('should reject verification with expired token', async () => {
      const response = await request(app)
        .get('/api/auth/verify/expired-token')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid or expired verification token');
      
      // User should still be unverified
      const user = await Profile.findOne({ user_id: 'expired-token-user' });
      expect(user.is_verified).toBe(false);
    });
    
    it('should reject verification with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify/invalid-token-that-doesnt-exist')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid or expired verification token');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    beforeEach(async () => {
      // Create unverified user
      await new Profile({
        user_id: 'unverified-user-id',
        email: 'needsverification@example.com',
        username: 'needsverify',
        password: 'hashedpassword',
        is_verified: false,
        verification_token: 'old-token',
        verification_token_expires: new Date(Date.now() - 1000) // Expired
      }).save();
      
      // Create already verified user
      await new Profile({
        user_id: 'verified-user-id',
        email: 'alreadyverified@example.com',
        username: 'verifieduser',
        password: 'hashedpassword',
        is_verified: true
      }).save();
    });
    
    it('should resend verification email for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'needsverification@example.com' })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Verification email sent successfully');
      
      // Check token has been updated
      const updatedUser = await Profile.findOne({ email: 'needsverification@example.com' });
      expect(updatedUser.verification_token).toBe('mockedVerificationToken');
      expect(updatedUser.verification_token_expires).toBeDefined();
      expect(updatedUser.is_verified).toBe(false);
    });
    
    it('should return error for already verified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'alreadyverified@example.com' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Email already verified');
    });
    
    it('should return error for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });
}); 