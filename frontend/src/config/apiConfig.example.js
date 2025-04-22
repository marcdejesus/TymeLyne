// API Configuration Example (Copy this to apiConfig.js and customize)
import { Platform } from 'react-native';

// Development endpoints
const DEV_API_URLS = {
  // For Android Emulator
  androidEmulator: 'http://10.0.2.2:5001/api',
  // For iOS Simulator
  iOSSimulator: 'http://localhost:5001/api',
  // For physical device - replace with your actual local network IP
  device: 'http://YOUR_LOCAL_IP:5001/api'
};

// Production endpoints (when you deploy your backend)
const PROD_API_URL = 'https://your-production-api.com/api';

// Choose the appropriate API URL based on environment and platform
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return PROD_API_URL;
  }
  
  // Auto-detect platform and device type
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  // Check if running on a simulator/emulator
  const isSimulator = Platform.constants.Model === 'Simulator' || 
                      (Platform.OS === 'android' && Platform.constants.Brand === 'google');

  console.log('📱 Running on:', { 
    platform: Platform.OS,
    isSimulator,
    model: Platform.constants.Model || 'unknown'
  });
  
  if (isIOS) {
    // iOS devices can't use localhost to access the host machine
    // When in simulator, localhost works; when on device, need the actual IP
    return isSimulator ? DEV_API_URLS.iOSSimulator : DEV_API_URLS.device;
  } else if (isAndroid) {
    // Android emulator uses 10.0.2.2 to access host; physical devices need the IP
    return isSimulator ? DEV_API_URLS.androidEmulator : DEV_API_URLS.device;
  }
  
  // Default fallback to device IP for unknown platforms
  return DEV_API_URLS.device;
};

// Get the appropriate API URL
const apiUrl = getApiUrl();
console.log('🌐 Using API URL:', apiUrl);

export default {
  apiUrl,
  timeout: 15000, // 15 seconds timeout
}; 