const mongoose = require('mongoose');
const connectDB = require('../../config/db');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({
    connection: {
      host: 'mongodb://localhost:27017'
    }
  })
}));

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Set default environment variable
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  });

  it('should connect to MongoDB successfully', async () => {
    // Act
    await connectDB();
    
    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, expect.any(Object));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MongoDB Connected'));
    expect(mockExit).not.toHaveBeenCalled();
  });
  
  it('should exit process when connection fails', async () => {
    // Arrange
    const mockError = new Error('Connection failed');
    mongoose.connect.mockRejectedValueOnce(mockError);
    
    // Act
    await connectDB();
    
    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, expect.any(Object));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error connecting to MongoDB'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });
}); 