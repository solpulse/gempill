import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TimeGroupCard } from '../components/TimeGroupCard';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { useDailySchedule } from '../hooks/useDailySchedule';

export const HomeScreen = () => {
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
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 20 }]}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandText}>Gempill</Text>
                        <Text style={styles.greeting}>Good Morning, Alex</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        {/* Placeholder Avatar */}
                        <Ionicons name="person" size={24} color="#FFCC80" />
                    </View>
                </View>

                {/* Adherence Card */}
                <View style={styles.adherenceCard}>
                    <View style={styles.adherenceHeader}>
                        <Text style={styles.adherenceLabel}>Today's Adherence</Text>
                        <Text style={styles.adherencePercentage}>{adherence}%</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <Animated.View style={[
                            styles.progressBarFill,
                            progressStyle,
                            { backgroundColor: colors.primary }
                        ]} />
                    </View>
                </View>

                {/* Today's Schedule Section */}
                <Text style={styles.sectionTitle}>Today's Schedule</Text>

                {sortedTimes.map((time) => (
                    <TimeGroupCard
                        key={time}
                        timeGroupName={time} // Using time as group name for now
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
        backgroundColor: colors.background,
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
        color: colors.text,
        marginBottom: 8,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        width: '80%', // Allow wrapping
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adherenceCard: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        ...shadows.medium,
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
        color: colors.text,
    },
    adherencePercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: colors.primaryLight,
        borderRadius: 4,
        width: '100%',
    },
    progressBarFill: {
        height: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
    },
});
