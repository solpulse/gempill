export type MedicationStatus = 'Active' | 'Paused' | 'Finished' | 'Cancelled';
export type DoseStatus = 'Pending' | 'Taken' | 'Missed' | 'Skipped';

export interface Medication {
    id: string;
    name: string;
    dosage: number;
    dosageUnit: string;
    startDate: Date;
    frequency: string;
    timesPerDay: number;
    scheduledTimes: string[]; // ["08:00", "13:00"]
    color?: string;
    icon?: string;
    status: MedicationStatus;
    pausedUntil?: Date | null; // If null/undefined and status is Paused, it's indefinite
}

export interface Dose extends Omit<Medication, 'status'> {
    status: 'Pending' | 'Taken' | 'Skipped' | 'Missed';
    scheduledTime: string;
    originalScheduledTime?: string;
    medicationId: string;
    actionTime?: string; // ISO string of actual taken/skipped time
}

export interface MedicationHistoryItem {
    doseId?: string;
    date: string;
    time: string;
    status: string;
    rawDate?: Date;
}

export interface LogEntry {
    id: string;
    medicationId: string;
    scheduledTime: Date;
    takenTime: Date | null;
    rescheduledTime: Date | null;
    status: 'Pending' | 'Taken' | 'Missed' | 'Skipped';
}

export interface ScheduledTime {
    id: string; // Add ID for better key management
    time: Date;
}

export type RootStackParamList = {
    Main: undefined;
    Home: undefined;
    Records: undefined;
    Meds: undefined;
    MedDetail: { medication: Medication };
    AddMedication: { medication?: Medication, isOnboarding?: boolean };
    Onboarding: undefined;
};
