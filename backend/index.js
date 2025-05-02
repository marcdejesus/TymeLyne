const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const os = require('os');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Get server IP addresses for information
const getServerIPs = () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        addresses.push({
          interface: interfaceName,
          address: iface.address
        });
      }
    }
  }
  return addresses;
};

// Print environment variables for debugging
console.log('🛠️ SERVER ENVIRONMENT:');
console.log('📌 NODE_ENV:', process.env.NODE_ENV);
console.log('📌 PORT:', process.env.PORT);
console.log('📌 JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('📌 MONGODB_URI:', process.env.MONGODB_URI ? '[SET]' : '[NOT SET]');
console.log('📌 SMTP_HOST:', process.env.SMTP_HOST || '[NOT SET]');
console.log('📌 SMTP_PORT:', process.env.SMTP_PORT || '[NOT SET]');
console.log('📌 SMTP_USER:', process.env.SMTP_USER ? '[SET]' : '[NOT SET]');
console.log('📌 FRONTEND_URL:', process.env.FRONTEND_URL || '[NOT SET - Using default]');
console.log('📌 ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS ? '[SET]' : '[NOT SET - Using defaults]');

// Print server network information
console.log('🌐 SERVER NETWORK INFORMATION:');
console.log('Available on:', getServerIPs());

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
connectDB();

// Middleware
app.use(express.json());

// Configure CORS to allow requests from the React Native app
const defaultOrigins = [
  'http://localhost:8081',
  'http://localhost:8082', 
  'exp://localhost:8081',
  'exp://localhost:8082'
];

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    defaultOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
console.log('✅ CORS configured to allow specific origins:', corsOptions.origin);

// Enable trust proxy - important for accurate client IP detection
app.enable('trust proxy');

// Add response time tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📝 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use(['/api/profiles', '/api/profile'], require('./routes/profiles'));
app.use('/api/courses', require('./routes/courses'));

// Direct routes for progression endpoints (for better compatibility)
app.get(['/api/profile/progression', '/api/profiles/progression'], async (req, res) => {
  console.log('🔍 Direct API progression endpoint accessed');
  
  try {
    // Extract any token from the request
    let token = req.header('x-auth-token');
    
    // If not in header, try the Authorization header (with Bearer scheme)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log('⛔ API PROGRESSION: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get the user progression service
    const userProgressionService = require('./services/userProgressionService');
    
    // Get the user's progression data
    const progressionData = await userProgressionService.getUserProgressionData(decoded.id);
    
    // Return the progression data
    res.json(progressionData);
  } catch (error) {
    console.error('❌ Error in API progression endpoint:', error);
    
    // Check for specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Direct route for user progression without /api prefix (for compatibility)
app.get('/progression', async (req, res) => {
  // Forward to the profiles/progression endpoint
  console.log('🔍 Root progression endpoint accessed');
  
  // Extract any token from the request
  let token = req.header('x-auth-token');
  
  // If not in header, try the Authorization header (with Bearer scheme)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  console.log('🔑 TOKEN INFO:', { 
    hasToken: !!token, 
    tokenLength: token ? token.length : 0,
    headers: Object.keys(req.headers),
    hasAuthHeader: !!req.headers.authorization
  });
  
  if (!token) {
    console.log('⛔ PROGRESSION: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ PROGRESSION: Token verified, user ID:', decoded.id);
    
    // Get the user progression service
    const userProgressionService = require('./services/userProgressionService');
    
    // Get the user's progression data
    const progressionData = await userProgressionService.getUserProgressionData(decoded.id);
    console.log('📊 PROGRESSION: Data retrieved successfully');
    
    // Return the progression data
    res.json(progressionData);
  } catch (error) {
    console.error('❌ Error in direct progression endpoint:', error);
    
    // Check for specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Running',
    serverTime: new Date().toISOString(),
    serverInfo: {
      platform: os.platform(),
      hostname: os.hostname(),
      networkInterfaces: getServerIPs()
    }
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    clientInfo: {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 UNHANDLED ERROR:', err.stack);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server, listening on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API accessible at:`);
  getServerIPs().forEach(iface => {
    console.log(`   http://${iface.address}:${PORT}`);
  });
}); 