import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Modal, Portal, Button, useTheme, Text as PaperText } from 'react-native-paper';
import { useNotificationAction } from '../context/NotificationActionContext';
import { useMedication } from '../context/MedicationContext';
import { QuickRescheduleActions } from './QuickRescheduleActions';
import { TimePicker } from 'react-native-paper-dates';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { AnimatedSizeWrapper } from './AnimatedSizeWrapper';
import { formatTimeForDisplay } from '../utils/TimeUtils';
import { PillEntry } from './PillEntry';

export const NotificationActionModal: React.FC = () => {
    const { activeTimeGroup, hideNotificationAction } = useNotificationAction();
    const { doses, updateDoseStatus, rescheduleDoseGroup } = useMedication();
    const theme = useTheme();

    const [showReschedule, setShowReschedule] = useState(false);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [focused, setFocused] = useState<'hours' | 'minutes'>('hours');

    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return { opacity: opacity.value };
    });

    const groupDoses = doses.filter(d => d.scheduledTime === activeTimeGroup);
    const pendingCount = groupDoses.filter(d => d.status === 'Pending').length;

    useEffect(() => {
        if (activeTimeGroup) opacity.value = 1;
    }, [activeTimeGroup]);

    useEffect(() => {
        if (activeTimeGroup && pendingCount === 0 && !showReschedule) {
            const timer = setTimeout(() => {
                handleCloseWithAnimation();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [pendingCount, activeTimeGroup, showReschedule]);

    if (!activeTimeGroup) return null;

    const displayTime = formatTimeForDisplay(activeTimeGroup);

    const handleQuickReschedule = (addedMinutes: number) => {
        const now = new Date();
        const newTimeDate = new Date(now.getTime() + addedMinutes * 60000);
        const newTimeStr = `${newTimeDate.getHours().toString().padStart(2, '0')}:${newTimeDate.getMinutes().toString().padStart(2, '0')}`;
        rescheduleDoseGroup(activeTimeGroup, newTimeStr, false);
        handleCloseWithAnimation();
    };

    const handleCloseWithAnimation = () => {
        opacity.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) runOnJS(hideNotificationAction)(activeTimeGroup || undefined);
        });
    };

    const openFullReschedule = () => {
        const parts = activeTimeGroup.split(':');
        if (parts.length === 2) {
            setHours(parseInt(parts[0]));
            setMinutes(parseInt(parts[1]));
        }
        setShowReschedule(true);
    };

    const confirmReschedule = () => {
        const newTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        rescheduleDoseGroup(activeTimeGroup, newTimeStr, false);
        setShowReschedule(false);
        handleCloseWithAnimation();
    };

    return (
        <Portal>
            <Modal 
                visible={true} 
                onDismiss={() => activeTimeGroup && hideNotificationAction(activeTimeGroup)} 
                contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}
            >
                <Animated.View style={animatedStyle}>
                    <AnimatedSizeWrapper>
                        {showReschedule ? (
                            <View key="reschedule">
                                <PaperText variant="headlineSmall" style={[styles.title, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                                    Archive Postponement
                                </PaperText>
                                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                    <TimePicker
                                        hours={hours}
                                        minutes={minutes}
                                        onFocusInput={(type) => setFocused(type)}
                                        focused={focused}
                                        inputType="picker"
                                        use24HourClock={true}
                                        onChange={({ hours: h, minutes: m }) => {
                                            setHours(h);
                                            setMinutes(m);
                                            if (focused === 'hours') setFocused('minutes');
                                        }}
                                    />
                                </View>
                                <View style={styles.buttonRow}>
                                    <Button onPress={() => setShowReschedule(false)} style={{ marginRight: 12 }}>REVERT</Button>
                                    <Button mode="contained" onPress={confirmReschedule} style={{ borderRadius: 16 }}>CONFIRM</Button>
                                </View>
                            </View>
                        ) : (
                            <View key="main">
                                <PaperText variant="headlineSmall" style={[styles.title, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                                    Prescription Window
                                </PaperText>
                                <PaperText variant="labelLarge" style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>
                                    SCHEDULED FOR {displayTime}
                                </PaperText>

                                <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                                    {groupDoses.map(dose => (
                                        <PillEntry
                                            key={dose.id}
                                            dose={dose}
                                            onTake={(id) => updateDoseStatus(id, 'Taken')}
                                            onSkip={(id) => updateDoseStatus(id, 'Skipped')}
                                            onPending={(id) => updateDoseStatus(id, 'Pending')}
                                        />
                                    ))}
                                    {groupDoses.length === 0 && (
                                        <PaperText style={{ textAlign: 'center', marginVertical: 32, opacity: 0.5 }}>Archive Clear</PaperText>
                                    )}
                                </ScrollView>

                                <View style={styles.rescheduleSection}>
                                    <PaperText variant="labelMedium" style={styles.sectionLabel}>SNOOZE ALL ENTRIES</PaperText>
                                    <QuickRescheduleActions onAddMinutes={handleQuickReschedule} />

                                    <Button
                                        mode="contained-tonal"
                                        onPress={openFullReschedule}
                                        style={styles.fullActionButton}
                                        contentStyle={styles.buttonHeight}
                                        labelStyle={styles.buttonLabel}
                                    >
                                        CUSTOM ARCHIVE TIME
                                    </Button>

                                    <Button
                                        mode="text"
                                        onPress={() => handleCloseWithAnimation()}
                                        style={styles.closeButton}
                                        labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
                                    >
                                        DISMISS
                                    </Button>
                                </View>
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
        margin: 16,
        borderRadius: 48, // theme.roundness.xl
        maxHeight: '85%',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'normal',
    },
    timeLabel: {
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: 1.5,
        opacity: 0.6,
    },
    listContainer: {
        maxHeight: 320,
        marginBottom: 16,
    },
    rescheduleSection: {
        marginTop: 8,
        borderTopWidth: 0,
    },
    sectionLabel: {
        textAlign: 'center',
        opacity: 0.5,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    fullActionButton: {
        marginTop: 8,
        borderRadius: 20,
    },
    closeButton: {
        marginTop: 8,
    },
    buttonHeight: {
        height: 52,
    },
    buttonLabel: {
        fontWeight: '700',
    },
});
