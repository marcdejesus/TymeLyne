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
    // Default mock data
    const mockData = {
      _id: 'mock-id',
      user_id: 'mock-user-id',
      email: 'mock@example.com',
      username: 'mockuser',
      password: 'hashedpassword',
      is_verified: false,
      verification_token: 'mock-token',
      save: jest.fn().mockResolvedValue(true)
    };

    // Create mock model with common methods
    const MockModel = jest.fn().mockImplementation((data) => {
      return {
        ...data,
        save: jest.fn().mockResolvedValue({ _id: 'mock-id', ...data }),
        toObject: jest.fn().mockReturnValue({ _id: 'mock-id', ...data }),
        toJSON: jest.fn().mockReturnValue({ _id: 'mock-id', ...data }),
      };
    });

    // Add static methods to model with chainable methods
    MockModel.findOne = jest.fn().mockImplementation(() => {
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
      return Promise.resolve({ 
        ...mockData, 
        ...data, 
        save: jest.fn().mockResolvedValue(true) 
      });
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