import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { Dose } from '../types/GempillTypes';

const STORAGE_KEY_DOSES = '@doses';

/**
 * Standalone Storage Service for background notification handling.
 * This service provides direct AsyncStorage access without React Context dependency.
 * Used by index.ts background handler when the app is closed.
 */
class StorageService {
    private static instance: StorageService;

    private constructor() { }

    static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    /**
     * Update dose status directly in AsyncStorage.
     * Used when handling notification actions in background.
     */
    async updateDoseStatus(doseId: string, status: 'Taken' | 'Skipped' | 'Pending'): Promise<boolean> {
        try {
            const dosesJson = await AsyncStorage.getItem(STORAGE_KEY_DOSES);
            if (!dosesJson) {
                console.log('[StorageService] No doses found in storage');
                return false;
            }

            const doses: Dose[] = JSON.parse(dosesJson);
            const doseIndex = doses.findIndex(d => d.id === doseId);

            if (doseIndex === -1) {
                console.log(`[StorageService] Dose ${doseId} not found`);
                return false;
            }

            // Update the dose
            const actionTime = (status === 'Taken' || status === 'Skipped')
                ? new Date().toISOString()
                : undefined;

            doses[doseIndex] = {
                ...doses[doseIndex],
                status,
                actionTime
            };

            // Handle notification cancellation and reschedule for tomorrow!
            if (status === 'Taken' || status === 'Skipped') {
                const dose = doses[doseIndex];
                await NotificationService.cancelTodayAlarm(dose.medicationId, dose.scheduledTime);

                const timeParts = dose.scheduledTime.split(':').map(Number);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(timeParts[0], timeParts[1], 0, 0);

                await NotificationService.scheduleNaggingAlarm(
                    tomorrow.getTime(),
                    dose.name,
                    `Time to take ${dose.frequency}`,
                    dose.medicationId,
                    dose.id,
                    dose.scheduledTime
                );
            }

            // Save back to storage
            await AsyncStorage.setItem(STORAGE_KEY_DOSES, JSON.stringify(doses));
            console.log(`[StorageService] Dose ${doseId} updated to ${status}`);
            return true;
        } catch (error) {
            console.error('[StorageService] Error updating dose status:', error);
            return false;
        }
    }

    /**
     * Reschedule a dose by updating its time and scheduling a new notification.
     * Used for snooze functionality from background.
     */
    async rescheduleDose(doseId: string, minutesFromNow: number): Promise<boolean> {
        try {
            const dosesJson = await AsyncStorage.getItem(STORAGE_KEY_DOSES);
            if (!dosesJson) {
                console.log('[StorageService] No doses found in storage');
                return false;
            }

            const doses: Dose[] = JSON.parse(dosesJson);
            const doseIndex = doses.findIndex(d => d.id === doseId);

            if (doseIndex === -1) {
                console.log(`[StorageService] Dose ${doseId} not found`);
                return false;
            }

            const dose = doses[doseIndex];

            // Calculate new time
            const now = new Date();
            const newTimeDate = new Date(now.getTime() + minutesFromNow * 60000);
            const newTimeStr = `${newTimeDate.getHours().toString().padStart(2, '0')}:${newTimeDate.getMinutes().toString().padStart(2, '0')}`;

            // Update the dose
            doses[doseIndex] = {
                ...dose,
                scheduledTime: newTimeStr,
                originalScheduledTime: dose.originalScheduledTime || dose.scheduledTime
            };

            // Save to storage
            await AsyncStorage.setItem(STORAGE_KEY_DOSES, JSON.stringify(doses));

            // Schedule a new notification
            const newTimestamp = newTimeDate.getTime();
            await NotificationService.scheduleNaggingAlarm(
                newTimestamp,
                dose.name,
                `Time to take ${dose.frequency}`,
                dose.medicationId,
                dose.id,
                newTimeStr
            );

            console.log(`[StorageService] Dose ${doseId} rescheduled to ${newTimeStr}`);
            return true;
        } catch (error) {
            console.error('[StorageService] Error rescheduling dose:', error);
            return false;
        }
    }
}

export default StorageService.getInstance();
