import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { Svg, Circle } from 'react-native-svg';

interface AdherenceCardProps {
    streakDays: number;
    percentage: number;
}

export const AdherenceCard: React.FC<AdherenceCardProps> = ({ streakDays, percentage }) => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Adherence Streak</Text>
                <View style={styles.streakRow}>
                    <Text style={styles.streakNumber}>{streakDays}</Text>
                    <Text style={styles.streakLabel}>Days in a Row!</Text>
                </View>
                <Text style={styles.subtitle}>Keep up the great work!</Text>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.circleContainer}>
                    <Svg width={80} height={80}>
                        {/* Track */}
                        <Circle
                            stroke={colors.successLight}
                            cx={40}
                            cy={40}
                            r={36}
                            strokeWidth={8}
                            fill="none"
                        />
                        {/* Progress */}
                        <Circle
                            stroke={colors.success}
                            cx={40}
                            cy={40}
                            r={36}
                            strokeWidth={8}
                            strokeDasharray={2 * Math.PI * 36}
                            strokeDashoffset={2 * Math.PI * 36 * (1 - percentage / 100)}
                            strokeLinecap="round"
                            rotation="-90"
                            origin="40, 40"
                            fill="none"
                        />
                    </Svg>
                    <View style={styles.innerCircleOverlay}>
                        <Text style={styles.percentageText}>{percentage}%</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 24,
        ...shadows.medium,
    },
    circleContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerCircleOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    streakNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.success,
        marginRight: 8,
    },
    streakLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    chartContainer: {
        marginLeft: 16,
    },
    percentageText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
});
