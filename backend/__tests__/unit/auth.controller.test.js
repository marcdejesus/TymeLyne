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
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockImplementation((password, hash) => {
    // Return true for valid password, false otherwise
    if (password === 'validpassword') {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  })
}));

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

    // Reset Profile.findOne mock for each test
    if (Profile.findOne.mockReset) {
      Profile.findOne.mockReset();
    }
  });

  it('should register a new user successfully', async () => {
    // Mock Profile.findOne to return null for both email and username checks
    // This simulates that the email and username don't exist yet
    Profile.findOne = jest.fn()
      .mockResolvedValueOnce(null)  // First call (email check)
      .mockResolvedValueOnce(null); // Second call (username check)
    
    // Mock instance with a save method that returns a resolved promise
    const mockSaveMethod = jest.fn().mockResolvedValue({
      user_id: 'mocked-user-id',
      email: 'new@example.com',
      username: 'newuser',
      is_verified: false,
      verification_token: 'mockedVerificationToken'
    });
    
    // Create a mock constructor that returns an object with the save method
    const originalImplementation = Profile.prototype.save;
    Profile.prototype.save = mockSaveMethod;
    
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
    
    try {
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0]).toHaveProperty('token', 'mocked-jwt-token');
      expect(res.json.mock.calls[0][0]).toHaveProperty('message');
      expect(res.json.mock.calls[0][0].user).toHaveProperty('user_id', 'mocked-user-id');
      
      // Verify that findOne was called with correct params
      expect(Profile.findOne).toHaveBeenCalledTimes(2);
      expect(Profile.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(Profile.findOne).toHaveBeenCalledWith({ username: 'newuser' });
    } finally {
      // Restore the original save method to avoid affecting other tests
      Profile.prototype.save = originalImplementation;
    }
  });

  it('should return error if email already exists', async () => {
    // Create a user first
    const existingUser = {
      user_id: 'existing-id',
      email: 'existing@example.com',
      username: 'existinguser',
      password: 'hashedpassword',
    };
    
    // Mock findOne to return the existing user for the email check
    Profile.findOne = jest.fn().mockResolvedValue(existingUser);
    
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
    // Reset Profile.findOne mock
    if (Profile.findOne.mockReset) {
      Profile.findOne.mockReset();
    }
    
    // Mock JWT sign
    jwt.sign.mockReturnValue('mocked-jwt-token');
  });
  
  it('should login successfully with valid credentials', async () => {
    // Create a mock verified user
    const mockVerifiedUser = {
      user_id: 'valid-user-id',
      email: 'valid@example.com',
      username: 'validuser',
      password: await bcrypt.hash('validpassword', 'salt'),
      is_verified: true,
      fName: 'Valid',
      lName: 'User'
    };
    
    // Mock Profile.findOne to return the verified user
    Profile.findOne = jest.fn().mockResolvedValue(mockVerifiedUser);
    
    const req = {
      body: {
        email: 'valid@example.com',
        password: 'validpassword'
      },
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'jest-test'
      },
      ip: '127.0.0.1',
      connection: {
        remoteAddress: '127.0.0.1'
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
    // Create a mock unverified user
    const mockUnverifiedUser = {
      user_id: 'unverified-user-id',
      email: 'unverified@example.com',
      username: 'unverifieduser',
      password: await bcrypt.hash('validpassword', 'salt'),
      is_verified: false,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours in future
    };
    
    // Mock Profile.findOne to return the unverified user
    Profile.findOne = jest.fn().mockResolvedValue(mockUnverifiedUser);
    
    const req = {
      body: {
        email: 'unverified@example.com',
        password: 'validpassword'
      },
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'jest-test'
      },
      ip: '127.0.0.1',
      connection: {
        remoteAddress: '127.0.0.1'
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
    // Create a mock verified user
    const mockVerifiedUser = {
      user_id: 'valid-user-id',
      email: 'valid@example.com',
      username: 'validuser',
      password: await bcrypt.hash('validpassword', 'salt'),
      is_verified: true
    };
    
    // Mock Profile.findOne to return the verified user
    Profile.findOne = jest.fn().mockResolvedValue(mockVerifiedUser);
    
    // But bcrypt.compare will return false for wrong password
    bcrypt.compare.mockImplementationOnce(() => Promise.resolve(false));
    
    const req = {
      body: {
        email: 'valid@example.com',
        password: 'wrongpassword'
      },
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'jest-test'
      },
      ip: '127.0.0.1',
      connection: {
        remoteAddress: '127.0.0.1'
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
    
    // Reset Profile.findOne mock
    if (Profile.findOne.mockReset) {
      Profile.findOne.mockReset();
    }
  });
  
  it('should verify user with valid token', async () => {
    // Mock a user with a valid token
    const mockUser = {
      user_id: 'user-to-verify',
      email: 'toverify@example.com',
      username: 'toverify',
      password: 'hashedpassword',
      is_verified: false,
      verification_token: mockVerificationToken,
      verification_token_expires: verificationExpiryDate,
      save: jest.fn().mockResolvedValue(true)
    };
    
    // Mock Profile.findOne to return our mock user for a valid token
    Profile.findOne = jest.fn().mockResolvedValue(mockUser);
    
    const req = {
      params: {
        token: mockVerificationToken
      },
      headers: {
        accept: 'application/json'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    await authController.verifyEmail(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Email verification successful. You can now log in.',
      verified: true
    }));
    
    // Check user's save method was called
    expect(mockUser.save).toHaveBeenCalled();
    
    // Check user is now verified (properties were updated)
    expect(mockUser.is_verified).toBe(true);
    expect(mockUser.verification_token).toBeUndefined();
  });
  
  it('should reject verification with expired token', async () => {
    // Mock Profile.findOne to return null for an expired token
    // This simulates a token that's expired or not found in the database
    Profile.findOne = jest.fn().mockResolvedValue(null);
    
    const req = {
      params: {
        token: 'expired-token'
      },
      headers: {
        accept: 'application/json'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    await authController.verifyEmail(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid or expired verification token'
    }));
  });
}); 