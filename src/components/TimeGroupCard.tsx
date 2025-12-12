import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dose } from '../types/GempillTypes';
import { PillEntry } from './PillEntry';
import { Modal, Portal, Text as PaperText, Button, Switch, useTheme } from 'react-native-paper';
import { TimePicker } from 'react-native-paper-dates';
import { useMedication } from '../context/MedicationContext';
import * as ExpoLocalization from 'expo-localization';
import { QuickRescheduleActions } from './QuickRescheduleActions';
import { SuccessAnimation } from './SuccessAnimation';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedSizeWrapper } from './AnimatedSizeWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TimeGroupCardProps {
    timeGroupName: string;
    doses: Dose[];
    time: string;
    onTake: (doseId: string) => void;
    onSkip: (doseId: string) => void;
    onPending: (doseId: string) => void;
}

export const TimeGroupCard: React.FC<TimeGroupCardProps> = ({
    timeGroupName,
    doses,
    time,
    onTake,
    onSkip,
    onPending,
}) => {
    const { rescheduleDoseGroup } = useMedication();
    const theme = useTheme();
    const calendars = ExpoLocalization.getCalendars();
    const is24Hour = calendars && calendars.length > 0 ? (calendars[0].uses24hourClock ?? false) : false;
    const [visible, setVisible] = React.useState(false);
    const [isPersistent, setIsPersistent] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Time Picker State
    const [hours, setHours] = React.useState(0);
    const [minutes, setMinutes] = React.useState(0);
    const [initialHours, setInitialHours] = React.useState(0);
    const [initialMinutes, setInitialMinutes] = React.useState(0);
    const [focused, setFocused] = React.useState<'hours' | 'minutes'>('hours');

    // Check if any dose in this group has been rescheduled (has originalScheduledTime)
    // We assume if one is rescheduled, the whole group for this time slot is.
    const originalTime = doses[0]?.originalScheduledTime;

    // Check if all doses are taken
    const allTaken = doses.every(d => d.status === 'Taken');

    const handleApplyOffset = (offsetMinutes: number) => {
        let newMinutes = initialMinutes + offsetMinutes;
        let newHours = initialHours;

        while (newMinutes >= 60) {
            newMinutes -= 60;
            newHours = (newHours + 1) % 24;
        }

        setMinutes(newMinutes);
        setHours(newHours);
    };

    const onOpen = () => {
        const [h, m] = time.split(':').map(Number);
        setHours(h);
        setMinutes(m);
        setInitialHours(h);
        setInitialMinutes(m);
        setFocused('hours');
        setShowSuccess(false);
        setVisible(true);
    };

    const onDismiss = () => setVisible(false);

    const onConfirm = () => {
        setShowSuccess(true);
        const newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Wait for animation (1.5s) + settle time (0.75s) = 2.25s
        setTimeout(() => {
            rescheduleDoseGroup(time, newTime, isPersistent);
            setVisible(false);
        }, 2250);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onOpen} style={styles.headerRow} disabled={allTaken}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.groupName, { color: theme.colors.onSurface }]}>{time}</Text>
                    {originalTime && originalTime !== time && (
                        <Text style={[styles.originalTime, { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant }]}>
                            {originalTime}
                        </Text>
                    )}
                </View>
                {!allTaken && (
                    <MaterialCommunityIcons name="clock-edit-outline" size={24} color={theme.colors.primary} />
                )}
            </TouchableOpacity>

            <Portal>
                <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <AnimatedSizeWrapper>
                        {showSuccess ? (
                            <Animated.View entering={FadeIn.duration(100)} key="success">
                                <SuccessAnimation />
                            </Animated.View>
                        ) : (
                            <View key="form">
                                <PaperText variant="headlineSmall" style={{ marginBottom: 16, textAlign: 'center' }}>Reschedule Intake</PaperText>

                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <TimePicker
                                        hours={hours}
                                        minutes={minutes}
                                        onFocusInput={(type) => setFocused(type)}
                                        focused={focused}
                                        inputType="picker"
                                        use24HourClock={is24Hour}
                                        onChange={({ hours: newHours, minutes: newMinutes }) => {
                                            // Auto-switch to minutes after hour selection
                                            if (focused === 'hours' && newHours !== hours) {
                                                setHours(newHours);
                                                setMinutes(newMinutes);
                                                setFocused('minutes');
                                            } else {
                                                setHours(newHours);
                                                setMinutes(newMinutes);
                                            }
                                        }}
                                    />
                                </View>

                                <QuickRescheduleActions onAddMinutes={handleApplyOffset} />

                                <View style={styles.switchRow}>
                                    <PaperText variant="bodyLarge">Apply to future days?</PaperText>
                                    <Switch value={isPersistent} onValueChange={setIsPersistent} />
                                </View>

                                <View style={styles.buttonRow}>
                                    <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
                                    <Button mode="contained" onPress={onConfirm}>Done</Button>
                                </View>
                            </View>
                        )}
                    </AnimatedSizeWrapper>
                </Modal>
            </Portal>

            <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}>
                {doses.map((dose, index) => (
                    <View key={dose.id}>
                        <PillEntry
                            dose={dose}
                            onTake={onTake}
                            onSkip={onSkip}
                            onPending={onPending}
                        />
                        {index < doses.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    cardContainer: {
        borderRadius: 24,
        paddingVertical: 16,
        // Elevation is handled by flattened style in component or Paper's shadow support, 
        // but for now we'll use standard shadow styles or theme.
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    groupName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0', // Or theme.colors.outlineVariant
        marginHorizontal: 16,
    },
    originalTime: {
        fontSize: 16,
        marginLeft: 8,
        opacity: 0.6,
    },
    modalContainer: {
        padding: 24,
        margin: 20,
        borderRadius: 28,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});
