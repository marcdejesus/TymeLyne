import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * LoginScreen - Allows users to login to their account
 * Includes error handling for network issues and validation
 */
const LoginScreen = ({ navigation }) => {
  const { login, error: authError, loading, isAuthenticated } = useAuth();
  const { accent } = useTheme();
  const accentColor = accent || '#FF9500';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  // Update local error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
      // Detect network errors
      if (authError.includes('Network Error')) {
        setNetworkError(true);
      }
    } else {
      setError('');
      setNetworkError(false);
    }
  }, [authError]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    setNetworkError(false);
    
    if (!validateForm()) return;

    try {
      const success = await login(username, password);
      
      if (success) {
        // Navigation happens via useEffect when isAuthenticated changes
        console.log('Login successful');
      }
    } catch (err) {
      // Handle different error types
      console.error('Login error:', err);
      
      if (err.message?.includes('Network Error')) {
        setNetworkError(true);
        setError('Network error: Please check your internet connection');
      } else if (err.response?.data) {
        // Format API validation errors
        const responseData = err.response.data;
        
        if (typeof responseData === 'object') {
          const errorMessages = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join('\n');
          
          setError(errorMessages || 'Invalid credentials');
        } else {
          setError(responseData || 'Login failed');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Retry connection
  const retryConnection = () => {
    setNetworkError(false);
    setError('');
    handleLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Tymelyne</Text>
            <Text style={styles.tagline}>Learn at your own pace</Text>
          </View>

          {/* Network Error Message */}
          {networkError && (
            <View style={styles.networkErrorContainer}>
              <Ionicons name="cloud-offline" size={24} color="#ff3b30" />
              <Text style={styles.networkErrorText}>
                Unable to connect to the server. Please check your internet connection.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryConnection}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Message */}
          {error && !networkError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.username && styles.inputError,
                  { borderColor: formErrors.username ? '#ff3b30' : '#333' },
                ]}
                placeholder="Enter your username"
                placeholderTextColor="#777"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  // Clear error when typing
                  if (formErrors.username) {
                    setFormErrors({...formErrors, username: null});
                  }
                }}
                autoCapitalize="none"
                textContentType="username"
              />
              {formErrors.username && (
                <Text style={styles.errorText}>{formErrors.username}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  formErrors.password && styles.inputError,
                  { borderColor: formErrors.password ? '#ff3b30' : '#333' },
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#777"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear error when typing
                    if (formErrors.password) {
                      setFormErrors({...formErrors, password: null});
                    }
                  }}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
              {formErrors.password && (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: accentColor }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: accentColor }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.registerLink, { color: accentColor }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#aaa',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  passwordContainer: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#fff',
  },
  passwordToggle: {
    padding: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#ff3b30',
    marginLeft: 5,
    fontSize: 14,
    flex: 1,
  },
  networkErrorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  networkErrorText: {
    color: '#ff3b30',
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#aaa',
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 