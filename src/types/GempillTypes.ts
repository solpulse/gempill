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
}

export interface Dose extends Medication {
    status: 'Pending' | 'Taken' | 'Skipped';
    scheduledTime: string;
    originalScheduledTime?: string;
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
    MedDetail: { medId: string };
    AddMedication: { medication?: Medication } | undefined;
};
