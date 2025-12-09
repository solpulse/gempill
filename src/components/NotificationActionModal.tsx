import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, useTheme } from 'react-native-paper';
import { useNotificationAction } from '../context/NotificationActionContext';
import { useMedication } from '../context/MedicationContext';
import { QuickRescheduleActions } from './QuickRescheduleActions';
import { TimePicker } from 'react-native-paper-dates';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SuccessAnimation } from './SuccessAnimation';
import { AnimatedSizeWrapper } from './AnimatedSizeWrapper';

export const NotificationActionModal: React.FC = () => {
    const { activeNotification, hideNotificationAction } = useNotificationAction();
    const { updateDoseStatus, rescheduleDoseGroup } = useMedication();
    const theme = useTheme();

    const [showReschedule, setShowReschedule] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [focused, setFocused] = useState<'hours' | 'minutes'>('hours');

    if (!activeNotification) return null;

    const { doseId, medName, scheduledTime } = activeNotification;

    const handleTake = () => {
        setShowSuccess(true);
        setTimeout(() => {
            updateDoseStatus(doseId, 'Taken');
            setShowSuccess(false); // Reset for next time
            hideNotificationAction();
        }, 1500);
    };

    const handleSkip = () => {
        updateDoseStatus(doseId, 'Skipped');
        hideNotificationAction();
    };

    const handleQuickReschedule = (addedMinutes: number) => {
        // Calculate new time logic 
        // Note: For simplicity, we assume day rollover isn't a complex issue for this quick action or we reuse logic.
        // We'll parse the CURRENT scheduledTime.
        const [h, m] = scheduledTime.split(':').map(Number);
        let newMinutes = m + addedMinutes;
        let newHours = h;

        while (newMinutes >= 60) {
            newMinutes -= 60;
            newHours = (newHours + 1) % 24;
        }

        const newTimeStr = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;

        setShowSuccess(true);
        setTimeout(() => {
            rescheduleDoseGroup(scheduledTime, newTimeStr, false); // Not persistent for quick snooze
            setShowSuccess(false);
            hideNotificationAction();
        }, 1500);
    };

    const openFullReschedule = () => {
        const [h, m] = scheduledTime.split(':').map(Number);
        setHours(h);
        setMinutes(m);
        setShowReschedule(true);
    };

    const confirmReschedule = () => {
        const newTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setShowSuccess(true);
        setTimeout(() => {
            rescheduleDoseGroup(scheduledTime, newTimeStr, false);
            setShowSuccess(false);
            setShowReschedule(false);
            hideNotificationAction();
        }, 1500);
    };

    return (
        <Portal>
            <Modal visible={true} onDismiss={hideNotificationAction} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <AnimatedSizeWrapper>
                    {showSuccess ? (
                        <Animated.View entering={FadeIn.duration(200)} key="success" style={styles.successContainer}>
                            <SuccessAnimation />
                            <Text variant="titleMedium" style={{ marginTop: 16 }}>Updated!</Text>
                        </Animated.View>
                    ) : showReschedule ? (
                        <View key="reschedule">
                            <Text variant="headlineSmall" style={styles.title}>Reschedule {medName}</Text>
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <TimePicker
                                    hours={hours}
                                    minutes={minutes}
                                    onFocusInput={(type) => setFocused(type)}
                                    focused={focused}
                                    inputType="picker"
                                    use24HourClock={true}
                                    onChange={({ hours, minutes }) => {
                                        setHours(hours);
                                        setMinutes(minutes);
                                    }}
                                />
                            </View>
                            <View style={styles.buttonRow}>
                                <Button onPress={() => setShowReschedule(false)} style={{ marginRight: 8 }}>Back</Button>
                                <Button mode="contained" onPress={confirmReschedule}>Confirm</Button>
                            </View>
                        </View>
                    ) : (
                        <View key="main">
                            <Text variant="headlineSmall" style={styles.title}>Time for {medName}</Text>
                            <Text variant="bodyLarge" style={styles.subtitle}>Scheduled: {scheduledTime}</Text>

                            <View style={styles.mainActions}>
                                <Button
                                    mode="contained"
                                    icon="check"
                                    buttonColor={colors.success}
                                    onPress={handleTake}
                                    contentStyle={{ height: 56 }}
                                    style={styles.actionButton}
                                >
                                    Take Now
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="close"
                                    buttonColor={colors.error}
                                    onPress={handleSkip}
                                    contentStyle={{ height: 56 }}
                                    style={styles.actionButton}
                                >
                                    Skip
                                </Button>
                            </View>

                            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 8 }}>Snooze / Reschedule</Text>
                            <QuickRescheduleActions onAddMinutes={handleQuickReschedule} />

                            <Button mode="outlined" onPress={openFullReschedule} style={{ marginTop: 8 }}>
                                Choose Different Time
                            </Button>
                        </View>
                    )}
                </AnimatedSizeWrapper>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        margin: 20,
        borderRadius: 28,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: 24,
    },
    mainActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    successContainer: {
        alignItems: 'center',
        padding: 20
    }
});
