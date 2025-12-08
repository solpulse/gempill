import { useState, useCallback } from 'react';
import { useMedication } from '../context/MedicationContext';
import * as ExpoLocalization from 'expo-localization';
import { colors } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/GempillTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMedication'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddMedication'>;

export const useMedicationForm = (navigation: NavigationProp, route: RoutePropType) => {
    const { addMedication, updateMedication } = useMedication();
    const calendars = ExpoLocalization.getCalendars();
    // Safely handle potentially null/undefined calendar or uses24hourClock
    const is24Hour = calendars && calendars.length > 0 ? (calendars[0].uses24hourClock ?? false) : false;

    const existingMed = route.params?.medication;
    const isEditing = !!existingMed;

    const [name, setName] = useState(existingMed?.name || '');
    const [dosage, setDosage] = useState(existingMed?.dosage?.toString() || '');
    const [dosageUnit, setDosageUnit] = useState(existingMed?.dosageUnit || 'mg');
    const [frequency, setFrequency] = useState(existingMed?.frequency || 'Daily');
    const [times, setTimes] = useState<{ id: string; time: Date }[]>(
        existingMed?.scheduledTimes.map(t => {
            const [hours, minutes] = t.split(':').map(Number);
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            return { id: Math.random().toString(), time: date };
        }) || [{ id: Math.random().toString(), time: new Date() }]
    );
    const [color, setColor] = useState(existingMed?.color || colors.labelGrey);
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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !is24Hour
        });
    };

    const handleSave = () => {
        const medicationData = {
            name,
            dosage: parseFloat(dosage),
            dosageUnit,
            startDate: new Date(),
            frequency,
            timesPerDay: times.length,
            scheduledTimes: times.map(t => formatTime(t.time)),
            color,
            icon,
        };

        if (isEditing && existingMed) {
            updateMedication({ ...medicationData, id: existingMed.id, startDate: existingMed.startDate });
        } else {
            addMedication(medicationData);
        }

        navigation.goBack();
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

        // Setters / Handlers
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
