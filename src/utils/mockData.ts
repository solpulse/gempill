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
        return {
            date: day,
            adherence: 0,
            logs: [],
            status: 'none'
        };
    });
};
