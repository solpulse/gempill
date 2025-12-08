import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isFuture, format } from 'date-fns';

export interface DailyLog {
    medName: string;
    time: string;
    status: 'Taken' | 'Missed' | 'Skipped' | 'Pending';
    color: string;
}

export interface DayData {
    date: Date;
    adherence: number; // 0 to 1
    logs: DailyLog[];
    status: 'full' | 'partial' | 'missed' | 'none'; // For backward compatibility/easy styling
}

const MED_NAMES = ['Lisinopril', 'Metformin', 'Vitamin D', 'Atorvastatin'];
const MED_COLORS = ['#CE93D8', '#60D1A9', '#FFF59D', '#90CAF9'];

export const generateMockHistory = (currentDate: Date): DayData[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
        if (isFuture(day)) {
            return {
                date: day,
                adherence: 0,
                logs: [],
                status: 'none'
            };
        }

        // Deterministic pseudo-random based on date
        const seed = day.getDate() + day.getMonth() * 31 + day.getFullYear() * 366;
        const random = (seed * 9301 + 49297) % 233280 / 233280;

        let adherence = 0;
        let status: DayData['status'] = 'none';
        const logs: DailyLog[] = [];

        // Generate 1-3 meds per day
        const numMeds = Math.floor(random * 3) + 1;

        let takenCount = 0;

        for (let i = 0; i < numMeds; i++) {
            const medIndex = (seed + i) % MED_NAMES.length;
            // Random status weighted towards 'Taken'
            const statusRand = (random * (i + 1) * 100) % 100;
            let medStatus: DailyLog['status'] = 'Taken';

            if (statusRand > 85) medStatus = 'Missed';
            else if (statusRand > 75) medStatus = 'Skipped';

            if (medStatus === 'Taken') takenCount++;

            logs.push({
                medName: MED_NAMES[medIndex],
                time: `${8 + i * 4}:00`,
                status: medStatus,
                color: MED_COLORS[medIndex]
            });
        }

        adherence = takenCount / numMeds;

        if (adherence === 1) status = 'full';
        else if (adherence > 0) status = 'partial';
        else if (logs.length > 0) status = 'missed';
        else status = 'none';

        return {
            date: day,
            adherence,
            logs,
            status
        };
    });
};
