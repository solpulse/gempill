import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, useTheme, Card, IconButton } from 'react-native-paper';
import { useNotificationAction } from '../context/NotificationActionContext';
import { useMedication } from '../context/MedicationContext';
import { QuickRescheduleActions } from './QuickRescheduleActions';
import { TimePicker } from 'react-native-paper-dates';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AnimatedSizeWrapper } from './AnimatedSizeWrapper';
import { addMinutesToTime, formatTimeForDisplay } from '../utils/TimeUtils';
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

    // Filter filtering doses for THIS time group (include all statuses so we show animation)
    const groupDoses = doses.filter(
        d => d.scheduledTime === activeTimeGroup
    );

    // Filter for pending count for auto-close logic
    const pendingCount = groupDoses.filter(d => d.status === 'Pending').length;

    // Auto-close if no pending doses remain (and we definitely had an activeTimeGroup)
    useEffect(() => {
        if (activeTimeGroup && pendingCount === 0 && !showReschedule) {
            // Delay to allow animation to finish and user to see "Taken" state
            const timer = setTimeout(() => {
                hideNotificationAction();
            }, 1000); // 1s delay
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

    // Reschedule Logic (Affects ALL pending doses for this group? Or creates individual ones?)
    // "rescheduleDoseGroup" in MedContext currently affects the GROUP.
    // The requirement implies managing the TIME SLOT. So we reschedule the slot.
    // Reschedule Logic
    const handleQuickReschedule = (addedMinutes: number) => {
        // Use utility to handle 12h/24h formatted strings robustly
        const newTimeStr = addMinutesToTime(activeTimeGroup, addedMinutes);

        // This moves the group to a new time.
        // Since we filtered by `activeTimeGroup`, we need to close the modal because the time changes!
        rescheduleDoseGroup(activeTimeGroup, newTimeStr, false);
        hideNotificationAction();
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
        hideNotificationAction();
    };

    return (
        <Portal>
            <Modal visible={true} onDismiss={hideNotificationAction} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}>
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

                            <Button mode="outlined" onPress={openFullReschedule} style={{ marginTop: 16 }}>
                                Choose Different Time
                            </Button>

                            <Button onPress={hideNotificationAction} style={{ marginTop: 8 }}>
                                Close
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
    }
});
