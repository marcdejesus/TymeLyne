import React, { createContext, useState, useEffect } from 'react';
// Import for future backend auth
// import * as SecureStore from 'expo-secure-store';
// import axios from 'axios';

export const AuthContext = createContext();

// Mock user data
const MOCK_USER = {
  id: '1',
  username: 'demouser',
  fName: 'Demo',
  lName: 'User',
  email: 'demo@example.com',
  follower_count: 1,
  friends_count: 1, 
  user_total_exp: 500,
  current_courses: ['Digital Marketing']
};

const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Mock API URL for future implementation
  // const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Simulate checking if user is logged in
    const bootstrapAsync = async () => {
      try {
        // For production, replace with:
        // const token = await SecureStore.getItemAsync('userToken');
        // if (token) {
        //   setUserToken(token);
        //   const userDataJson = await SecureStore.getItemAsync('user');
        //   if (userDataJson) {
        //     setUser(JSON.parse(userDataJson));
        //   }
        // }
        
        // Mock auto-login for demo (remove in production)
        setUserToken('mock-token');
        setUser(MOCK_USER);
      } catch (e) {
        console.log('Error restoring token', e);
      } finally {
        // Short delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // For production, replace with actual API call:
      // const response = await axios.post(`${API_URL}/auth/login`, {
      //   email,
      //   password,
      // });
      // const { token, user } = response.data;
      // await SecureStore.setItemAsync('userToken', token);
      // await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      // Mock successful login
      if (email === 'demo@example.com' && password === 'password') {
        setUserToken('mock-token');
        setUser(MOCK_USER);
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.log('Login error:', error.message);
      setError(error.message || 'Login failed');
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // For production, replace with actual API call:
      // const response = await axios.post(`${API_URL}/auth/register`, userData);
      // const { token, user } = response.data;
      // await SecureStore.setItemAsync('userToken', token);
      // await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      // Mock successful registration
      const newUser = {
        ...MOCK_USER,
        username: userData.username,
        fName: userData.fName,
        lName: userData.lName,
        email: userData.email
      };
      
      setUserToken('mock-token');
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.log('Register error:', error.message);
      setError(error.message || 'Registration failed');
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // For production, replace with:
      // await SecureStore.deleteItemAsync('userToken');
      // await SecureStore.deleteItemAsync('user');
      
      // Mock logout
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 