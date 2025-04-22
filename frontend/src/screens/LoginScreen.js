import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, resendVerification, error, needsVerification } = useContext(AuthContext);
  
  // Create refs for TextInput components to manage focus
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Function to handle login
  const handleLogin = async () => {
    // Dismiss keyboard when submitting
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    // Call login function from AuthContext
    const result = await login(email, password);
    
    if (!result.success) {
      setIsLoading(false);
      
      // Check if verification is needed
      if (result.needsVerification) {
        Alert.alert(
          'Email Not Verified',
          'You need to verify your email before logging in. Would you like to resend the verification email?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Resend Email',
              onPress: handleResendVerification
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    }
  };

  // Handle resending verification email
  const handleResendVerification = async () => {
    // Dismiss keyboard when submitting
    Keyboard.dismiss();
    
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    const result = await resendVerification(email);
    
    setIsLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Verification email sent. Please check your inbox.');
    } else {
      Alert.alert('Error', result.error || 'Failed to send verification email');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <Text style={styles.tagline}>Learning one step at a time</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => focusNextInput(passwordInputRef)}
                blurOnSubmit={false}
                textContentType="emailAddress"
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
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  textContentType="password"
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
              
              {/* Error Message */}
              {error && !needsVerification && (
                <Text style={styles.errorText}>{error}</Text>
              )}
              
              {/* Verification Message */}
              {needsVerification && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verificationText}>
                    Your email is not verified. Please check your inbox or request a new verification email.
                  </Text>
                  <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={handleResendVerification}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendButtonText}>Resend Verification</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              
              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Demo Account Info */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoText}>
                Demo Account:{'\n'}
                Email: demo@example.com{'\n'}
                Password: password
              </Text>
            </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05, // Responsive margin
  },
  logo: {
    width: width * 0.25, // Responsive size
    height: width * 0.25, // Keep aspect ratio
  },
  appName: {
    fontSize: width > 375 ? 28 : 24, // Smaller on smaller screens
    fontWeight: 'bold',
    color: '#D35C34',
    marginTop: 10,
  },
  tagline: {
    fontSize: width > 375 ? 16 : 14, // Smaller on smaller screens
    color: '#6B6B5A',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, // Add max width for very large devices
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
  verificationContainer: {
    backgroundColor: 'rgba(211, 92, 52, 0.1)',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  verificationText: {
    color: '#D35C34',
    marginBottom: 10,
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: '#F4ECE1',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#D35C34',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#D35C34',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#6B6B5A',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  registerText: {
    color: '#6B6B5A',
  },
  registerLink: {
    color: '#D35C34',
    fontWeight: 'bold',
  },
  demoContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: 'rgba(211, 92, 52, 0.1)',
    borderRadius: 5,
    width: '100%',
  },
  demoText: {
    color: '#6B6B5A',
    textAlign: 'center',
  },
});

export default LoginScreen; 