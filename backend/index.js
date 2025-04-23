const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const os = require('os');

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

// Print server network information
console.log('🌐 SERVER NETWORK INFORMATION:');
console.log('Available on:', getServerIPs());

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
connectDB();

// Middleware
app.use(express.json());

// Configure CORS to allow requests from the React Native app
const corsOptions = {
  origin: ['http://localhost:8081', 'http://192.168.1.145:8081', 'http://192.168.1.145:8082', 'exp://192.168.1.145:8081', 'exp://192.168.1.145:8082'],
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
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/courses', require('./routes/courses'));

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