import * as SecureStore from 'expo-secure-store';

/**
 * Utility function to clear all auth-related items from SecureStore
 * Call this when you need to reset the auth state
 */
const resetAuthState = async () => {
  try {
    console.log('Clearing auth state from SecureStore...');
    
    // Remove token and user data from storage
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('user');
    
    // You can add any other auth-related items here
    
    console.log('✅ Auth state cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing auth state:', error);
    return { success: false, error };
  }
};

export { resetAuthState }; 