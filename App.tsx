import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MedicationProvider } from './src/context/MedicationContext';
import { AppNavigator } from './src/navigation/AppNavigator';

import * as NavigationBar from 'expo-navigation-bar';

enableScreens(false);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, error] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  // Enforce Edge-to-Edge on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#ffffff00'); // Transparent
      NavigationBar.setButtonStyleAsync('dark'); // Dark icons (for light background)
    }
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // Safety fallback: Force hide splash screen after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MedicationProvider>
          <PaperProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </MedicationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
