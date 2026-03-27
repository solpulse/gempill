import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { TimeGroupCard } from '../components/TimeGroupCard';
import { useDailySchedule } from '../hooks/useDailySchedule';
import { useTheme } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { formatTimeForDisplay, getTimeOfDayGreeting } from '../utils/TimeUtils';
import { ConfettiExplosion } from '../components/ConfettiExplosion';
import { Dose } from '../types/GempillTypes';

interface TimeGroupData {
    time: string;
    doses: Dose[];
}

export const HomeScreen = () => {
    const theme = useTheme();
    const { userProfile } = useUser();
    const {
        adherence,
        progressStyle,
        sortedTimes,
        dosesByTime,
        handleTake,
        handleSkip,
        handlePending,
        showConfetti
    } = useDailySchedule();

    // Memoize list data to prevent unnecessary re-renders
    const listData = useMemo<TimeGroupData[]>(() =>
        sortedTimes.map(time => ({ time, doses: dosesByTime[time] })),
        [sortedTimes, dosesByTime]
    );

    // Memoize renderItem to prevent re-creation on each render
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
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No medications scheduled for today.
            </Text>
        </View>
    ), [theme.colors.onSurfaceVariant]);

    // Memoize header component
    const ListHeader = useMemo(() => (
        <>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: theme.colors.onBackground }]}>
                        {`${getTimeOfDayGreeting()}, ${userProfile.name || 'Friend'}`}
                    </Text>
                </View>
            </View>

            {/* Adherence Card */}
            <View style={[styles.adherenceCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.adherenceHeader}>
                    <Text style={[styles.adherenceLabel, { color: theme.colors.onSurface }]}>Today's Adherence</Text>
                    <Text style={[styles.adherencePercentage, { color: theme.colors.primary }]}>{adherence}%</Text>
                </View>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Animated.View style={[
                        styles.progressBarFill,
                        progressStyle,
                        { backgroundColor: theme.colors.primary }
                    ]} />
                    {/* Confetti overlay centered on the bar */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <ConfettiExplosion trigger={showConfetti} />
                    </View>
                </View>
            </View>

            {/* Today's Schedule Section */}
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Today's Schedule</Text>
        </>
    ), [theme, userProfile.name, adherence, progressStyle, showConfetti]);

    // Empty state component
    const ListEmpty = useMemo(() => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No doses scheduled for today.
            </Text>
        </View>
    ), [theme.colors.onSurfaceVariant]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <FlashList
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                estimatedItemSize={200}
                contentContainerStyle={styles.contentContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 16,
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        width: '80%',
    },
    adherenceCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    adherenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    adherenceLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    adherencePercentage: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBarBackground: {
        height: 8,
        borderRadius: 4,
        width: '100%',
    },
    progressBarFill: {
        height: 8,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
