import { useState, useEffect, useMemo, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedReaction, withTiming, Easing } from 'react-native-reanimated';
import { useMedication } from '../context/MedicationContext';
import { Dose } from '../types/GempillTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { colors } from '../theme/colors';

export const useDailySchedule = (selectedDate: Date = new Date()) => {
    const { doses, updateDoseStatus } = useMedication();
    const [adherence, setAdherence] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [historyDoses, setHistoryDoses] = useState<Dose[]>([]);

    const isToday = useMemo(() => {
        return selectedDate.toDateString() === new Date().toDateString();
    }, [selectedDate]);

    const displayDoses = isToday ? doses : historyDoses;

    useEffect(() => {
        if (!isToday) {
            const fetchHistory = async () => {
                const historyJson = await AsyncStorage.getItem('@dose_history');
                if (historyJson) {
                    const history = JSON.parse(historyJson);
                    const entry = history.find((e: any) => e.date === selectedDate.toDateString());
                    setHistoryDoses(entry ? entry.doses : []);
                } else {
                    setHistoryDoses([]);
                }
            };
            fetchHistory();
            
            const subscription = DeviceEventEmitter.addListener('historyUpdated', fetchHistory);
            return () => subscription.remove();
        }
    }, [isToday, selectedDate]);

    // Calculate Adherence
    useEffect(() => {
        calculateAdherence();
    }, [displayDoses]);

    const calculateAdherence = () => {
        const totalDoses = displayDoses.length;
        const takenDoses = displayDoses.filter((d) => d.status === 'Taken').length;
        const percentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
        setAdherence(percentage);

        // Reset confetti if dropped below 100 (immediate reset for UI logic)
        // Also don't show confetti for historical dates by default just from loading
        if (percentage < 100 || !isToday) {
            setShowConfetti(false);
        }
    };

    // Actions
    // ⚡ Bolt: Memoize action handlers to prevent unnecessary child re-renders
    const handleTake = useCallback(async (doseId: string) => {
        updateDoseStatus(doseId, 'Taken');
        // await cancelMedicationReminder(doseId); // Commented out likely because notification utils might not be fully linked or mocked, but keeping logic
    }, [updateDoseStatus]);

    const handleSkip = useCallback(async (doseId: string) => {
        updateDoseStatus(doseId, 'Skipped');
        // await cancelMedicationReminder(doseId);
    }, [updateDoseStatus]);

    const handlePending = useCallback((doseId: string) => {
        updateDoseStatus(doseId, 'Pending');
    }, [updateDoseStatus]);

    // Grouping & Sorting
    // ⚡ Bolt: Memoize derived state to prevent FlashList from re-rendering all items on every state change (e.g. confetti animation)
    const dosesByTime = useMemo(() => {
        return displayDoses.reduce((acc, dose) => {
            if (!acc[dose.scheduledTime]) {
                acc[dose.scheduledTime] = [];
            }
            acc[dose.scheduledTime].push(dose);
            return acc;
        }, {} as Record<string, Dose[]>);
    }, [displayDoses]);

    const sortedTimes = useMemo(() => {
        return Object.keys(dosesByTime).sort((a, b) => {
            return a.localeCompare(b);
        });
    }, [dosesByTime]);

    // Animation
    const animatedAdherence = useSharedValue(0);

    useEffect(() => {
        animatedAdherence.value = withTiming(adherence, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });
    }, [adherence]);

    // React to animation value changes to trigger confetti slightly earlier than "settled"
    useAnimatedReaction(
        () => {
            return animatedAdherence.value;
        },
        (currentValue, previousValue) => {
            if (adherence === 100 && currentValue > 97 && !showConfetti) {
                // Trigger earlier at 97% for better anticipation
                runOnJS(setShowConfetti)(true);
            }
        },
        [adherence] // Dependency ensures we only check when target is 100
    );

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${animatedAdherence.value}%`,
        };
    });

    return {
        adherence,
        progressStyle,
        sortedTimes,
        dosesByTime,
        handleTake,
        handleSkip,
        handlePending,
        showConfetti,
        isToday,
        updateDoseStatus // Expose for HomeScreen to use after confirmation
    };
};