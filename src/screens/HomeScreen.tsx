import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TimeGroupCard } from '../components/TimeGroupCard';
import { useDailySchedule } from '../hooks/useDailySchedule';
import { useTheme } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { formatTimeForDisplay, getTimeOfDayGreeting } from '../utils/TimeUtils';

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
        handlePending
    } = useDailySchedule();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 20 }]}>
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
                    </View>
                </View>

                {/* Today's Schedule Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Today's Schedule</Text>

                {sortedTimes.map((time) => (
                    <TimeGroupCard
                        key={time}
                        timeGroupName={formatTimeForDisplay(time)}
                        time={time}
                        doses={dosesByTime[time]}
                        onTake={handleTake}
                        onSkip={handleSkip}
                        onPending={handlePending}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 16,
        alignItems: 'flex-start',
    },
    brandText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        width: '80%', // Allow wrapping
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
});
