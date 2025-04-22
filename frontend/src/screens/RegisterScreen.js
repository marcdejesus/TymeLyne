import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadows } from '../constants/theme';
import Typography from '../components/Typography';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Form validation errors
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { register, error } = useContext(AuthContext);

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
    
    // Reset all errors
    setFullNameError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    let hasError = false;
    
    // Form validation
    if (!fullName) {
      setFullNameError('Full name is required');
      hasError = true;
    }
    
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    
    if (!username) {
      setUsernameError('Username is required');
      hasError = true;
    } else if (!validateUsername(username)) {
      setUsernameError('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      hasError = true;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }
    
    if (hasError) {
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

  // Handle navigation to login screen
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
              <Typography variant="largeHeading" weight="bold" style={styles.appName}>
                Tymelyne
              </Typography>
              <Typography variant="subheading" color={colors.text.secondary} style={styles.tagline}>
                Create your account
              </Typography>
            </View>

            {registrationSuccess ? (
              <Card variant="elevated" style={styles.successContainer}>
                <Typography variant="heading" weight="bold" center style={styles.successTitle}>
                  Account Created!
                </Typography>
                <Typography variant="body" center style={styles.successMessage}>
                  We've sent a verification email to {email}.
                  Please check your inbox and click the verification link to complete your registration.
                </Typography>
                <Button
                  label="Go to Login"
                  variant="primary"
                  onPress={() => navigation.navigate('Login', { email })}
                  style={styles.loginRedirectButton}
                  fullWidth
                />
              </Card>
            ) : (
              <>
                {/* Registration Form */}
                <View style={styles.formContainer}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    error={fullNameError}
                    returnKeyType="next"
                    leftIcon={<Icon name="person-outline" size={20} color={colors.text.tertiary} />}
                  />
                  
                  <Input
                    label="Email"
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    leftIcon={<Icon name="mail-outline" size={20} color={colors.text.tertiary} />}
                  />
                  
                  <Input
                    label="Username"
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                    error={usernameError}
                    autoCapitalize="none"
                    returnKeyType="next"
                    leftIcon={<Icon name="at-outline" size={20} color={colors.text.tertiary} />}
                    helperText="Username must be at least 3 characters and only contain letters, numbers, and underscores"
                  />
                  
                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    error={passwordError}
                    secureTextEntry={true}
                    returnKeyType="next"
                    leftIcon={<Icon name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
                    helperText="Password must be at least 6 characters"
                  />
                  
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={confirmPasswordError}
                    secureTextEntry={true}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    leftIcon={<Icon name="shield-checkmark-outline" size={20} color={colors.text.tertiary} />}
                  />
                  
                  {/* Error message from context */}
                  {error && (
                    <Typography variant="body" color={colors.status.error} center style={styles.errorText}>
                      {error}
                    </Typography>
                  )}
                  
                  <Button
                    label="Create Account"
                    variant="primary"
                    onPress={handleRegister}
                    loading={isLoading}
                    style={styles.registerButton}
                    fullWidth
                  />
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Typography variant="body" color={colors.text.secondary}>
                    Already have an account?
                  </Typography>
                  <Button
                    label="Login"
                    variant="outline"
                    onPress={handleLoginPress}
                    style={styles.loginButton}
                  />
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.horizontal.medium,
    paddingVertical: spacing.vertical.medium,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.m
  },
  appName: {
    marginBottom: spacing.xs
  },
  tagline: {
    marginBottom: spacing.m
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center'
  },
  errorText: {
    marginBottom: spacing.m,
  },
  registerButton: {
    marginTop: spacing.m
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.s
  },
  loginButton: {
    marginLeft: spacing.s
  },
  successContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: spacing.l
  },
  successTitle: {
    marginBottom: spacing.m
  },
  successMessage: {
    marginBottom: spacing.l,
    lineHeight: typography.lineHeight.body
  },
  loginRedirectButton: {
    marginTop: spacing.m
  }
});

export default RegisterScreen; 