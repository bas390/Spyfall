import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation/AppNavigator';
import LocationSelectionScreen from './src/screens/LocationSelectionScreen';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme, isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Navigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App; 