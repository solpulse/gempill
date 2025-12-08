import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Medication, Dose } from '../types/GempillTypes';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface MedicationContextType {
    medications: Medication[];
    doses: Dose[];
    addMedication: (medication: Omit<Medication, 'id'>) => void;
    updateMedication: (medication: Medication) => void;
    updateDoseStatus: (doseId: string, status: Dose['status']) => void;
    rescheduleDoseGroup: (oldTime: string, newTime: string, isPersistent: boolean) => void;
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
    },
];

// Helper to generate doses for today from medications
const generateDosesForToday = (meds: Medication[]): Dose[] => {
    const todayDoses: Dose[] = [];
    meds.forEach(med => {
        med.scheduledTimes.forEach((time, index) => {
            // Create a unique ID for the dose based on med ID and time
            // In a real app, this might be more robust
            const doseId = `${med.id}_${time}_${new Date().toDateString()}`;
            todayDoses.push({
                ...med,
                id: doseId,
                status: 'Pending', // Default status
                scheduledTime: time,
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
            setDoses(generateDosesForToday(medications));
        }
    }, []);

    const addMedication = (newMed: Omit<Medication, 'id'>) => {
        const id = generateId();
        const medication: Medication = { ...newMed, id };

        setMedications(prev => [...prev, medication]);

        // Also add doses for this new medication for today
        const newDoses = generateDosesForToday([medication]);
        setDoses(prev => [...prev, ...newDoses]);
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
                return { ...dose, ...updatedMed, scheduledTime: dose.scheduledTime }; // Keep scheduledTime for now unless we re-generate
            }
            return dose;
        }));
    };

    const updateDoseStatus = (doseId: string, status: Dose['status']) => {
        setDoses(prev => prev.map(dose =>
            dose.id === doseId ? { ...dose, status } : dose
        ));
    };

    const rescheduleDoseGroup = (oldTime: string, newTime: string, isPersistent: boolean) => {
        // 1. Update Doses (Today)
        setDoses(prev => prev.map(dose => {
            if (dose.scheduledTime === oldTime) {
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

    return (
        <MedicationContext.Provider value={{ medications, doses, addMedication, updateMedication, updateDoseStatus, rescheduleDoseGroup }}>
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
