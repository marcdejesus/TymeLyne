import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { register, error } = useContext(AuthContext);
  
  // Create refs for TextInput components to manage focus
  const fullNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    // Allow alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return username.length >= 3 && usernameRegex.test(username);
  };

  // Function to handle registration
  const handleRegister = async () => {
    // Dismiss keyboard when submitting
    Keyboard.dismiss();
    
    // Form validation
    if (!fullName || !email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    // Set loading state
    setIsLoading(true);

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const fName = nameParts[0] || '';
    const lName = nameParts.slice(1).join(' ') || '';

    // Create user data
    const userData = {
      username,
      email,
      password,
      fName,
      lName
    };

    // Call register from AuthContext
    const result = await register(userData);
    
    setIsLoading(false);
    
    if (result.success) {
      setRegistrationSuccess(true);
      
      Alert.alert(
        'Registration Successful', 
        'Your account has been created. Please check your email to verify your account before logging in.',
        [
          { 
            text: 'OK',
            onPress: () => {
              // Always navigate to login screen after registration
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { email, fromRegistration: true } }],
              });
            }
          }
        ]
      );
    } else {
      // Show error message
      Alert.alert('Registration Failed', result.error || 'An error occurred during registration');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle next input focus
  const focusNextInput = (nextInput) => {
    if (nextInput && nextInput.current) {
      nextInput.current.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F1E0" />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          enabled
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo and App Name */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/favicon.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.appName}>Tymelyne</Text>
              <Text style={styles.tagline}>Create your account</Text>
            </View>

            {registrationSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Account Created!</Text>
                <Text style={styles.successMessage}>
                  We've sent a verification email to {email}.
                  Please check your inbox and click the verification link to complete your registration.
                </Text>
                <TouchableOpacity 
                  style={styles.loginRedirectButton}
                  onPress={() => navigation.navigate('Login', { email })}
                >
                  <Text style={styles.loginRedirectButtonText}>Go to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Registration Form */}
                <View style={styles.formContainer}>
                  <TextInput
                    ref={fullNameInputRef}
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(emailInputRef)}
                    blurOnSubmit={false}
                    textContentType="name"
                  />
                  
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(usernameInputRef)}
                    blurOnSubmit={false}
                    textContentType="emailAddress"
                  />
                  
                  <TextInput
                    ref={usernameInputRef}
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(passwordInputRef)}
                    blurOnSubmit={false}
                    textContentType="username"
                  />
                  
                  {/* Password input with toggle button */}
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.passwordInput}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextInput(confirmPasswordInputRef)}
                      blurOnSubmit={false}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity 
                      style={styles.visibilityToggle}
                      onPress={togglePasswordVisibility}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.visibilityToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Confirm Password input with toggle button */}
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={confirmPasswordInputRef}
                      style={styles.passwordInput}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity 
                      style={styles.visibilityToggle}
                      onPress={toggleConfirmPasswordVisibility}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.visibilityToggleText}>
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Error message */}
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  
                  <TouchableOpacity 
                    style={styles.registerButton} 
                    onPress={handleRegister}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.registerButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
  },
  appName: {
    fontSize: width > 375 ? 28 : 24,
    fontWeight: 'bold',
    color: '#D35C34',
    marginTop: 10,
  },
  tagline: {
    fontSize: width > 375 ? 16 : 14,
    color: '#6B6B5A',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0D8C0',
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  visibilityToggle: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  visibilityToggleText: {
    color: '#D35C34',
    fontWeight: '600',
  },
  errorText: {
    color: '#D35C34',
    marginBottom: 15,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#D35C34',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: '#6B6B5A',
  },
  loginLink: {
    color: '#D35C34',
    fontWeight: 'bold',
  },
  successContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(211, 92, 52, 0.1)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D35C34',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A4A3A',
    marginBottom: 20,
    lineHeight: 22,
  },
  loginRedirectButton: {
    backgroundColor: '#D35C34',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  loginRedirectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default RegisterScreen; 