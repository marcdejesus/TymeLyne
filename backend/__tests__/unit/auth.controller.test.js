const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Profile = require('../../models/profile');
const authController = require('../../controllers/authController');
const dbHandler = require('../utils/db-setup');

// Mock dependencies
jest.mock('../../utils/emailService', () => require('../utils/email-mock'));
jest.mock('uuid');
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
jest.mock('jsonwebtoken');

// Connect to a test database before running any tests
beforeAll(async () => {
  await dbHandler.connect();
  process.env.JWT_SECRET = 'test_jwt_secret';
});

// Clear all test data after every test
afterEach(async () => {
  await dbHandler.clearDatabase();
  jest.clearAllMocks();
});

// Close database connection after all tests
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Auth Controller - Register', () => {
  beforeEach(() => {
    // Mock uuid to return consistent value
    uuidv4.mockReturnValue('mocked-user-id');
    // Mock JWT sign function
    jwt.sign.mockReturnValue('mocked-jwt-token');
  });

  it('should register a new user successfully', async () => {
    const req = {
      body: {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        fName: 'New',
        lName: 'User'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.register(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('token', 'mocked-jwt-token');
    expect(res.json.mock.calls[0][0]).toHaveProperty('message');
    expect(res.json.mock.calls[0][0].user).toHaveProperty('user_id', 'mocked-user-id');
    
    // Verify user was created in database
    const savedUser = await Profile.findOne({ email: 'new@example.com' });
    expect(savedUser).toBeTruthy();
    expect(savedUser.is_verified).toBe(false);
    expect(savedUser.verification_token).toBe('mockedVerificationToken');
  });

  it('should return error if email already exists', async () => {
    // Create a user first
    await new Profile({
      user_id: 'existing-id',
      email: 'existing@example.com',
      username: 'existinguser',
      password: 'hashedpassword',
    }).save();
    
    const req = {
      body: {
        email: 'existing@example.com', // Same email
        username: 'newuser',
        password: 'password123',
        fName: 'New',
        lName: 'User'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.register(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'User with this email already exists'
    }));
  });
});

describe('Auth Controller - Login', () => {
  beforeEach(async () => {
    // Create a verified user for login tests
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('validpassword', salt);
    
    await new Profile({
      user_id: 'valid-user-id',
      email: 'valid@example.com',
      username: 'validuser',
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
    
    // Mock JWT sign
    jwt.sign.mockReturnValue('mocked-jwt-token');
  });
  
  it('should login successfully with valid credentials', async () => {
    const req = {
      body: {
        email: 'valid@example.com',
        password: 'validpassword'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toHaveProperty('token', 'mocked-jwt-token');
    expect(res.json.mock.calls[0][0]).toHaveProperty('message', 'Login successful');
  });
  
  it('should reject login for unverified user', async () => {
    const req = {
      body: {
        email: 'unverified@example.com',
        password: 'validpassword'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Email not verified. Please verify your email before logging in.',
      needsVerification: true
    }));
  });
  
  it('should reject login with invalid password', async () => {
    const req = {
      body: {
        email: 'valid@example.com',
        password: 'wrongpassword'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid credentials'
    }));
  });
});

describe('Auth Controller - Email Verification', () => {
  let mockVerificationToken;
  let verificationExpiryDate;
  
  beforeEach(async () => {
    mockVerificationToken = 'valid-verification-token';
    verificationExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Create user with verification token
    await new Profile({
      user_id: 'user-to-verify',
      email: 'toverify@example.com',
      username: 'toverify',
      password: 'hashedpassword',
      is_verified: false,
      verification_token: mockVerificationToken,
      verification_token_expires: verificationExpiryDate
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
    const req = {
      params: {
        token: mockVerificationToken
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.verifyEmail(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Email verification successful. You can now log in.',
      verified: true
    }));
    
    // Check user is now verified
    const verifiedUser = await Profile.findOne({ user_id: 'user-to-verify' });
    expect(verifiedUser.is_verified).toBe(true);
    expect(verifiedUser.verification_token).toBeUndefined();
  });
  
  it('should reject verification with expired token', async () => {
    const req = {
      params: {
        token: 'expired-token'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await authController.verifyEmail(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid or expired verification token'
    }));
    
    // User should still be unverified
    const stillUnverifiedUser = await Profile.findOne({ user_id: 'expired-token-user' });
    expect(stillUnverifiedUser.is_verified).toBe(false);
  });
}); 