import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Screen, 
  InputField, 
  Button, 
  theme 
} from '../components';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    // Allow alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return username.length >= 3 && usernameRegex.test(username);
  };

  const handleRegister = async () => {
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
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

    try {
      setIsLoading(true);
      const result = await register(username, email, password);
      
      if (result.success) {
        Alert.alert('Registration Successful', 'You can now log in with your credentials', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Registration Failed', result.error || 'An error occurred during registration');
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Screen
      title="Create Account"
      onBackPress={() => navigation.goBack()}
      backgroundColor={theme.colors.background.main}
      showBottomNav={false}
      scrollable={true}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Join Tymelyne</Text>
      <Text style={styles.subtitle}>Create your account to start learning</Text>

      <View style={styles.formContainer}>
        <InputField
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <InputField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          style={styles.registerButton}
        />
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Text 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Sign In
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  title: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: height * 0.02,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.secondary,
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  registerButton: {
    marginTop: theme.spacing.m,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.l,
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.regular,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.regular,
  },
});

export default RegisterScreen; 