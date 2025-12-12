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
import { theme } from './src/theme';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppState } from 'react-native'; // Added AppState
import { MedicationProvider, useMedication } from './src/context/MedicationContext'; // Added useMedication
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationActionProvider, useNotificationAction } from './src/context/NotificationActionContext';
import { NotificationActionModal } from './src/components/NotificationActionModal';
import { PermissionProvider } from './src/context/PermissionContext';
import { UserProvider } from './src/context/UserContext';
import { isTimePastDue } from './src/utils/TimeUtils';

// Ensure standard android cleanup
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

enableScreens(false);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component to handle notification events using the context
const NotificationHandlerListener = () => {
  const { showNotificationAction, activeTimeGroup } = useNotificationAction();
  const { doses } = useMedication();

  useEffect(() => {
    // Helper to check for past due pending doses
    const checkPendingDoses = () => {
      // If a modal is already open, don't override it
      if (activeTimeGroup) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      // Find the FIRST pending dose that is past due
      const pendingDose = doses.find(dose => {
        if (dose.status !== 'Pending') return false;

        // Check if time has passed
        return isTimePastDue(dose.scheduledTime);
      });

      if (pendingDose) {
        console.log('[NotificationHandler] Found pending dose, showing modal for time:', pendingDose.scheduledTime);
        showNotificationAction(pendingDose.scheduledTime);
      }
    };

    // 1. Check on Mount
    checkPendingDoses();

    // 2. Listener for App State changes (Background -> Foreground)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPendingDoses();
      }
    });

    // 3. Handle Cold Start (App launched from notification)
    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
        const { notification } = initialNotification;
        if (notification.data && notification.data.scheduledTime) {
          showNotificationAction(notification.data.scheduledTime as string);
        }
      }
    };

    checkInitialNotification();

    // 4. Handle Foreground events (App currently open)
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      // TRIGGER: When notification is delivered (pops up) OR user taps it
      if (type === EventType.DELIVERED || type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        const { notification } = detail;
        if (notification && notification.data && notification.data.scheduledTime) {
          console.log('[NotificationHandler] Notification delivered/pressed in foreground, showing modal.');
          showNotificationAction(notification.data.scheduledTime as string);
        }
      }
    });

    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, [doses, activeTimeGroup, showNotificationAction]); // Re-run if doses change (might cause loop if not careful, but status update changes doses so logic holds)

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
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('transparent');
      // Optional: Set button style based on theme (assuming dark icons for light theme app)
      NavigationBar.setButtonStyleAsync('dark');
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
        <UserProvider>
          <MedicationProvider>
            <NotificationActionProvider>
              <PaperProvider theme={theme}>
                <PermissionProvider>
                  <StatusBar
                    translucent={true}
                    backgroundColor="transparent"
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  />
                  <NotificationHandlerListener />
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </PermissionProvider>
              </PaperProvider>
            </NotificationActionProvider>
          </MedicationProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
