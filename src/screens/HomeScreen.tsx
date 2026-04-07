import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { TimeGroupCard } from '../components/TimeGroupCard';
import { useDailySchedule } from '../hooks/useDailySchedule';
import { useTheme, Text as PaperText, Dialog, Portal, Button } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { formatTimeForDisplay, getTimeOfDayGreeting } from '../utils/TimeUtils';
import { ConfettiExplosion } from '../components/ConfettiExplosion';
import { Dose } from '../types/GempillTypes';
import { HorizontalCalendar } from '../components/HorizontalCalendar';
import { format } from 'date-fns';

interface TimeGroupData {
    time: string;
    doses: Dose[];
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 64, // Extra breathability at the bottom
    },
    headerContent: {
        paddingTop: 40,
        marginBottom: 8,
    },
    greetingSection: {
        marginBottom: 48,
        paddingRight: '12%',
    },
    greeting: {
        fontWeight: 'normal',
        lineHeight: 48,
        letterSpacing: -0.5,
    },
    curatorRule: {
        width: 48,
        height: 1,
        backgroundColor: '#324E58',
        marginTop: 16,
        opacity: 0.2,
    },
    adherenceCard: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 40,
    },
    adherenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    adherenceLabel: {
        fontWeight: '700',
    },
    progressBarBackground: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    sectionTitle: {
        marginBottom: 28,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    emptyContainer: {
        padding: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        lineHeight: 28,
        textAlign: 'center',
        opacity: 0.6,
    },
});

export const HomeScreen = () => {
    const theme = useTheme();
    const { userProfile } = useUser();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [confirmAction, setConfirmAction] = useState<{ doseId: string, action: Dose['status'] } | null>(null);

    const {
        adherence,
        progressStyle,
        sortedTimes,
        dosesByTime,
        handleTake: ogTake,
        handleSkip: ogSkip,
        handlePending: ogPending,
        showConfetti,
        isToday,
        updateDoseStatus
    } = useDailySchedule(selectedDate);

    // Interceptors for historical modifications
    const handleTake = useCallback((doseId: string) => {
        if (!isToday) setConfirmAction({ doseId, action: 'Taken' });
        else ogTake(doseId);
    }, [isToday, ogTake]);

    const handleSkip = useCallback((doseId: string) => {
        if (!isToday) setConfirmAction({ doseId, action: 'Skipped' });
        else ogSkip(doseId);
    }, [isToday, ogSkip]);

    const handlePending = useCallback((doseId: string) => {
        if (!isToday) setConfirmAction({ doseId, action: 'Pending' });
        else ogPending(doseId);
    }, [isToday, ogPending]);

    const executeConfirmAction = () => {
        if (confirmAction) {
             updateDoseStatus(confirmAction.doseId, confirmAction.action);
             setConfirmAction(null);
        }
    };

    const listData = useMemo<TimeGroupData[]>(() =>
        sortedTimes.map(time => ({ time, doses: dosesByTime[time] })),
        [sortedTimes, dosesByTime]
    );

    const renderItem = useCallback(({ item }: { item: TimeGroupData }) => (
        <TimeGroupCard
            timeGroupName={formatTimeForDisplay(item.time)}
            time={item.time}
            doses={item.doses}
            onTake={handleTake}
            onSkip={handleSkip}
            onPending={handlePending}
        />
    ), [handleTake, handleSkip, handlePending]);

    const keyExtractor = useCallback((item: TimeGroupData) => item.time, []);

    const ListEmpty = useMemo(() => (
        <View style={styles.emptyContainer}>
            <PaperText variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' }]}>
                Your apothecary is currently empty. No medications scheduled for {isToday ? 'today' : 'this day'}.
            </PaperText>
        </View>
    ), [theme.colors.onSurfaceVariant, isToday]);

    const ListHeader = useMemo(() => (
        <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
                <PaperText variant="displayMedium" style={[styles.greeting, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                    {`${getTimeOfDayGreeting()}, ${userProfile.name || 'Friend'}`}
                </PaperText>
                <View style={styles.curatorRule} />
            </View>

            <HorizontalCalendar 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
            />

            <View style={[styles.adherenceCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.adherenceHeader}>
                    <PaperText variant="labelLarge" style={[styles.adherenceLabel, { color: theme.colors.onSurface, textTransform: 'uppercase', letterSpacing: 1.5 }]}>
                        Daily Calibration
                    </PaperText>
                    <PaperText variant="headlineMedium" style={{ color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }}>
                        {adherence}%
                    </PaperText>
                </View>
                
                <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.outlineVariant }]}>
                    <Animated.View style={[
                        styles.progressBarFill,
                        progressStyle,
                        { backgroundColor: theme.colors.primary }
                    ]} />
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <ConfettiExplosion trigger={showConfetti} />
                    </View>
                </View>

                <PaperText variant="bodySmall" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant, fontStyle: 'italic', opacity: 0.8 }}>
                    Adherence is the foundation of long-term efficacy.
                </PaperText>
            </View>

            <PaperText variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                {isToday ? "Today's Curated Selection" : `Archive for ${format(selectedDate, 'MMM d')}`}
            </PaperText>
        </View>
    ), [theme, userProfile.name, adherence, progressStyle, showConfetti, selectedDate, isToday]);


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <FlashList
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                // @ts-ignore - estimatedItemSize is a valid FlashList prop
                estimatedItemSize={200}
                contentContainerStyle={styles.contentContainer}
            />
            <Portal>
                <Dialog visible={!!confirmAction} onDismiss={() => setConfirmAction(null)} style={{ backgroundColor: theme.colors.surface, borderRadius: 32 }}>
                    <Dialog.Title style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', color: theme.colors.primary }}>Archive Modification</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
                            You are about to modify a historical record. This adjustment will permanently update your adherence archives for this session.
                        </PaperText>
                    </Dialog.Content>
                    <Dialog.Actions style={{ padding: 16 }}>
                        <Button onPress={() => setConfirmAction(null)} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button onPress={executeConfirmAction} mode="contained" style={{ borderRadius: 20, paddingHorizontal: 8 }}>Initialize Update</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};
