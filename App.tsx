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
import StorageService from './src/services/StorageService';
import { theme } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppState } from 'react-native'; // Added AppState
import { MedicationProvider, useMedication } from './src/context/MedicationContext'; // Added useMedication
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationActionProvider, useNotificationAction } from './src/context/NotificationActionContext';
import { NotificationActionModal } from './src/components/NotificationActionModal';
import { PermissionProvider, usePermission } from './src/context/PermissionContext';
import { UserProvider } from './src/context/UserContext';
import { isTimePastDue } from './src/utils/TimeUtils';
import NativeNotificationActions, { NotificationActionEvent } from './src/services/NativeNotificationActions';

// Ensure standard android cleanup
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

enableScreens(false);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component to handle notification events using the context
const NotificationHandlerListener = () => {
  const { showNotificationAction, activeTimeGroup, ignoredTimes } = useNotificationAction();
  const { doses, updateDoseStatus, rescheduleSingleDose, refreshDosesFromStorage } = useMedication();
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
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // Refresh doses from storage first (in case background actions updated them)
        await refreshDosesFromStorage();
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

    // 4. Handle Foreground notification events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      // When a notification is DELIVERED, replace its action buttons with our
      // native BroadcastReceiver-based ones so the drawer stays open
      if (type === EventType.DELIVERED) {
        const { notification } = detail;
        if (notification && notification.id && notification.data && notification.data.scheduledTime) {
          console.log('[NotificationHandler] Notification delivered, replacing actions with broadcast-based ones');
          
          // Replace the Notifee notification with our native one
          NativeNotificationActions.replaceNotificationActions(notification.id, {
            title: notification.title || 'Medication Reminder',
            body: notification.body || '',
            channelId: 'critical-alerts',
            data: {
              doseId: (notification.data.doseId as string) || '',
              medicationId: (notification.data.medicationId as string) || '',
              scheduledTime: (notification.data.scheduledTime as string) || '',
              medName: (notification.data.medName as string) || '',
            },
            actions: [
              { title: '✅ Take Pill', id: 'take-pill' },
              { title: '⏰ +10 Min', id: 'snooze' },
            ],
          }).catch((err: Error) => console.error('[NotificationHandler] Failed to replace notification:', err));
          
          // Also show the in-app modal
          showNotificationAction(notification.data.scheduledTime as string);
        }
      }
      
      // When user taps the notification body (not action buttons), show modal
      if (type === EventType.PRESS) {
        const { notification } = detail;
        if (notification && notification.data && notification.data.scheduledTime) {
          console.log('[NotificationHandler] Notification pressed in foreground, showing modal.');
          showNotificationAction(notification.data.scheduledTime as string);
        }
      }
      
      // Fallback: still handle Notifee ACTION_PRESS in case our native replacement somehow
      // didn't work (e.g., timing issue). Uses StorageService to avoid React state re-renders.
      if (type === EventType.ACTION_PRESS && detail.notification && detail.pressAction) {
        const { pressAction, notification } = detail;
        const { doseId } = notification.data || {};

        if (pressAction.id === 'take-pill' && doseId) {
          console.log('[NotificationHandler] Fallback Notifee Action: Take Pill', doseId);
          StorageService.updateDoseStatus(doseId as string, 'Taken');
          if (notification.id) {
            notifee.cancelNotification(notification.id);
          }
        } else if (pressAction.id === 'snooze' && doseId) {
          console.log('[NotificationHandler] Fallback Notifee Action: Snooze', doseId);
          StorageService.rescheduleDose(doseId as string, 10);
          if (notification.id) {
            notifee.cancelNotification(notification.id);
          }
        }
      }
    });

    // 5. Listen for action events from our native BroadcastReceiver
    // These come through when user presses action buttons on the broadcast-based notification
    const unsubscribeNativeActions = NativeNotificationActions.onAction((event) => {
      console.log('[NotificationHandler] Native action received:', event.actionId, event.doseId);
      
      if (event.actionId === 'take-pill' && event.doseId) {
        StorageService.updateDoseStatus(event.doseId, 'Taken');
      } else if (event.actionId === 'snooze' && event.doseId) {
        StorageService.rescheduleDose(event.doseId, 10);
      }
    });

    // 6. Check for pending actions from when app was killed
    NativeNotificationActions.getPendingAction().then((pendingAction) => {
      if (pendingAction) {
        console.log('[NotificationHandler] Processing pending action:', pendingAction.actionId);
        if (pendingAction.actionId === 'take-pill' && pendingAction.doseId) {
          StorageService.updateDoseStatus(pendingAction.doseId, 'Taken');
        } else if (pendingAction.actionId === 'snooze' && pendingAction.doseId) {
          StorageService.rescheduleDose(pendingAction.doseId, 10);
        }
      }
    });


    return () => {
      subscription.remove();
      unsubscribe();
      unsubscribeNativeActions();
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
