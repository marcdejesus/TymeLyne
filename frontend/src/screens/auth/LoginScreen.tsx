import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';
import { AuthError } from '@supabase/supabase-js';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        const authError = error as AuthError;
        if (authError.message === 'Email not confirmed') {
          setError('Please verify your email before logging in');
          setEmailConfirmationSent(true);
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      Toast.show({
        type: 'success',
        text1: 'Confirmation email sent',
        text2: 'Please check your inbox to verify your account',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        
        {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
        
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign In
        </Button>
        
        {emailConfirmationSent && (
          <Button
            mode="outlined"
            onPress={resendConfirmationEmail}
            disabled={loading}
            style={styles.resendButton}
          >
            Resend Confirmation Email
          </Button>
        )}
        
        <Button
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.link}
        >
          Forgot Password?
        </Button>
        
        <Button
          onPress={() => navigation.navigate('Register')}
          style={styles.link}
        >
          Don't have an account? Sign Up
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  resendButton: {
    marginBottom: 10,
  },
  link: {
    marginTop: 8,
  },
}); 