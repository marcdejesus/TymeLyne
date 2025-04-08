import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

/**
 * Sign In Screen - Allows users to sign in to their account
 */
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Handle the sign in process
  const handleSignIn = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would verify credentials with a backend
      // For this demo, we'll simulate authentication
      const userData = {
        email,
        name: 'Demo User', // This would come from the backend
        username: 'demo_user',
        avatar: null // You might want to add a default avatar
      };
      
      // Login using the auth context
      const success = await login(userData);
      
      if (success) {
        console.log('User logged in successfully');
        // Navigation is handled by the app navigator
      } else {
        Alert.alert('Error', 'Failed to log in. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/bomb-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Welcome Text */}
        <Text style={styles.welcomeTitle}>Welcome to Tyme Lyne!</Text>
        <Text style={styles.welcomeSubtitle}>The best way to learn new skills</Text>
        
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>
        
        {/* Link to Sign Up */}
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('SignUp')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    color: 'white',
    width: '100%',
  },
  button: {
    backgroundColor: '#E67E22',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A9784A',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    color: '#E67E22',
    fontSize: 14,
  },
});

export default SignInScreen; 