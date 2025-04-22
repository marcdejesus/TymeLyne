import React, { useState, useContext } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

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
      const result = await login(email, password);
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
      }
    } catch (err) {
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor="#D35C34" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Account Info */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Account</Text>
            <Text style={styles.demoText}>Email: demo@example.com</Text>
            <Text style={styles.demoText}>Password: password</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F1E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D35C34',
    height: 60,
    paddingHorizontal: 15,
  },
  headerLeft: {
    width: 40, // For alignment
  },
  headerRight: {
    width: 40, // For alignment
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
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
    marginTop: height * 0.02,
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  appName: {
    fontSize: width > 375 ? 30 : 26,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A3A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0D8C0',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#D35C34',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 25,
  },
  registerText: {
    color: '#6B6B5A',
    fontSize: 16,
  },
  registerLink: {
    color: '#D35C34',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(211, 92, 52, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D35C34',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#6B6B5A',
    marginBottom: 4,
  },
});

export default LoginScreen; 