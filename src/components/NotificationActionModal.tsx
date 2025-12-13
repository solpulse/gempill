import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Card, IconButton } from 'react-native-paper';
import { useNotificationAction } from '../context/NotificationActionContext';
import { useMedication } from '../context/MedicationContext';
import { QuickRescheduleActions } from './QuickRescheduleActions';
import { TimePicker } from 'react-native-paper-dates';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { AnimatedSizeWrapper } from './AnimatedSizeWrapper';
import { formatTimeForDisplay } from '../utils/TimeUtils'; // Removed unused addMinutesToTime
import { PillEntry } from './PillEntry';

export const NotificationActionModal: React.FC = () => {
    const { activeTimeGroup, hideNotificationAction } = useNotificationAction();
    const { doses, updateDoseStatus, rescheduleDoseGroup } = useMedication();
    const theme = useTheme();

    // Local state for reschedule flow
    const [showReschedule, setShowReschedule] = useState(false);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [focused, setFocused] = useState<'hours' | 'minutes'>('hours');

    // Shared value for opacity animation
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    // Filter filtering doses for THIS time group (include all statuses so we show animation)
    const groupDoses = doses.filter(
        d => d.scheduledTime === activeTimeGroup
    );

    // Filter for pending count for auto-close logic
    const pendingCount = groupDoses.filter(d => d.status === 'Pending').length;

    // Reset opacity when activeTimeGroup changes (modal re-opens)
    useEffect(() => {
        if (activeTimeGroup) {
            opacity.value = 1;
        }
    }, [activeTimeGroup]);

    // Auto-close logic
    useEffect(() => {
        if (activeTimeGroup && pendingCount === 0 && !showReschedule) {
            // Delay to allow animation to finish and user to see "Taken" state
            const timer = setTimeout(() => {
                handleCloseWithAnimation();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [pendingCount, activeTimeGroup, showReschedule]);

    if (!activeTimeGroup) return null;

    // Use the first dose (if any) to pre-fill reschedule time, or parse activeTimeGroup
    const [hStr, mStr] = activeTimeGroup.split(':');
    const displayTime = formatTimeForDisplay(activeTimeGroup);

    // Handlers for individual items
    const handleTake = (doseId: string) => {
        updateDoseStatus(doseId, 'Taken');
    };

    const handleSkip = (doseId: string) => {
        updateDoseStatus(doseId, 'Skipped');
    };

    // Reschedule Logic
    const handleQuickReschedule = (addedMinutes: number) => {
        // Snooze from NOW
        const now = new Date();
        const newTimeDate = new Date(now.getTime() + addedMinutes * 60000);
        const newTimeStr = `${newTimeDate.getHours().toString().padStart(2, '0')}:${newTimeDate.getMinutes().toString().padStart(2, '0')}`;

        rescheduleDoseGroup(activeTimeGroup, newTimeStr, false);
        handleCloseWithAnimation();
    };

    const handleCloseWithAnimation = () => {
        opacity.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
                // Run exit animation
                runOnJS(hideNotificationAction)(activeTimeGroup || undefined);
            }
        });
    };

    const openFullReschedule = () => {
        const totalMinutes = require('../utils/TimeUtils').parseTimeToMinutes(activeTimeGroup);
        if (!isNaN(totalMinutes)) {
            setHours(Math.floor(totalMinutes / 60));
            setMinutes(totalMinutes % 60);
        }
        setShowReschedule(true);
    };

    const confirmReschedule = () => {
        const newTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        rescheduleDoseGroup(activeTimeGroup, newTimeStr, false);
        setShowReschedule(false);
        handleCloseWithAnimation(); // Should close with animation too? Assuming yes.
    };

    return (
        <Portal>
            <Modal visible={true} onDismiss={hideNotificationAction} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <Animated.View style={animatedStyle}>
                    <AnimatedSizeWrapper>
                        {showReschedule ? (
                            <View key="reschedule">
                                <Text variant="headlineSmall" style={styles.title}>Reschedule Group ({displayTime})</Text>
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <TimePicker
                                        hours={hours}
                                        minutes={minutes}
                                        onFocusInput={(type) => setFocused(type)}
                                        focused={focused}
                                        inputType="picker"
                                        use24HourClock={true}
                                        onChange={({ hours: newHours, minutes: newMinutes }) => {
                                            if (focused === 'hours') {
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
                                <View style={styles.buttonRow}>
                                    <Button onPress={() => setShowReschedule(false)} style={{ marginRight: 8 }}>Back</Button>
                                    <Button mode="contained" onPress={confirmReschedule}>Confirm</Button>
                                </View>
                            </View>
                        ) : (
                            <View key="main">
                                <Text variant="headlineSmall" style={styles.title}>Medications for {displayTime}</Text>

                                <ScrollView style={styles.listContainer}>
                                    {groupDoses.map(dose => (
                                        <View key={dose.id}>
                                            <PillEntry
                                                dose={dose}
                                                onTake={(id) => updateDoseStatus(id, 'Taken')}
                                                onSkip={(id) => updateDoseStatus(id, 'Skipped')}
                                                onPending={(id) => updateDoseStatus(id, 'Pending')}
                                            />
                                            <View style={styles.divider} />
                                        </View>
                                    ))}
                                    {groupDoses.length === 0 && (
                                        <Text style={{ textAlign: 'center', marginVertical: 20 }}>No meds for this time.</Text>
                                    )}
                                </ScrollView>

                                <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>Snooze / Reschedule All</Text>
                                <QuickRescheduleActions onAddMinutes={handleQuickReschedule} />

                                <Button
                                    mode="contained-tonal"
                                    onPress={openFullReschedule}
                                    style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
                                    textColor={theme.colors.onSecondaryContainer}
                                >
                                    Choose Different Time
                                </Button>

                                <Button
                                    mode="outlined"
                                    onPress={() => handleCloseWithAnimation()}
                                    style={styles.actionButton}
                                >
                                    Close
                                </Button>
                            </View>
                        )}
                    </AnimatedSizeWrapper>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        margin: 20,
        borderRadius: 28,
        maxHeight: '80%', // prevent overflow
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    listContainer: {
        maxHeight: 300,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    successContainer: {
        alignItems: 'center',
        padding: 20
    },
    actionButton: {
        marginTop: 12,
        borderRadius: 20, // Pill shape
    }
});
