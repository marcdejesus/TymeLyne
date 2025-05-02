const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from header
  let token = req.header('x-auth-token');
  
  // If not in header, try the Authorization header (with Bearer scheme)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  console.log('🔍 AUTH MIDDLEWARE: Token and request info', { 
    hasToken: !!token, 
    tokenLength: token ? token.length : 0,
    requestPath: req.path,
    method: req.method,
    headers: Object.keys(req.headers),
    hasAuthHeader: !!req.headers.authorization,
    url: req.originalUrl || req.url
  });

  // Check if no token
  if (!token) {
    console.log('⛔ AUTH MIDDLEWARE: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Log JWT information for debugging
    // A token has 3 parts separated by dots - let's check that first
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('⛔ AUTH MIDDLEWARE: Malformed token', { parts: parts.length });
      return res.status(401).json({ message: 'Token is malformed' });
    }

    console.log('🔑 AUTH MIDDLEWARE: Verifying token');
    console.log('🔧 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔧 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'] // Explicitly specify expected algorithm
    });
    
    console.log('✅ AUTH MIDDLEWARE: Token verified successfully', { 
      userId: decoded.id,
      email: decoded.email
    });
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ AUTH MIDDLEWARE: Token verification failed', { 
      name: err.name, 
      message: err.message,
      expiredAt: err.expiredAt,
      stack: err.stack
    });

    // Check for specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        expiredAt: err.expiredAt
      });
    } else if (err.name === 'JsonWebTokenError') {
      if (err.message === 'invalid signature') {
        return res.status(401).json({ message: 'Token signature is invalid' });
      } else if (err.message === 'jwt malformed') {
        return res.status(401).json({ message: 'Token is malformed' });
      }
    } else if (err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not yet active' });
    }

    // Generic error if none of the above
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { protect }; 