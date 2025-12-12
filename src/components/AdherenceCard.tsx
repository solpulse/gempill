import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme, Text, Surface } from 'react-native-paper'; // Import Text from paper for consistency
import { Svg, Circle } from 'react-native-svg';

interface AdherenceCardProps {
    streakDays: number;
    percentage: number;
    style?: StyleProp<ViewStyle>; // Allow overriding styles
    showStreak?: boolean; // Sometimes we might only want the circular progress
}

export const AdherenceCard: React.FC<AdherenceCardProps> = ({ streakDays, percentage, style, showStreak = true }) => {
    const theme = useTheme();

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }, style]} elevation={2}>
            <View style={styles.textContainer}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 8 }}>
                    {showStreak ? "Adherence Streak" : "Monthly Adherence"}
                </Text>

                {showStreak && (
                    <View style={styles.streakRow}>
                        <Text variant="displayMedium" style={{ fontWeight: 'bold', color: theme.colors.tertiary || theme.colors.primary, marginRight: 8 }}>
                            {streakDays}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Days in a Row!
                        </Text>
                    </View>
                )}
                {!showStreak && (
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, maxWidth: 200 }}>
                        {/* This text is specific to the screen using it usually, but we can make it generic or pass children */}
                        Keep up the great work!
                    </Text>
                )}

                {showStreak && (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        Keep up the great work!
                    </Text>
                )}
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.circleContainer}>
                    <Svg width={80} height={80}>
                        {/* Track */}
                        <Circle
                            stroke={theme.colors.elevation.level3} // Use a subtle track color
                            cx={40}
                            cy={40}
                            r={36}
                            strokeWidth={8}
                            fill="none"
                        />
                        {/* Progress */}
                        <Circle
                            stroke={theme.colors.tertiary || theme.colors.primary}
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
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                            {percentage}%
                        </Text>
                    </View>
                </View>
            </View>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
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
    streakRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    chartContainer: {
        marginLeft: 16,
    },
});
