// Mock implementation of mongoose for testing
const mockMongoose = {
  connect: jest.fn().mockResolvedValue({
    connection: {
      host: 'mongodb://localhost:27017'
    }
  }),
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    path: jest.fn().mockReturnThis(),
    virtual: jest.fn().mockReturnThis(),
    plugin: jest.fn().mockReturnThis(),
    index: jest.fn().mockReturnThis(),
  })),
  model: jest.fn().mockImplementation((modelName, schema) => {
    // Create a mock database to store data
    const mockDb = new Map();
    
    // Default mock data
    const mockData = {
      _id: 'mock-id',
      user_id: 'mock-user-id',
      email: 'mock@example.com',
      username: 'mockuser',
      password: 'hashedpassword',
      is_verified: false,
      verification_token: 'mock-token',
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      save: jest.fn().mockImplementation(function() {
        // Update the record in the mock DB
        mockDb.set(this.user_id || 'mock-user-id', this);
        return Promise.resolve(this);
      })
    };
    
    // Initialize with test data
    mockDb.set('mock-user-id', { ...mockData });
    mockDb.set('user-to-verify', { 
      ...mockData, 
      user_id: 'user-to-verify',
      verification_token: 'valid-verification-token',
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    mockDb.set('expired-token-user', { 
      ...mockData, 
      user_id: 'expired-token-user',
      verification_token: 'expired-token',
      verification_token_expires: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    mockDb.set('valid-user-id', { 
      ...mockData, 
      user_id: 'valid-user-id',
      email: 'valid@example.com',
      username: 'validuser',
      is_verified: true 
    });
    mockDb.set('unverified-user-id', { 
      ...mockData, 
      user_id: 'unverified-user-id',
      email: 'unverified@example.com',
      username: 'unverifieduser',
      is_verified: false 
    });

    // Create mock model with common methods
    const MockModel = jest.fn().mockImplementation((data) => {
      const modelData = { ...mockData, ...data };
      modelData.save = jest.fn().mockImplementation(function() {
        mockDb.set(this.user_id || 'mock-user-id', this);
        return Promise.resolve(this);
      });
      modelData.toObject = jest.fn().mockReturnValue(modelData);
      modelData.toJSON = jest.fn().mockReturnValue(modelData);
      
      // Add newly created model to db
      if (data && data.user_id) {
        mockDb.set(data.user_id, modelData);
      }
      
      return modelData;
    });

    // Mock findOne to handle different query conditions
    MockModel.findOne = jest.fn().mockImplementation((query = {}) => {
      // Special case for verification token
      if (query.verification_token) {
        // Check if token is valid
        let foundUser = null;
        
        for (const [_, user] of mockDb.entries()) {
          if (user.verification_token === query.verification_token) {
            // Check if token is expired
            if (query.verification_token_expires && 
                query.verification_token_expires.$gt) {
              if (user.verification_token_expires > query.verification_token_expires.$gt) {
                foundUser = { ...user };
              }
            } else {
              foundUser = { ...user };
            }
            break;
          }
        }
        
        if (!foundUser) {
          return {
            select: jest.fn().mockReturnValue(null),
            exec: jest.fn().mockResolvedValue(null)
          };
        }
        
        // Create a copy to avoid changing the actual mock data
        const userCopy = { ...foundUser };
        
        // Add save method
        userCopy.save = jest.fn().mockImplementation(() => {
          // Update the db
          const record = mockDb.get(userCopy.user_id);
          if (record) {
            mockDb.set(userCopy.user_id, { ...record, ...userCopy });
          }
          return Promise.resolve(userCopy);
        });
        
        return {
          select: jest.fn().mockReturnValue(userCopy),
          exec: jest.fn().mockResolvedValue(userCopy)
        };
      }
      
      // Handle email query
      if (query.email) {
        let foundUser = null;
        for (const [_, user] of mockDb.entries()) {
          if (user.email === query.email) {
            foundUser = { ...user };
            break;
          }
        }
        
        if (!foundUser) {
          return {
            select: jest.fn().mockReturnValue(null),
            exec: jest.fn().mockResolvedValue(null)
          };
        }
        
        const userCopy = { ...foundUser };
        
        // Add save method
        userCopy.save = jest.fn().mockImplementation(() => {
          // Update the db
          const record = mockDb.get(userCopy.user_id);
          if (record) {
            mockDb.set(userCopy.user_id, { ...record, ...userCopy });
          }
          return Promise.resolve(userCopy);
        });
        
        return {
          select: jest.fn().mockImplementation((fields) => {
            if (fields === '+password') {
              return userCopy;
            }
            return userCopy;
          }),
          exec: jest.fn().mockResolvedValue(userCopy)
        };
      }
      
      // Handle user_id query
      if (query.user_id) {
        const foundUser = mockDb.get(query.user_id);
        if (foundUser) {
          const userCopy = { ...foundUser };
          userCopy.save = jest.fn().mockImplementation(() => {
            // Update the db
            mockDb.set(userCopy.user_id, { ...foundUser, ...userCopy });
            return Promise.resolve(userCopy);
          });
          
          return {
            select: jest.fn().mockReturnValue(userCopy),
            exec: jest.fn().mockResolvedValue(userCopy)
          };
        }
      }
      
      // Default case - return mock data
      const mockObj = {
        ...mockData,
        select: jest.fn().mockReturnValue(mockData),
        exec: jest.fn().mockResolvedValue(mockData)
      };
      return mockObj;
    });
    
    MockModel.findById = jest.fn().mockImplementation(() => {
      const mockObj = {
        ...mockData,
        select: jest.fn().mockReturnValue(mockData),
        exec: jest.fn().mockResolvedValue(mockData)
      };
      return mockObj;
    });
    
    MockModel.find = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockData])
    }));
    
    MockModel.create = jest.fn().mockImplementation((data) => {
      const newData = { 
        ...mockData, 
        ...data, 
        save: jest.fn().mockResolvedValue(true) 
      };
      // Add to mock DB
      if (data.user_id) {
        mockDb.set(data.user_id, newData);
      }
      return Promise.resolve(newData);
    });
    
    MockModel.updateOne = jest.fn().mockResolvedValue({ nModified: 1 });
    MockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    MockModel.count = jest.fn().mockResolvedValue(0);

    return MockModel;
  }),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
    close: jest.fn().mockResolvedValue(true),
    dropDatabase: jest.fn().mockResolvedValue(true),
    collections: {},
  },
  Error: {
    ValidationError: class ValidationError extends Error {
      constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.errors = {
          user_id: new Error('User ID is required'),
          password: new Error('Password is required')
        };
      }
    },
  },
  Types: {
    Mixed: 'mixed',
    ObjectId: String,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Buffer: Buffer,
    Map: Map,
    Array: Array
  }
};

// Add Types to Schema constructor function
mockMongoose.Schema.Types = mockMongoose.Types;

module.exports = mockMongoose; 