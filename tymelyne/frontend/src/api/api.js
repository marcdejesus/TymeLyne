import axios from 'axios';

// Set the base URL for API requests
// =====================================================================
// Your local IP address has been detected as: 192.168.1.60
// (This was set by running update_api_url.sh)
// =====================================================================
const LOCAL_IP = '192.168.1.60'; 

// Different API URLs for different environments
const API_URLS = {
  androidEmulator: 'http://10.0.2.2:8000',  // Android emulator
  iosSimulator: 'http://localhost:8000',     // iOS simulator
  localDevice: `http://${LOCAL_IP}:8000`,    // Real device using local network
  expoDevelopment: `exp://${LOCAL_IP}:8081`  // Alternative Expo format
};

// Choose which API URL to use - TRY SWITCHING TO ANOTHER IF ONE DOESN'T WORK
const API_URL = API_URLS.localDevice; // Using local device over WiFi network

console.log('API_URL set to:', API_URL);

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Adding timeouts for better error handling
  timeout: 10000, // 10 seconds
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response;
  },
  error => {
    console.log('API Error:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received from API');
    }
    return Promise.reject(error);
  }
);

/**
 * Task API functions
 */
export const taskAPI = {
  /**
   * Get all tasks
   * @returns {Promise} - Promise with tasks data
   */
  getAllTasks: async () => {
    try {
      const response = await api.get('/api/tasks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Get a single task by ID
   * @param {number} id - Task ID
   * @returns {Promise} - Promise with task data
   */
  getTask: async (id) => {
    try {
      const response = await api.get(`/api/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param {Object} task - Task data
   * @returns {Promise} - Promise with created task
   */
  createTask: async (task) => {
    try {
      const response = await api.post('/api/tasks/', task);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} task - Updated task data
   * @returns {Promise} - Promise with updated task
   */
  updateTask: async (id, task) => {
    try {
      const response = await api.put(`/api/tasks/${id}/`, task);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise} - Promise with response data
   */
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/api/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },
};

export default api; 