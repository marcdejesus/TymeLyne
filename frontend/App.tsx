import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';

// Comment out the Navigation import until all dependencies are installed
// import Navigation from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Navigation />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
