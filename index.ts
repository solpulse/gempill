import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';
import StorageService from './src/services/StorageService';

import App from './App';

// Register background handler (Critical for Notifee actions to work when app is closed)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    console.log(`[onBackgroundEvent] Type: ${type}, Notification: ${notification?.id}, Action: ${pressAction?.id}`);

    // Handle notification actions in background
    if (type === EventType.ACTION_PRESS && notification && pressAction) {
        const { doseId } = notification.data || {};

        if (!doseId) {
            console.log('[onBackgroundEvent] No doseId found in notification data');
            return;
        }

        if (pressAction.id === 'take-pill') {
            console.log('[onBackgroundEvent] Processing Take Pill action');
            await StorageService.updateDoseStatus(doseId as string, 'Taken');
            // Cancel the notification
            if (notification.id) {
                await notifee.cancelNotification(notification.id);
            }
        } else if (pressAction.id === 'snooze') {
            console.log('[onBackgroundEvent] Processing Snooze action');
            // Cancel current notification first
            if (notification.id) {
                await notifee.cancelNotification(notification.id);
            }
            // Reschedule for 10 minutes from now
            await StorageService.rescheduleDose(doseId as string, 10);
        }
    }

    // Handle notification dismissal (if needed for cleanup)
    if (type === EventType.DISMISSED) {
        console.log('[onBackgroundEvent] Notification dismissed:', notification?.id);
    }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
