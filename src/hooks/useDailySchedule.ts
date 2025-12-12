import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useMedication } from '../context/MedicationContext';
import { Dose } from '../types/GempillTypes';
import { cancelMedicationReminder } from '../utils/notifications';
// import { colors } from '../theme/colors';

export const useDailySchedule = () => {
    const { doses, updateDoseStatus } = useMedication();
    const [adherence, setAdherence] = useState(0);

    // Calculate Adherence
    useEffect(() => {
        calculateAdherence();
    }, [doses]);

    const calculateAdherence = () => {
        const totalDoses = doses.length;
        const takenDoses = doses.filter((d) => d.status === 'Taken').length;
        const percentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
        setAdherence(percentage);
    };

    // Actions
    const handleTake = async (doseId: string) => {
        updateDoseStatus(doseId, 'Taken');
        // await cancelMedicationReminder(doseId); // Commented out likely because notification utils might not be fully linked or mocked, but keeping logic
    };

    const handleSkip = async (doseId: string) => {
        updateDoseStatus(doseId, 'Skipped');
        // await cancelMedicationReminder(doseId);
    };

    const handlePending = (doseId: string) => {
        updateDoseStatus(doseId, 'Pending');
    };

    // Grouping & Sorting
    const dosesByTime = doses.reduce((acc, dose) => {
        if (!acc[dose.scheduledTime]) {
            acc[dose.scheduledTime] = [];
        }
        acc[dose.scheduledTime].push(dose);
        return acc;
    }, {} as Record<string, Dose[]>);

    const sortedTimes = Object.keys(dosesByTime).sort((a, b) => {
        return a.localeCompare(b);
    });

    // Animation
    const animatedAdherence = useSharedValue(0);

    useEffect(() => {
        animatedAdherence.value = withSpring(adherence, {
            damping: 20,
            stiffness: 90,
            mass: 0.5, // Lighter mass effectively reduces inertia
            overshootClamping: adherence === 0, // Prevent overshooting when going to 0
        });
    }, [adherence]);

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
        handlePending
    };
};
