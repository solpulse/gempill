import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

const TimeGroupCardComponent: React.FC<TimeGroupCardProps> = ({
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

    const originalTime = doses[0]?.originalScheduledTime;
    const isCompleted = doses.every(d => d.status === 'Taken' || d.status === 'Skipped');
    const displayTime = (isCompleted && originalTime) ? originalTime : time;
    const showOriginalTime = !isCompleted && originalTime && originalTime !== time;

    const handleApplyOffset = useCallback((offsetMinutes: number) => {
        let newMinutes = initialMinutes + offsetMinutes;
        let newHours = initialHours;
        while (newMinutes >= 60) {
            newMinutes -= 60;
            newHours = (newHours + 1) % 24;
        }
        setMinutes(newMinutes);
        setHours(newHours);
    }, [initialHours, initialMinutes]);

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
        setTimeout(() => {
            rescheduleDoseGroup(time, newTime, isPersistent);
            setVisible(false);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onOpen} style={styles.headerRow} disabled={isCompleted}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <PaperText variant="headlineSmall" style={[styles.groupName, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                        {displayTime}
                    </PaperText>
                    {showOriginalTime && (
                        <PaperText variant="bodySmall" style={[styles.originalTime, { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }]}>
                            {originalTime}
                        </PaperText>
                    )}
                </View>
                {!isCompleted && (
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.outline} />
                )}
            </TouchableOpacity>

            <View style={[styles.cardContainer, { backgroundColor: theme.colors.outlineVariant }]}>
                {doses.map((dose, index) => (
                    <View key={dose.id} style={index > 0 ? { marginTop: 12 } : {}}>
                        <PillEntry
                            dose={dose}
                            onTake={onTake}
                            onSkip={onSkip}
                            onPending={onPending}
                        />
                    </View>
                ))}
            </View>

            <Portal>
                <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <AnimatedSizeWrapper>
                        {showSuccess ? (
                            <Animated.View entering={FadeIn.duration(100)} key="success">
                                <SuccessAnimation />
                            </Animated.View>
                        ) : (
                            <View key="form">
                                <PaperText variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>Adjust Calibration</PaperText>

                                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                    <TimePicker
                                        hours={hours}
                                        minutes={minutes}
                                        onFocusInput={(type) => setFocused(type)}
                                        focused={focused}
                                        inputType="picker"
                                        use24HourClock={is24Hour}
                                        onChange={({ hours: newHours, minutes: newMinutes }) => {
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
                                    <PaperText variant="bodyLarge" style={{ fontFamily: 'System', fontWeight: '500' }}>Apply to future sessions?</PaperText>
                                    <Switch value={isPersistent} onValueChange={setIsPersistent} color={theme.colors.primary} />
                                </View>

                                <View style={styles.buttonRow}>
                                    <Button onPress={onDismiss} textColor={theme.colors.onSurfaceVariant}>Dismiss</Button>
                                    <Button mode="contained" onPress={onConfirm} style={styles.syncButton}>Apply Change</Button>
                                </View>
                            </View>
                        )}
                    </AnimatedSizeWrapper>
                </Modal>
            </Portal>
        </View>
    );
};

export const TimeGroupCard = memo(TimeGroupCardComponent);

const styles = StyleSheet.create({
    container: {
        marginBottom: 36,
    },
    cardContainer: {
        borderRadius: 32,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    groupName: {
        fontSize: 22,
        letterSpacing: -0.5,
    },
    originalTime: {
        marginLeft: 10,
        opacity: 0.5,
        fontSize: 14,
    },
    modalContainer: {
        padding: 32,
        margin: 20,
        borderRadius: 32,
        elevation: 0,
    },
    modalTitle: {
        marginBottom: 24,
        textAlign: 'center',
        fontSize: 24,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    syncButton: {
        borderRadius: 20,
        paddingHorizontal: 8,
    }
});
