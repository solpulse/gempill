import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { Dose } from '../types/GempillTypes';
import { DeviceEventEmitter } from 'react-native';

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
                console.log(`[StorageService] Dose ${doseId} not found in doses, checking history`);
                const historyJson = await AsyncStorage.getItem('@dose_history');
                if (historyJson) {
                    let history = JSON.parse(historyJson);
                    let foundAndUpdated = false;
                    for (let entry of history) {
                        const hIndex = entry.doses.findIndex((d: Dose) => d.id === doseId);
                        if (hIndex !== -1) {
                            const actionTime = (status === 'Taken' || status === 'Skipped') ? new Date().toISOString() : undefined;
                            entry.doses[hIndex] = { ...entry.doses[hIndex], status, actionTime };
                            foundAndUpdated = true;
                            // Do not reschedule alarm for historical edits to avoid duplicates for today
                            break;
                        }
                    }
                    if (foundAndUpdated) {
                        await AsyncStorage.setItem('@dose_history', JSON.stringify(history));
                        DeviceEventEmitter.emit('historyUpdated');
                        console.log(`[StorageService] Historical dose ${doseId} updated to ${status}`);
                        return true;
                    }
                }
                console.log(`[StorageService] Dose ${doseId} not found anywhere`);
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
                
                // Cancel today's alarm based on its current mutated schedule (might be snoozed)
                await NotificationService.cancelTodayAlarm(dose.medicationId, dose.scheduledTime);

                // Restore the original scheduled time so tomorrow it rings correctly
                const correctTimeStr = dose.originalScheduledTime || dose.scheduledTime;
                const timeParts = correctTimeStr.split(':').map(Number);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(timeParts[0], timeParts[1], 0, 0);

                await NotificationService.scheduleNaggingAlarm(
                    tomorrow.getTime(),
                    dose.name,
                    `Time to take ${dose.frequency}`,
                    dose.medicationId,
                    dose.id,
                    correctTimeStr
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

            // Cancel the previous alarm before scheduling the snooze, so we don't end up with both
            await NotificationService.cancelTodayAlarm(dose.medicationId, dose.scheduledTime);

            // Schedule a new notification for the snoozed time.
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
