const mongoose = require('mongoose');

// Mock collection functions for unit tests
const mockCollection = {
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
  findOne: jest.fn(),
};

// Mock mongoose connection
mongoose.connection = {
  collections: {
    profiles: mockCollection,
  },
  db: {
    collection: jest.fn().mockReturnValue(mockCollection),
  },
  dropDatabase: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
};

// Mock connect method
mongoose.connect = jest.fn().mockResolvedValue({
  connection: mongoose.connection,
});

// Connect to mock database
module.exports.connect = async () => {
  return Promise.resolve();
};

// Close mock database connection
module.exports.closeDatabase = async () => {
  return Promise.resolve();
};

// Clear all mock collections
module.exports.clearDatabase = async () => {
  Object.keys(mongoose.connection.collections).forEach(key => {
    const collection = mongoose.connection.collections[key];
    collection.deleteMany.mockClear();
  });
  return Promise.resolve();
}; 