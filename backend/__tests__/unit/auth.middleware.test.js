const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

// Mock dependencies
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should call next() when token is valid', () => {
    // Arrange
    const mockToken = 'valid.token.here';
    const decodedToken = { id: 'user123', email: 'user@example.com' };
    
    req.header.mockReturnValue(mockToken);
    jwt.verify.mockReturnValue(decodedToken);
    
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no token is provided', () => {
    // Arrange
    req.header.mockReturnValue(undefined);
    
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 when token is invalid', () => {
    // Arrange
    const mockToken = 'invalid.token.here';
    const error = new Error('Invalid token');
    
    req.header.mockReturnValue(mockToken);
    jwt.verify.mockImplementation(() => {
      throw error;
    });
    
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
}); 