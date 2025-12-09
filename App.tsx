import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
// Step 1: Import StatusBar from react-native and useColorScheme
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';
// Removed: import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import notifee, { EventType } from '@notifee/react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationService from './src/services/NotificationService';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MedicationProvider } from './src/context/MedicationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationActionProvider, useNotificationAction } from './src/context/NotificationActionContext';
import { NotificationActionModal } from './src/components/NotificationActionModal';

// Ensure standard android cleanup
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

enableScreens(false);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component to handle notification events using the context
const NotificationHandlerListener = () => {
  const { showNotificationAction } = useNotificationAction();

  useEffect(() => {
    // 1. Handle Cold Start (App launched from notification)
    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
        const { notification } = initialNotification;
        if (notification.data && notification.data.doseId) {
          showNotificationAction(notification.data as any);
        }
      }
    };

    checkInitialNotification();

    // 2. Handle Foreground events (App currently open)
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        const { notification } = detail;
        if (notification && notification.data && notification.data.doseId) {
          showNotificationAction(notification.data as any);
        }
      }
    });

    return unsubscribe;
  }, []);

  return <NotificationActionModal />;
};

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [fontsLoaded, error] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    // Only set background color, let styles.xml handle transparency
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync("transparent");
      // Clear any persistent settings if possible or just rely on XML
    }

    // Initialize Notification Service
    NotificationService.checkPermissions();
    NotificationService.createChannel();
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
          <NotificationActionProvider>
            <PaperProvider>
              <StatusBar
                translucent={true}
                backgroundColor="transparent"
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              />
              <NotificationHandlerListener />
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </PaperProvider>
          </NotificationActionProvider>
        </MedicationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
