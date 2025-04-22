import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Screen, 
  InputField, 
  Button, 
  Card,
  theme 
} from '../components';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error } = useContext(AuthContext);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await login(email, password);
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Screen
      title="Sign In"
      backgroundColor={theme.colors.background.main}
      showBottomNav={false}
      scrollable={true}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/favicon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>Tymelyne</Text>
        <Text style={styles.tagline}>Your learning journey awaits</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button
          title={isLoading ? '' : 'Sign In'}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
        />
      </View>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <Text 
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          Create Account
        </Text>
      </View>

      {/* Demo Account Info */}
      <Card style={styles.demoContainer}>
        <Text style={styles.demoTitle}>Demo Account</Text>
        <Text style={styles.demoText}>Email: demo@example.com</Text>
        <Text style={styles.demoText}>Password: password</Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: 10,
  },
  tagline: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.secondary,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: theme.spacing.l,
  },
  loginButton: {
    marginTop: theme.spacing.m,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  registerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.regular,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.regular,
  },
  demoContainer: {
    alignItems: 'center',
    width: '90%',
    backgroundColor: `${theme.colors.primary}10`, // 10% opacity of primary color
  },
  demoTitle: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  demoText: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
});

export default LoginScreen; 