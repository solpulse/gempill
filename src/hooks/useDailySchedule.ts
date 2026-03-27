import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedReaction, withTiming, Easing } from 'react-native-reanimated';
import { useMedication } from '../context/MedicationContext';
import { Dose } from '../types/GempillTypes';
// import { colors } from '../theme/colors';

export const useDailySchedule = () => {
    const { doses, updateDoseStatus } = useMedication();
    const [adherence, setAdherence] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Calculate Adherence
    useEffect(() => {
        calculateAdherence();
    }, [doses]);

    const calculateAdherence = () => {
        const totalDoses = doses.length;
        const takenDoses = doses.filter((d) => d.status === 'Taken').length;
        const percentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
        setAdherence(percentage);

        // Reset confetti if dropped below 100 (immediate reset for UI logic)
        if (percentage < 100) {
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
        return doses.reduce((acc, dose) => {
            if (!acc[dose.scheduledTime]) {
                acc[dose.scheduledTime] = [];
            }
            acc[dose.scheduledTime].push(dose);
            return acc;
        }, {} as Record<string, Dose[]>);
    }, [doses]);

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
        showConfetti
    };
};