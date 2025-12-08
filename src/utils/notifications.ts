import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#5A55D1',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }
}

export function setupNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
        }),
    });
}

export async function scheduleMedicationReminder(
    id: string,
    medicationName: string,
    time: string // "HH:MM"
) {
    const [hour, minute] = time.split(':').map(Number);

    // Create a trigger for every day at this time
    // Note: For simplicity in this demo, we are scheduling a daily trigger.
    // In a real app, you might manage this more dynamically.

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Medication Reminder",
            body: `It's time to take your ${medicationName} at ${time}`,
            data: { id, medicationName, time },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
        },
        identifier: id, // Use dose/medication ID to easily cancel
    });
}

export async function cancelMedicationReminder(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
}
