import { useState, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { generateMockHistory, DayData } from '../utils/mockData';
import { colors } from '../theme/colors';

export const useMonthlyRecords = () => {
    const { doses } = useMedication();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<{ date: Date; data: DayData } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Generate calendar data for the current month
    const calendarDays = useMemo(() => {
        const days = generateMockHistory(currentDate);

        // Override "Today" with real data from context
        const today = new Date();
        if (days.some(d => d.date.toDateString() === today.toDateString())) {
            const todayDoses = doses.filter(d => {
                // Assuming doses are for today as per Context implementation
                // In a real app with full history, we'd filter by date
                return true;
            });

            if (todayDoses.length > 0) {
                const takenCount = todayDoses.filter(d => d.status === 'Taken').length;
                const adherence = takenCount / todayDoses.length;

                // Map doses to logs
                const logs = todayDoses.map(dose => ({
                    time: dose.scheduledTime,
                    medName: dose.name,
                    status: dose.status,
                    color: dose.color || colors.primary,
                }));

                // Find and update today in the array
                const todayIndex = days.findIndex(d => d.date.toDateString() === today.toDateString());
                if (todayIndex !== -1) {
                    days[todayIndex] = {
                        ...days[todayIndex],
                        adherence: adherence,
                        status: adherence === 1 ? 'full' : (logs.length > 0 ? 'partial' : 'none'),
                        logs: logs
                    };
                }
            }
        }
        return days;
    }, [currentDate, doses]);

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
