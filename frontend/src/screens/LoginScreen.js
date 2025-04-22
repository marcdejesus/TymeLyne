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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, resendVerification, error, needsVerification } = useContext(AuthContext);
  
  // Create refs for TextInput components to manage focus
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Set email from route params if available
  useEffect(() => {
    if (route?.params?.email) {
      setEmail(route.params.email);
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

  // Handle navigation to registration screen
  const handleRegisterPress = () => {
    navigation.navigate('Register');
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
                Learning one step at a time
              </Typography>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                leftIcon={<Icon name="mail-outline" size={20} color={colors.text.tertiary} />}
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
                label="Log In"
                variant="primary"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
                fullWidth
              />
              
              {/* Demo Account Info */}
              <View style={styles.demoContainer}>
                <Typography variant="caption" color={colors.text.tertiary} center>
                  Demo Account: demo@user.com / password123
                </Typography>
              </View>
              
              {/* Register Button */}
              <View style={styles.registerContainer}>
                <Typography variant="body" color={colors.text.secondary}>
                  Don't have an account?
                </Typography>
                <Button
                  label="Register"
                  variant="outline"
                  onPress={handleRegisterPress}
                  style={styles.registerButton}
                />
              </View>
              
              {/* Need to Resend Verification Email */}
              {needsVerification && (
                <Button
                  label="Resend Verification Email"
                  variant="outline"
                  onPress={handleResendVerification}
                  loading={isLoading}
                  style={styles.resendButton}
                />
              )}
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
  loginButton: {
    marginTop: spacing.m
  },
  demoContainer: {
    marginTop: spacing.l,
    padding: spacing.m,
    backgroundColor: colors.cardDark,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.s
  },
  registerButton: {
    marginLeft: spacing.s
  },
  resendButton: {
    marginTop: spacing.m
  }
});

export default LoginScreen; 