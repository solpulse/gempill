import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Medication, Dose, MedicationStatus } from '../types/GempillTypes';
import NotificationService from '../services/NotificationService';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface MedicationContextType {
    medications: Medication[];
    doses: Dose[];
    addMedication: (medication: Omit<Medication, 'id'>) => void;
    updateMedication: (medication: Medication) => void;
    updateDoseStatus: (doseId: string, status: Dose['status']) => void;
    rescheduleDoseGroup: (oldTime: string, newTime: string, isPersistent: boolean) => void;
    stopMedication: (id: string) => void;
    pauseMedication: (id: string, days?: number) => void;
    resumeMedication: (id: string) => void;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

const INITIAL_MEDICATIONS: Medication[] = [
    {
        id: '1',
        name: 'Lisinopril',
        dosage: 10,
        dosageUnit: 'mg',
        startDate: new Date(),
        frequency: '1 capsule',
        timesPerDay: 1,
        scheduledTimes: ['08:00'],
        color: '#CE93D8',
        icon: 'medkit',
        status: 'Active',
    },
    {
        id: '2',
        name: 'Metformin',
        dosage: 500,
        dosageUnit: 'mg',
        startDate: new Date(),
        frequency: '1 tablet',
        timesPerDay: 1,
        scheduledTimes: ['08:00'],
        color: '#60D1A9',
        icon: 'tablet-landscape',
        status: 'Active',
    },
    {
        id: '3',
        name: 'Vitamin D',
        dosage: 2000,
        dosageUnit: 'IU',
        startDate: new Date(),
        frequency: '1 softgel',
        timesPerDay: 1,
        scheduledTimes: ['13:00'],
        color: '#FFF59D',
        icon: 'nutrition',
        status: 'Active',
    },
    {
        id: '4',
        name: 'Atorvastatin',
        dosage: 20,
        dosageUnit: 'mg',
        startDate: new Date(),
        frequency: '1 tablet',
        timesPerDay: 1,
        scheduledTimes: ['21:00'],
        color: '#90CAF9',
        icon: 'flask',
        status: 'Active',
    },
];

// Helper to generate doses for today from medications
const generateDosesForToday = (meds: Medication[]): Dose[] => {
    const todayDoses: Dose[] = [];
    meds.forEach(med => {
        // Skip if Stopped
        if (med.status === 'Stopped') return;

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

    // Initialize doses on mount (or when medications change, but be careful about overwriting statuses)
    // For simplicity, we'll just initialize if empty, or we could have a more complex logic.
    // For this task, let's just generate them initially.
    useEffect(() => {
        if (doses.length === 0) {
            const initialDoses = generateDosesForToday(medications);
            setDoses(initialDoses);

            // Schedule alarms for all pending doses
            initialDoses.forEach(dose => {
                if (dose.status === 'Pending') {
                    scheduleDoseAlarm(dose);
                }
            });
        }
    }, []);

    const getTimestampForTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    };

    const scheduleDoseAlarm = (dose: Dose, specificTime?: string) => {
        const timeToSchedule = specificTime || dose.scheduledTime;
        const timestamp = getTimestampForTime(timeToSchedule);

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
        const timestamp = getTimestampForTime(timeToCancel);
        const notificationId = `med-${dose.medicationId}-${timestamp}`;
        NotificationService.cancelNotification(notificationId);
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

    const updateDoseStatus = (doseId: string, status: Dose['status']) => {
        setDoses(prev => prev.map(dose => {
            if (dose.id === doseId) {
                // If status is changing to Taken or Skipped, cancel the alarm
                if (status === 'Taken' || status === 'Skipped') {
                    cancelDoseAlarm(dose);
                }
                // If status is changing BACK to Pending (undo?), reschedule?
                // For simplicity, let's assume we might need this if we implement undo.
                // But for now, just cancel.

                return { ...dose, status };
            }
            return dose;
        }));
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

    const stopMedication = (id: string) => {
        setMedications(prev => prev.map(med => med.id === id ? { ...med, status: 'Stopped' } : med));
        // Remove pending doses for today
        setDoses(prev => prev.filter(dose => !(dose.id.startsWith(id) && dose.status === 'Pending')));
    };

    const pauseMedication = (id: string, days?: number) => {
        let pausedUntil: Date | null = null;
        if (days) {
            pausedUntil = new Date();
            pausedUntil.setDate(pausedUntil.getDate() + days);
            pausedUntil.setHours(0, 0, 0, 0); // Start of the resume day
        }

        setMedications(prev => prev.map(med => med.id === id ? { ...med, status: 'Paused', pausedUntil } : med));
        // Remove pending doses for today
        setDoses(prev => prev.filter(dose => !(dose.id.startsWith(id) && dose.status === 'Pending')));
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
            stopMedication,
            pauseMedication,
            resumeMedication
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
