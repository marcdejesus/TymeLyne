const mongoose = require('mongoose');
const dbHandler = require('../utils/db-setup');
const Profile = require('../../models/profile');

// Connect to a test database before running any tests
beforeAll(async () => {
  await dbHandler.connect();
});

// Clear all test data after every test
afterEach(async () => {
  await dbHandler.clearDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Profile Model Test', () => {
  it('should create & save profile successfully', async () => {
    const validProfile = new Profile({
      user_id: '12345-67890-abcdef',
      email: 'test@example.com',
      username: 'testuser',
      password: 'securepassword123',
      fName: 'Test',
      lName: 'User',
      created_at: new Date()
    });
    
    const savedProfile = await validProfile.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedProfile._id).toBeDefined();
    expect(savedProfile.user_id).toBe('12345-67890-abcdef');
    expect(savedProfile.email).toBe('test@example.com');
    expect(savedProfile.username).toBe('testuser');
    expect(savedProfile.is_verified).toBe(false); // Default value
  });

  it('should fail when required fields are missing', async () => {
    const profileWithoutRequiredField = new Profile({
      email: 'incomplete@example.com',
      username: 'incomplete'
      // Missing user_id and password
    });
    
    let err;
    try {
      await profileWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.user_id).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail when email format is invalid', async () => {
    const profileWithInvalidEmail = new Profile({
      user_id: '12345-67890-invalid',
      email: 'invalid-email',
      username: 'invalidemail',
      password: 'password123'
    });
    
    let err;
    try {
      await profileWithInvalidEmail.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
  });

  it('should enforce unique email constraint', async () => {
    // Create first profile
    const profile1 = new Profile({
      user_id: 'user1',
      email: 'duplicate@example.com',
      username: 'user1',
      password: 'password123'
    });
    await profile1.save();
    
    // Try to create second profile with same email
    const profile2 = new Profile({
      user_id: 'user2',
      email: 'duplicate@example.com',
      username: 'user2',
      password: 'password456'
    });
    
    let err;
    try {
      await profile2.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
}); 