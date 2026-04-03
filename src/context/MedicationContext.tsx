import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppState, AppStateStatus, DeviceEventEmitter } from 'react-native';
import { Medication, Dose, MedicationStatus } from '../types/GempillTypes';
import NotificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface MedicationContextType {
    medications: Medication[];
    doses: Dose[];
    addMedication: (medication: Omit<Medication, 'id'>) => void;
    updateMedication: (medication: Medication) => void;
    updateDoseStatus: (doseId: string, status: Dose['status']) => void;
    rescheduleDoseGroup: (oldTime: string, newTime: string, isPersistent: boolean) => void;
    rescheduleSingleDose: (doseId: string, newTime: string) => void;
    stopMedication: (id: string) => void;
    finishMedication: (id: string) => void;
    pauseMedication: (id: string, days?: number) => void;
    resumeMedication: (id: string) => void;
    refreshDosesFromStorage: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

const INITIAL_MEDICATIONS: Medication[] = [];

// Helper to generate doses for today from medications
const generateDosesForToday = (meds: Medication[]): Dose[] => {
    const todayDoses: Dose[] = [];
    meds.forEach(med => {
        // Skip if Cancelled, or Finished
        if (med.status === 'Cancelled' || med.status === 'Finished') return;

        // Skip if Paused (check date)
        if (med.status === 'Paused') {
            if (!med.pausedUntil) return; // Indefinite pause
            if (new Date() < med.pausedUntil) return; // Still paused

            // If pausedUntil is in the past, effectively it's active again,
            // but we might want to update status back to Active lazily or just allow generating doses.
            // For this implementation, we'll assume the context handles status updates or we allow generation.
        }

        med.scheduledTimes.forEach((time, index) => {
            // Create a unique ID for the dose based on med ID and time
            // In a real app, this might be more robust
            const doseId = `${med.id}_${time}_${new Date().toDateString()}`;
            todayDoses.push({
                ...med,
                id: doseId,
                status: 'Pending' as const,
                scheduledTime: time,
                medicationId: med.id,
            });
        });
    });
    return todayDoses;
};

export const MedicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
    const [doses, setDoses] = useState<Dose[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const STORAGE_KEY_MEDS = '@medications';
    const STORAGE_KEY_DOSES = '@doses';
    const STORAGE_KEY_DOSES_DATE = '@doses_date';
    const STORAGE_KEY_DOSE_HISTORY = '@dose_history';

    // Helper to get timestamp for a time string (used in loadData and scheduleDoseAlarm)
    const getTimestampForTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    };

    // Helper to schedule alarms for doses (extracted to be reusable)
    const scheduleAlarmsForDoses = (dosesToSchedule: Dose[]) => {
        dosesToSchedule.forEach(dose => {
            if (dose.status === 'Pending') {
                const timestamp = getTimestampForTime(dose.scheduledTime);

                // Always schedule it. `scheduleNaggingAlarm` will automatically bump the timestamp
                // to tomorrow if it has already passed today.
                console.log(`[MedicationContext] Ensuring alarm schedule for ${dose.name} at ${dose.scheduledTime}`);
                NotificationService.scheduleNaggingAlarm(
                    timestamp,
                    dose.name,
                    `Time to take ${dose.frequency}`,
                    dose.medicationId,
                    dose.id,
                    dose.scheduledTime
                );
            }
        });
    };

    // Helper to archive doses to history
    const archiveDosesToHistory = async (dosesToArchive: Dose[], dateStr: string) => {
        try {
            const historyJson = await AsyncStorage.getItem(STORAGE_KEY_DOSE_HISTORY);
            let history: { date: string; doses: Dose[] }[] = historyJson ? JSON.parse(historyJson) : [];

            // Check if we already have an entry for this date (avoid duplicates)
            const existingIndex = history.findIndex(h => h.date === dateStr);
            if (existingIndex >= 0) {
                // Update existing entry
                history[existingIndex].doses = dosesToArchive;
            } else {
                // Add new entry
                history.push({ date: dateStr, doses: dosesToArchive });
            }

            // Keep only last 90 days of history
            if (history.length > 90) {
                history = history.slice(-90);
            }

            await AsyncStorage.setItem(STORAGE_KEY_DOSE_HISTORY, JSON.stringify(history));
            console.log(`[MedicationContext] Archived ${dosesToArchive.length} doses for ${dateStr}`);
        } catch (e) {
            console.error('Failed to archive doses to history', e);
        }
    };

    // 1. Load Data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [medsJson, dosesJson, dosesDateJson] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_MEDS),
                AsyncStorage.getItem(STORAGE_KEY_DOSES),
                AsyncStorage.getItem(STORAGE_KEY_DOSES_DATE)
            ]);

            let loadedMeds: Medication[] = [];
            if (medsJson) {
                loadedMeds = JSON.parse(medsJson);
                setMedications(loadedMeds);
            }

            let dosesToSchedule: Dose[] = [];
            const todayStr = new Date().toDateString();

            // Check date to see if we need to roll over
            const storedDate = dosesDateJson || '';
            const isToday = storedDate === todayStr;

            if (dosesJson && isToday) {
                // Same day, load existing doses
                const loadedDoses: Dose[] = JSON.parse(dosesJson);
                setDoses(loadedDoses);
                dosesToSchedule = loadedDoses;
            } else {
                // New day or no data
                console.log(`[MedicationContext] New day detected (Stored: ${storedDate}, Today: ${todayStr}). Regenerating doses.`);

                // 1. Archive previous day's doses if they exist
                if (dosesJson && storedDate) {
                    const oldDoses: Dose[] = JSON.parse(dosesJson);
                    const processedOldDoses = oldDoses.map(dose => {
                        if (dose.status === 'Pending') {
                            // If it was Pending yesterday, it's Missed now.
                            // Cancel any pending alarms associated with yesterday's specific schedule.
                            // (Since IDs are stable per time, Notifee Daily Repeat handles tomorrow, but
                            // we need to record this in history correctly as Missed).

                            // Let's cancel the alarm to avoid "drift" if we missed it and the medication rules changed.
                            // It will be correctly rescheduled by generateDosesForToday if still active.
                            NotificationService.cancelSchedule(dose.medicationId, dose.scheduledTime);
                            return { ...dose, status: 'Missed' as const };
                        }
                        return dose;
                    });
                    await archiveDosesToHistory(processedOldDoses, storedDate);
                }

                // 2. Clear "Taken" status for the new day?
                // Actually, generateDosesForToday creates clean "Pending" doses.
                if (loadedMeds.length > 0) {
                    const newDoses = generateDosesForToday(loadedMeds);
                    setDoses(newDoses);
                    dosesToSchedule = newDoses;
                    await AsyncStorage.setItem(STORAGE_KEY_DOSES_DATE, todayStr);
                } else {
                    setDoses([]);
                }
            }

            // Schedule alarms for all pending doses
            // NOTE: With "Daily" repetition, we might not strictly need to reschedule every time app opens,
            // but it's safe to ensure they are scheduled.
            // However, since we now use STABLE IDs, calling this again will just update/overwrite the existing alarm,
            // which is good for robustness.
            if (dosesToSchedule.length > 0) {
                // We only need to schedule if they are Pending
                const pending = dosesToSchedule.filter(d => d.status === 'Pending');
                if (pending.length > 0) {
                    console.log(`[MedicationContext] Ensuring alarms for ${pending.length} pending doses`);
                    scheduleAlarmsForDoses(pending);
                }
            }
        } catch (e) {
            console.error('Failed to load medication data', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    // AppState listener for new day refresh
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                const todayStr = new Date().toDateString();
                AsyncStorage.getItem(STORAGE_KEY_DOSES_DATE).then(storedDate => {
                    if (storedDate !== todayStr) {
                        console.log('[MedicationContext] App resumed on a new day, refreshing data...');
                        loadData();
                    }
                });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // 2. Save Data on Change
    useEffect(() => {
        if (isLoading) return; // Don't save empty state while loading

        const saveData = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medications));
                await AsyncStorage.setItem(STORAGE_KEY_DOSES, JSON.stringify(doses));
                // Also save the current date to track which day these doses belong to
                await AsyncStorage.setItem(STORAGE_KEY_DOSES_DATE, new Date().toDateString());
            } catch (e) {
                console.error('Failed to save medication data', e);
            }
        };

        saveData();
    }, [medications, doses, isLoading]);

    // 3. Refresh doses from storage (for syncing background changes)
    const refreshDosesFromStorage = async () => {
        try {
            const dosesJson = await AsyncStorage.getItem(STORAGE_KEY_DOSES);
            if (dosesJson) {
                const loadedDoses: Dose[] = JSON.parse(dosesJson);
                console.log('[MedicationContext] Refreshed doses from storage');
                setDoses(loadedDoses);
            }
        } catch (e) {
            console.error('Failed to refresh doses from storage', e);
        }
    };


    const scheduleDoseAlarm = (dose: Dose, specificTime?: string) => {
        const timeToSchedule = specificTime || dose.scheduledTime;
        const timestamp = getTimestampForTime(timeToSchedule);

        console.log(`[MedicationContext] Scheduling alarm for ${dose.name} at ${timeToSchedule} (timestamp: ${timestamp}) Current Time: ${Date.now()}`);

        if (timestamp < Date.now()) {
            console.log('[MedicationContext] Warning: Time is in the past. Notifee might trigger immediately or ignore.');
        }

        // Only schedule if it's in the future or very recent?
        // For now, schedule everything. Notifee handles past triggers by firing immediately if configured,
        // or we can add a check: if (timestamp > Date.now()) ...
        // But "Nagging" implies we shouldn't miss it.

        NotificationService.scheduleNaggingAlarm(
            timestamp,
            dose.name,
            `Time to take ${dose.frequency}`,
            dose.medicationId,
            dose.id,
            timeToSchedule
        );
    };

    const cancelDoseAlarm = (dose: Dose, specificTime?: string) => {
        const timeToCancel = specificTime || dose.scheduledTime;
        NotificationService.cancelSchedule(dose.medicationId, timeToCancel);
    };

    const addMedication = (newMed: Omit<Medication, 'id'>) => {
        const id = generateId();
        const medication: Medication = { ...newMed, id, status: 'Active' };

        setMedications(prev => [...prev, medication]);

        // Also add doses for this new medication for today
        const newDoses = generateDosesForToday([medication]);
        setDoses(prev => [...prev, ...newDoses]);

        // Schedule alarms for new doses
        newDoses.forEach(dose => scheduleDoseAlarm(dose));
    };

    const updateMedication = (updatedMed: Medication) => {
        setMedications(prev => prev.map(med => med.id === updatedMed.id ? updatedMed : med));

        // Update future doses for today if necessary (simplified: just update details of pending doses)
        // In a real app, we might need to re-schedule if times changed.
        // For now, let's update the dose metadata if the dose is still pending
        setDoses(prev => prev.map(dose => {
            if (dose.id.startsWith(updatedMed.id) && dose.status === 'Pending') {
                // If times changed, this logic is tricky without re-generating.
                // For this MVP, we will assume simple updates or just update display info.
                // If times changed, we ideally should remove old pending doses and add new ones.
                return { ...dose, ...updatedMed, status: dose.status, scheduledTime: dose.scheduledTime }; // Keep status and scheduledTime
            }
            return dose;
        }));
    };

    const updateDoseStatus = async (doseId: string, status: Dose['status']) => {
        const isCurrent = doses.some(d => d.id === doseId);

        if (isCurrent) {
            setDoses(prev => prev.map(dose => {
                if (dose.id === doseId) {
                    if (status === 'Taken' || status === 'Skipped') {
                        // Cancel today's alarm based on its current mutated schedule (might be snoozed)
                        NotificationService.cancelTodayAlarm(dose.medicationId, dose.scheduledTime);

                        // Reschedule the correct original time for tomorrow so the loop continues
                        const correctTimeStr = dose.originalScheduledTime || dose.scheduledTime;
                        const timeParts = correctTimeStr.split(':').map(Number);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(timeParts[0], timeParts[1], 0, 0);

                        NotificationService.scheduleNaggingAlarm(
                            tomorrow.getTime(),
                            dose.name,
                            `Time to take ${dose.frequency}`,
                            dose.medicationId,
                            dose.id,
                            correctTimeStr
                        );
                    }

                    const actionTime = (status === 'Taken' || status === 'Skipped') ? new Date().toISOString() : undefined;

                    return { ...dose, status, actionTime };
                }
                return dose;
            }));
        } else {
            // Check history
            try {
                const historyJson = await AsyncStorage.getItem(STORAGE_KEY_DOSE_HISTORY);
                if (historyJson) {
                    let history = JSON.parse(historyJson);
                    let historyUpdated = false;

                    for (let entry of history) {
                        const hIndex = entry.doses.findIndex((d: any) => d.id === doseId);
                        if (hIndex !== -1) {
                            const actionTime = (status === 'Taken' || status === 'Skipped') ? new Date().toISOString() : undefined;
                            entry.doses[hIndex] = { ...entry.doses[hIndex], status, actionTime };
                            historyUpdated = true;
                            break;
                        }
                    }

                    if (historyUpdated) {
                        await AsyncStorage.setItem(STORAGE_KEY_DOSE_HISTORY, JSON.stringify(history));
                        DeviceEventEmitter.emit('historyUpdated');
                    }
                }
            } catch (e) {
                console.error('Failed to update historical dose', e);
            }
        }
    };

    const rescheduleDoseGroup = (oldTime: string, newTime: string, isPersistent: boolean) => {
        // 1. Update Doses (Today)
        setDoses(prev => prev.map(dose => {
            if (dose.scheduledTime === oldTime) {
                // Cancel old alarm
                cancelDoseAlarm(dose, oldTime);

                // Schedule new alarm (if pending)
                if (dose.status === 'Pending') {
                    scheduleDoseAlarm(dose, newTime);
                }

                return {
                    ...dose,
                    scheduledTime: newTime,
                    originalScheduledTime: dose.originalScheduledTime || oldTime // Keep original if already set, else set to oldTime
                };
            }
            return dose;
        }));

        // 2. Update Medications (Persistent)
        if (isPersistent) {
            setMedications(prev => prev.map(med => {
                if (med.scheduledTimes.includes(oldTime)) {
                    return {
                        ...med,
                        scheduledTimes: med.scheduledTimes.map(t => t === oldTime ? newTime : t).sort()
                    };
                }
                return med;
            }));
        }
    };

    const rescheduleSingleDose = (doseId: string, newTime: string) => {
        setDoses(prev => prev.map(dose => {
            if (dose.id === doseId) {
                const oldTime = dose.scheduledTime;

                // Cancel old alarm
                cancelDoseAlarm(dose, oldTime);

                // Schedule new alarm (if pending) - forcing schedule even if it might be close
                if (dose.status === 'Pending') {
                    // Update the dose object temporarily for the alarm scheduler to pick up the new time
                    // Or just pass explicit time
                    const updatedDose = { ...dose, scheduledTime: newTime };
                    scheduleDoseAlarm(updatedDose, newTime);
                }

                return {
                    ...dose,
                    scheduledTime: newTime,
                    originalScheduledTime: dose.originalScheduledTime || oldTime
                };
            }
            return dose;
        }));
    };

    const stopMedication = (id: string) => {
        setMedications(prev => prev.map(med => med.id === id ? { ...med, status: 'Cancelled' } : med));

        // Remove pending doses for today and explicitly cancel their entire matching 14-day schedule blocks
        setDoses(prev => {
            const affectedDoses = prev.filter(dose => dose.id.startsWith(id) && dose.status === 'Pending');
            // Cancel all hardware alarms across the 14 days for these slots
            affectedDoses.forEach(dose => cancelDoseAlarm(dose));

            return prev.filter(dose => !(dose.id.startsWith(id) && dose.status === 'Pending'));
        });
    };

    const finishMedication = (id: string) => {
        setMedications(prev => prev.map(med => med.id === id ? { ...med, status: 'Finished' } : med));

        setDoses(prev => {
            const affectedDoses = prev.filter(dose => dose.id.startsWith(id) && dose.status === 'Pending');
            affectedDoses.forEach(dose => cancelDoseAlarm(dose));

            return prev.filter(dose => !(dose.id.startsWith(id) && dose.status === 'Pending'));
        });
    };

    const pauseMedication = (id: string, days?: number) => {
        let pausedUntil: Date | null = null;
        if (days) {
            pausedUntil = new Date();
            pausedUntil.setDate(pausedUntil.getDate() + days);
            pausedUntil.setHours(0, 0, 0, 0); // Start of the resume day
        }

        setMedications(prev => prev.map(med => med.id === id ? { ...med, status: 'Paused', pausedUntil } : med));

        // Remove pending doses for today and explicitly cancel their entire matching 14-day schedule blocks
        setDoses(prev => {
            const affectedDoses = prev.filter(dose => dose.id.startsWith(id) && dose.status === 'Pending');
            // Cancel all hardware alarms so they don't ring while paused
            affectedDoses.forEach(dose => cancelDoseAlarm(dose));

            return prev.filter(dose => !(dose.id.startsWith(id) && dose.status === 'Pending'));
        });
    };

    const resumeMedication = (id: string) => {
        setMedications(prev => {
            const updatedMeds = prev.map(med => med.id === id ? { ...med, status: 'Active' as MedicationStatus, pausedUntil: undefined } : med);

            // Re-generate doses for today for this resumed med
            // We need to find the med object
            const resumedMed = updatedMeds.find(m => m.id === id);
            if (resumedMed) {
                // We need to set doses state, but we can't do it inside this map callback cleanly if we want to use the new med.
                // So we'll do a side-effect after state update or just duplicate logic.
                // Better pattern: calculate new doses outside.
            }
            return updatedMeds;
        });

        // HACK: We need the updated medication to generate doses.
        // We'll rely on the previous state but force the status to Active for generation.
        setMedications(currentMeds => {
            const med = currentMeds.find(m => m.id === id);
            if (med && med.status === 'Active') {
                // It's already updated in the previous setMedications call? No, batching.
                // React batching might make this tricky.
                // Let's use a functional update that handles both or just do it in one go if possible.
                // Actually, let's just use the `medications` from closure but that's stale.
                // Correct way:
                const newDoses = generateDosesForToday([med]);
                // Check if doses already exist to avoid duplicates? generateDosesForToday doesn't check.
                setDoses(prevDoses => {
                    // Filter out any potential old pending ones (already done in pause/stop but good to be safe)
                    const filtered = prevDoses.filter(d => !d.id.startsWith(id));
                    return [...filtered, ...newDoses];
                });
            }
            return currentMeds;
        });
    };

    return (
        <MedicationContext.Provider value={{
            medications,
            doses,
            addMedication,
            updateMedication,
            updateDoseStatus,
            rescheduleDoseGroup,
            rescheduleSingleDose,
            stopMedication,
            finishMedication,
            pauseMedication,
            resumeMedication,
            refreshDosesFromStorage
        }}>
            {children}
        </MedicationContext.Provider>
    );
};

export const useMedication = () => {
    const context = useContext(MedicationContext);
    if (context === undefined) {
        throw new Error('useMedication must be used within a MedicationProvider');
    }
    return context;
};
