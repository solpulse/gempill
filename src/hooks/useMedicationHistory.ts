import { useState, useEffect, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Medication, Dose } from '../types/GempillTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_DOSE_HISTORY = '@dose_history';

interface HistoryEntry {
    date: string;
    doses: Dose[];
}

export const useMedicationHistory = (medId: string) => {
    const { medications, doses } = useMedication();
    const [medication, setMedication] = useState<Medication | undefined>(undefined);
    const [archivedHistory, setArchivedHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        const foundMed = medications.find(m => m.id === medId);
        setMedication(foundMed);
    }, [medications, medId]);

    // Load archived history from storage
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const historyJson = await AsyncStorage.getItem(STORAGE_KEY_DOSE_HISTORY);
                if (historyJson) {
                    setArchivedHistory(JSON.parse(historyJson));
                }
            } catch (e) {
                console.error('Failed to load dose history', e);
            }
        };
        loadHistory();
    }, []);

    // Generate history from archived data + live data for today
    const { history, adherencePercentage, takenCount, expectedCount } = useMemo(() => {
        if (!medication) return { history: [], adherencePercentage: 0, takenCount: 0, expectedCount: 0 };

        const todayStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

        // 1. Get historical logs from archived doses
        let medLogs: { date: string; time: string; status: string; rawDate: Date }[] = [];

        archivedHistory.forEach(entry => {
            // Parse the date string (it's stored as toDateString() format like "Thu Jan 09 2026")
            const entryDate = new Date(entry.date);
            const entryDateStr = entryDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

            // Filter doses for this medication
            entry.doses
                .filter(d => d.name === medication.name || d.medicationId === medication.id)
                .forEach(dose => {
                    const [schedHours, schedMinutes] = dose.scheduledTime.split(':').map(Number);
                    const rawDate = new Date(entryDate);
                    rawDate.setHours(schedHours, schedMinutes, 0, 0);

                    let displayTime = dose.scheduledTime;

                    // Use action time if available
                    if (dose.actionTime && (dose.status === 'Taken' || dose.status === 'Skipped')) {
                        const actionDate = new Date(dose.actionTime);
                        displayTime = `${actionDate.getHours().toString().padStart(2, '0')}:${actionDate.getMinutes().toString().padStart(2, '0')}`;
                    }

                    medLogs.push({
                        date: entryDateStr,
                        time: displayTime,
                        status: dose.status,
                        rawDate: rawDate
                    });
                });
        });

        // 2. Add today's LIVE entries from Context
        const liveTodayLogs = doses
            .filter(d => d.name === medication.name || d.medicationId === medication.id)
            .map(dose => {
                const now = new Date();
                let displayTime = dose.scheduledTime;
                let rawDate = new Date();

                // Calculate correct Date object for sorting
                const [schedHours, schedMinutes] = dose.scheduledTime.split(':').map(Number);
                const scheduledDate = new Date(now);
                scheduledDate.setHours(schedHours, schedMinutes, 0, 0);

                // Default to scheduled date
                rawDate = scheduledDate;

                // If Taken/Skipped, use Action Time if available
                if (dose.actionTime && (dose.status === 'Taken' || dose.status === 'Skipped')) {
                    const actionDate = new Date(dose.actionTime);
                    displayTime = `${actionDate.getHours().toString().padStart(2, '0')}:${actionDate.getMinutes().toString().padStart(2, '0')}`;
                    rawDate = actionDate;
                }

                return {
                    date: todayStr,
                    time: displayTime,
                    status: dose.status,
                    rawDate: rawDate
                };
            });

        medLogs = [...medLogs, ...liveTodayLogs];

        // 3. Sort by date descending (newest first)
        medLogs.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        const total = medLogs.length;
        const taken = medLogs.filter((l: { status: string; }) => l.status === 'Taken').length;
        const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

        return {
            history: medLogs,
            adherencePercentage: percentage,
            takenCount: taken,
            expectedCount: total
        };
    }, [medication, doses, archivedHistory]);

    return {
        medication,
        history,
        adherencePercentage,
        takenCount,
        expectedCount,
    };
};
