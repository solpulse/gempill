import { useState, useMemo, useEffect } from 'react';
import { useMedication } from '../context/MedicationContext';
import { DayData, DailyLog } from '../utils/mockData';
import { Dose } from '../types/GempillTypes';
import { useTheme } from 'react-native-paper';
import { formatTimeForDisplay } from '../utils/TimeUtils';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_DOSE_HISTORY = '@dose_history';

interface HistoryEntry {
    date: string;
    doses: Dose[];
}

export const useMonthlyRecords = () => {
    const { doses } = useMedication();
    const theme = useTheme();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<{ date: Date; data: DayData } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [archivedHistory, setArchivedHistory] = useState<HistoryEntry[]>([]);

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

    // Generate calendar data for the current month
    const calendarDays = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const daysInMonth = eachDayOfInterval({ start, end });
        const today = new Date();
        const todayDateStr = today.toDateString();

        const days: DayData[] = daysInMonth.map(day => {
            const dayDateStr = day.toDateString();
            const isToday = dayDateStr === todayDateStr;

            // Check if we have archived data for this day
            const archivedEntry = archivedHistory.find(entry => entry.date === dayDateStr);

            // Use today's live doses, or archived doses for past days
            let dayDoses: Dose[] = [];
            if (isToday) {
                dayDoses = doses;
            } else if (archivedEntry) {
                dayDoses = archivedEntry.doses;
            }

            if (dayDoses.length === 0) {
                return {
                    date: day,
                    adherence: 0,
                    logs: [],
                    status: 'none' as const
                };
            }

            const takenCount = dayDoses.filter(d => d.status === 'Taken').length;
            const adherence = takenCount / dayDoses.length;

            // Map doses to logs
            const logs: DailyLog[] = dayDoses.map(dose => ({
                time: formatTimeForDisplay(dose.scheduledTime),
                medName: dose.name,
                status: dose.status,
                color: dose.color || theme.colors.primary,
                icon: dose.icon,
            }));

            let status: DayData['status'];
            if (adherence === 1) {
                status = 'full';
            } else if (takenCount > 0) {
                status = 'partial';
            } else {
                // All missed or skipped
                const missedOrSkipped = dayDoses.filter(d => d.status === 'Skipped' || d.status === 'Pending').length;
                status = missedOrSkipped === dayDoses.length && !isToday ? 'missed' : 'partial';
            }

            return {
                date: day,
                adherence: adherence,
                logs: logs,
                status: status
            };
        });

        return days;
    }, [currentDate, doses, archivedHistory, theme.colors.primary]);

    // Calculate Monthly Metrics
    const { monthlyPercentage, monthlyStreak } = useMemo(() => {
        const validDays = calendarDays.filter(day => day.status !== 'none');
        if (validDays.length === 0) return { monthlyPercentage: 0, monthlyStreak: 0 };

        // Average Adherence
        const totalAdherence = validDays.reduce((sum, day) => sum + day.adherence, 0);
        const avg = Math.round((totalAdherence / validDays.length) * 100);

        // Streak Calculation (Longest streak of 100% adherence in the month)
        let maxStreak = 0;
        let currentStreak = 0;

        // Sort days by date to ensure correct streak calculation
        const sortedDays = [...validDays].sort((a, b) => a.date.getTime() - b.date.getTime());

        for (const day of sortedDays) {
            if (day.adherence === 1) {
                currentStreak++;
                if (currentStreak > maxStreak) maxStreak = currentStreak;
            } else {
                currentStreak = 0;
            }
        }

        return { monthlyPercentage: avg, monthlyStreak: maxStreak };
    }, [calendarDays]);

    const handleDayPress = (date: Date, data: DayData | undefined) => {
        if (data && data.status !== 'none') {
            setSelectedDay({ date, data });
            setIsModalVisible(true);
        }
    };

    const dismissModal = () => {
        setIsModalVisible(false);
    };

    return {
        currentDate,
        setCurrentDate,
        calendarDays,
        monthlyPercentage,
        monthlyStreak,
        selectedDay,
        isModalVisible,
        handleDayPress,
        dismissModal
    };
};
