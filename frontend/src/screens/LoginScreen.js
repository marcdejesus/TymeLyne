import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, shadows } from '../constants/theme';
import Typography from '../components/Typography';
import Input from '../components/Input';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, route }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, resendVerification, error, needsVerification } = useContext(AuthContext);
  
  // Create refs for TextInput components to manage focus
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Set email from route params if available
  useEffect(() => {
    if (route?.params?.email) {
      setEmailOrUsername(route.params.email);
    }
    
    // Show verification message if coming from registration
    if (route?.params?.fromRegistration) {
      Alert.alert(
        'Email Verification Required',
        'Please check your email inbox for a verification link. You must verify your email before you can log in.',
        [{ text: 'OK' }]
      );
    }
  }, [route?.params]);

  // Function to handle login
  const handleLogin = async () => {
    // Dismiss keyboard when submitting
    Keyboard.dismiss();
    
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Please enter both email/username and password');
      return;
    }

    setIsLoading(true);
    
    // Call login function from AuthContext
    const result = await login(emailOrUsername, password);
    
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
    
    if (!emailOrUsername) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    const result = await resendVerification(emailOrUsername);
    
    setIsLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Verification email sent. Please check your inbox.');
    } else {
      Alert.alert('Error', result.error || 'Failed to send verification email');
    }
  };

  // Handle navigation to registration screen
  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo and App Name */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Typography variant="largeHeading" weight="bold" style={styles.appName}>
                Tymelyne
              </Typography>
              <Typography variant="subheading" color={colors.text.secondary} style={styles.tagline}>
                Learning one step at a time
              </Typography>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Input
                label="Email or Username"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                leftIcon={<Icon name="person-outline" size={20} color={colors.text.tertiary} />}
                error={needsVerification ? "Email not verified" : null}
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                leftIcon={<Icon name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
              />
              
              <Button
                variant="primary"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
                fullWidth
              >
                Log In
              </Button>
              
              {/* Register Button */}
              <View style={styles.registerContainer}>
                <Typography variant="body" color={colors.text.secondary}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="outline"
                  onPress={handleRegisterPress}
                  style={styles.registerButton}
                >
                  Register
                </Button>
              </View>
              
              {/* Need to Resend Verification Email */}
              {needsVerification && (
                <Button
                  variant="outline"
                  onPress={handleResendVerification}
                  loading={isLoading}
                  style={styles.resendButton}
                >
                  Resend Verification Email
                </Button>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
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
    width: 240,
    height: 240,
    marginBottom: spacing.m
  },
  appName: {
    marginBottom: spacing.xs
  },
  tagline: {
    marginBottom: spacing.l
  },
  formContainer: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.m,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.m,
  },
  registerButton: {
    marginLeft: spacing.s,
  },
  resendButton: {
    marginTop: spacing.m,
  }
});

export default LoginScreen; 