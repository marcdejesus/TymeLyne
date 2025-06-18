// API Configuration Example (Copy this to apiConfig.js and customize)
import { Platform } from 'react-native';
import Device from 'react-native/Libraries/I18nManager/DeviceInfo';

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

// Configure API
// Detect if running on device vs emulator/simulator
const isDevice = Device.isDevice;
const deviceType = Device.deviceType;
const deviceName = Device.deviceName;
const osName = Device.osName;
const osVersion = Device.osVersion;

console.log('Running on:', {
  isDevice,
  deviceType,
  deviceName,
  osName,
  osVersion
});

let apiUrl;

if (__DEV__) {
  // Development mode
  if (Platform.OS === 'android') {
    // For Android Emulator
    apiUrl = 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // For iOS Simulator
    apiUrl = 'http://localhost:3000/api';
  } else {
    // For web or other platforms
    apiUrl = 'http://localhost:3000/api';
  }
} else {
  // Production mode
  apiUrl = 'https://api.tymelyne.com/api';  // Replace with your production API URL
}

console.log('Using API URL:', apiUrl);

export default {
  apiUrl,
  timeout: 15000, // 15 seconds timeout
}; 