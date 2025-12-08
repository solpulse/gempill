import { useState, useEffect, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Medication } from '../types/GempillTypes';
import { generateMockHistory, DayData, DailyLog } from '../utils/mockData';

export const useMedicationHistory = (medId: string) => {
    const { medications, doses } = useMedication();
    const [medication, setMedication] = useState<Medication | undefined>(undefined);

    useEffect(() => {
        const foundMed = medications.find(m => m.id === medId);
        setMedication(foundMed);
    }, [medications, medId]);

    // Generate real mock history data + Merge Live Data for Today
    const { history, adherencePercentage, takenCount, expectedCount } = useMemo(() => {
        if (!medication) return { history: [], adherencePercentage: 0, takenCount: 0, expectedCount: 0 };

        // 1. Generate full month history (Mock)
        const fullHistory: DayData[] = generateMockHistory(new Date());

        // 2. Filter for this specific medication
        let medLogs = fullHistory.flatMap((day: DayData) =>
            day.logs
                .filter((log: DailyLog) => log.medName === medication.name)
                .map((log: DailyLog) => ({
                    date: day.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
                    time: log.time,
                    status: log.status,
                    rawDate: day.date
                }))
        );

        // 3. Remove "Today's" mock entries
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        medLogs = medLogs.filter(log => log.date !== todayStr);

        // 4. Add "Today's" LIVE entries from Context
        // Better to filter by name to be safe if IDs change
        const liveTodayLogs = doses
            .filter(d => d.name === medication.name)
            .map(dose => ({
                date: todayStr,
                time: dose.scheduledTime,
                status: dose.status,
                rawDate: new Date() // Today
            }));

        medLogs = [...medLogs, ...liveTodayLogs];

        // 5. Sort by date descending (newest first)
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
    }, [medication, doses]);

    return {
        medication,
        history,
        adherencePercentage,
        takenCount,
        expectedCount,
    };
};
