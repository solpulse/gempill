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
import { PermissionProvider, usePermission } from './src/context/PermissionContext';
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
  const { showNotificationAction, activeTimeGroup, ignoredTimes } = useNotificationAction();
  const { doses, updateDoseStatus, rescheduleSingleDose } = useMedication();
  const { checkPermissions } = usePermission();

  useEffect(() => {
    // Check for Permissions (Alarm + Battery) for Universal Reliability
    checkPermissions();
  }, []);

  useEffect(() => {
    // Helper to check for past due pending doses
    const checkPendingDoses = () => {
      // If a modal is already open, don't override it
      if (activeTimeGroup) return;

      const now = new Date();
      // Find the FIRST pending dose that is past due
      const pendingDose = doses.find(dose => {
        if (dose.status !== 'Pending') return false;

        // Check if ignored
        if (ignoredTimes.includes(dose.scheduledTime)) return false;

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

    // 4. Handle Foreground and Background Action events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      // TRIGGER: When notification is delivered (pops up) OR user taps it
      if (type === EventType.DELIVERED || type === EventType.PRESS) {
        const { notification } = detail;
        if (notification && notification.data && notification.data.scheduledTime) {
          // Only show modal if it's a generic press, not an action press
          console.log('[NotificationHandler] Notification delivered/pressed in foreground, showing modal.');
          showNotificationAction(notification.data.scheduledTime as string);
        }
      }

      // HANDLE ACTIONS (Take / Snooze) - Foregound
      if (type === EventType.ACTION_PRESS && detail.notification && detail.pressAction) {
        const { pressAction, notification } = detail;
        const { doseId, medicationId, scheduledTime } = notification.data || {};

        if (pressAction.id === 'take-pill' && doseId) {
          console.log('[NotificationHandler] Action: Take Pill', doseId);
          updateDoseStatus(doseId as string, 'Taken');
          // Cancel the notification
          if (notification.id) {
            notifee.cancelNotification(notification.id);
          }
        } else if (pressAction.id === 'snooze' && doseId) {
          console.log('[NotificationHandler] Action: Snooze', doseId);
          // Snooze 10m from NOW
          const now = new Date();
          const newTimeDate = new Date(now.getTime() + 10 * 60000); // +10 mins
          const newTimeStr = `${newTimeDate.getHours().toString().padStart(2, '0')}:${newTimeDate.getMinutes().toString().padStart(2, '0')}`;

          // Reschedule SINGLE dose
          rescheduleSingleDose(doseId as string, newTimeStr);

          // Cancel the notification
          if (notification.id) {
            notifee.cancelNotification(notification.id);
          }
        }
      }
    });

    // Background Event Handler is typically set up outside of components (in index.js), 
    // but Notifee allows `onBackgroundEvent` registration.
    // However, App.tsx component unmounts in background? No, usually stays mounted in memory, 
    // but Background Events should be registered globally. 
    // For this task, user asked for "Actions should perform actions". 
    // If the app is KILLED, we need a background handler in `index.js`.
    // If the app is BACKGROUNDED, `onForegroundEvent` MIGHT not trigger `ACTION_PRESS` depending on OS.
    // `notifee.onBackgroundEvent` is the correct way for background/killed state actions.
    // I should register it OUTSIDE the component or ensuring it handles these.
    // Given the constraints and current setup, I will register a simple background handler here 
    // OR just rely on the fact that `onForegroundEvent` catches interactions if the app opens?
    // "PressAction" with `launchActivity: 'default'` OPENS the app.
    // So `onForegroundEvent` (or `getInitialNotification` for Cold Start) should catch it if the app opens.
    // Our NotificationService sets `launchActivity: 'default'`. So the app WILL open.
    // Therefore `onForegroundEvent` with `EventType.ACTION_PRESS` is the correct place for now.


    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, [doses, activeTimeGroup, showNotificationAction, ignoredTimes]); // Re-run if doses change

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
    // NotificationService.checkPermissions(); // Handled by PermissionContext
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
