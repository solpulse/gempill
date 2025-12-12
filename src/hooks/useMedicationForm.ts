import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useMedication } from '../context/MedicationContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/GempillTypes';
import { formatTimeForDisplay, isSystem24Hour, parseTimeToMinutes } from '../utils/TimeUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMedication'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddMedication'>;

export const useMedicationForm = (navigation: NavigationProp, route: RoutePropType) => {
    const { addMedication, updateMedication } = useMedication();
    const is24Hour = isSystem24Hour();

    const existingMedParam = route.params?.medication;

    // Deserialize if necessary (dates might be strings)
    const existingMed = existingMedParam ? {
        ...existingMedParam,
        startDate: typeof existingMedParam.startDate === 'string' ? new Date(existingMedParam.startDate) : existingMedParam.startDate,
        pausedUntil: typeof existingMedParam.pausedUntil === 'string' && existingMedParam.pausedUntil ? new Date(existingMedParam.pausedUntil) : existingMedParam.pausedUntil
    } : undefined;

    const isEditing = !!existingMed;

    const [name, setName] = useState(existingMed?.name || '');
    const [dosage, setDosage] = useState(existingMed?.dosage?.toString() || '');
    const [dosageUnit, setDosageUnit] = useState(existingMed?.dosageUnit || 'mg');
    const [frequency, setFrequency] = useState(existingMed?.frequency || 'Daily');

    // Initialize times from existing med (converting potentially stored string to Date object for picker)
    const [times, setTimes] = useState<{ id: string; time: Date }[]>(
        existingMed?.scheduledTimes.map(t => {
            // Check if t is 12h or 24h, parseTimeToMinutes handles both
            const totalMinutes = parseTimeToMinutes(t);
            const date = new Date();
            if (!isNaN(totalMinutes)) {
                date.setHours(Math.floor(totalMinutes / 60));
                date.setMinutes(totalMinutes % 60);
            }
            return { id: Math.random().toString(), time: date };
        }) || [{ id: Math.random().toString(), time: new Date() }]
    );
    const [color, setColor] = useState(existingMed?.color || '#B0BEC5');
    const [icon, setIcon] = useState(existingMed?.icon || 'pill');

    // UI State
    const [showUnitMenu, setShowUnitMenu] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

    const openTimePicker = (index: number) => {
        setActiveTimeIndex(index);
        setShowTimePicker(true);
    };

    const onDismissTimePicker = useCallback(() => {
        setShowTimePicker(false);
    }, []);

    const onConfirmTimePicker = useCallback(
        ({ hours, minutes }: { hours: number; minutes: number }) => {
            setShowTimePicker(false);
            if (activeTimeIndex !== null) {
                const newTimes = [...times];
                const date = new Date(newTimes[activeTimeIndex].time);
                date.setHours(hours);
                date.setMinutes(minutes);
                newTimes[activeTimeIndex] = { ...newTimes[activeTimeIndex], time: date };
                setTimes(newTimes);
            }
        },
        [activeTimeIndex, times]
    );

    const addTimeSlot = () => {
        setTimes([...times, { id: Math.random().toString(), time: new Date() }]);
    };

    const removeTimeSlot = (index: number) => {
        const newTimes = times.filter((_, i) => i !== index);
        setTimes(newTimes);
    };

    // Helper to format 24h string for storage: "HH:mm"
    const toStorageFormat = (date: Date): string => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // For display in the form UI (respects system locale)
    const formatTime = (date: Date) => {
        const timeStr = toStorageFormat(date);
        return formatTimeForDisplay(timeStr);
    };

    const [errors, setErrors] = useState({ name: false, dosage: false, times: false });

    // ... existing code ...

    const handleSave = (): boolean => {
        // Validation
        const newErrors = {
            name: !name.trim(),
            dosage: !dosage.trim(),
            times: times.length === 0
        };

        setErrors(newErrors);

        if (newErrors.name || newErrors.dosage || newErrors.times) {
            return false;
        }

        const medicationData = {
            name,
            dosage: parseFloat(dosage),
            dosageUnit,
            startDate: new Date(),
            frequency,
            timesPerDay: times.length,
            scheduledTimes: times.map(t => toStorageFormat(t.time)), // Store as 24h strict
            color,
            icon,
            status: existingMed?.status || 'Active', // Preserve status or default to Active
        };

        if (isEditing && existingMed) {
            updateMedication({ ...medicationData, id: existingMed.id, startDate: existingMed.startDate });
        } else {
            addMedication(medicationData);
        }

        navigation.goBack();
        return true;
    };

    return {
        // Values
        name,
        dosage,
        dosageUnit,
        frequency,
        times,
        color,
        icon,
        isEditing,
        is24Hour,
        showUnitMenu,
        showTimePicker,
        activeTimeIndex,
        errors,

        // Setters / Handlers
        // ...
        setName,
        setDosage,
        setDosageUnit,
        setFrequency,
        setColor,
        setIcon,
        setShowUnitMenu,
        openTimePicker,
        onDismissTimePicker,
        onConfirmTimePicker,
        addTimeSlot,
        removeTimeSlot,
        formatTime,
        handleSave
    };
};
