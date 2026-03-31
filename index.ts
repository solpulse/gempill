import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';
import StorageService from './src/services/StorageService';
import NativeNotificationActions from './src/services/NativeNotificationActions';

import App from './App';

// Register background handler (Critical for Notifee actions to work when app is closed)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    console.log(`[onBackgroundEvent] Type: ${type}, Notification: ${notification?.id}, Action: ${pressAction?.id}`);

    // When a notification is DELIVERED in background, replace it with our
    // broadcast-based version so action buttons don't close the drawer
    if (type === EventType.DELIVERED && notification && notification.id && notification.data) {
        console.log('[onBackgroundEvent] Notification delivered, replacing with broadcast-based actions');
        try {
            await NativeNotificationActions.replaceNotificationActions(notification.id, {
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
            });
        } catch (err) {
            console.error('[onBackgroundEvent] Failed to replace notification:', err);
        }
    }

    // Fallback: Handle Notifee ACTION_PRESS (in case our broadcast replacement
    // didn't happen in time, or for older Android versions)
    if (type === EventType.ACTION_PRESS && notification && pressAction) {
        const { doseId } = notification.data || {};

        if (!doseId) {
            console.log('[onBackgroundEvent] No doseId found in notification data');
            return;
        }

        if (pressAction.id === 'take-pill') {
            console.log('[onBackgroundEvent] Fallback: Processing Take Pill action');
            await StorageService.updateDoseStatus(doseId as string, 'Taken');
            if (notification.id) {
                await notifee.cancelNotification(notification.id);
            }
        } else if (pressAction.id === 'snooze') {
            console.log('[onBackgroundEvent] Fallback: Processing Snooze action');
            await StorageService.rescheduleDose(doseId as string, 10);
            if (notification.id) {
                await notifee.cancelNotification(notification.id);
            }
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
