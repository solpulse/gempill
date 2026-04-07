import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme, Text as PaperText, Surface } from 'react-native-paper';
import { Svg, Circle } from 'react-native-svg';

interface AdherenceCardProps {
    streakDays: number;
    percentage: number;
    style?: StyleProp<ViewStyle>;
    showStreak?: boolean;
}

export const AdherenceCard: React.FC<AdherenceCardProps> = ({ streakDays, percentage, style, showStreak = true }) => {
    const theme = useTheme();

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }, style]} elevation={0}>
            <View style={styles.textContainer}>
                <PaperText variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {showStreak ? "INTAKE STREAK" : "ADHERENCE RATE"}
                </PaperText>

                {showStreak && (
                    <View style={styles.streakRow}>
                        <PaperText variant="displaySmall" style={{ fontWeight: '600', color: theme.colors.primary, marginRight: 8 }}>
                            {streakDays}
                        </PaperText>
                        <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                            Consecutive
                        </PaperText>
                    </View>
                )}
                {!showStreak && (
                    <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', fontStyle: 'italic' }}>
                        Consistent adherence ensures the best protocol results.
                    </PaperText>
                )}
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.circleContainer}>
                    <Svg width={80} height={80}>
                        <Circle
                            stroke={theme.colors.surface}
                            cx={40}
                            cy={40}
                            r={34}
                            strokeWidth={10}
                            fill="none"
                        />
                        <Circle
                            stroke={theme.colors.primary}
                            cx={40}
                            cy={40}
                            r={34}
                            strokeWidth={10}
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - percentage / 100)}
                            strokeLinecap="round"
                            rotation="-90"
                            origin="40, 40"
                            fill="none"
                        />
                    </Svg>
                    <View style={styles.innerCircleOverlay}>
                        <PaperText 
                            variant="titleMedium" 
                            style={{ 
                                fontWeight: '700', 
                                color: theme.colors.primary, 
                                fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' 
                            }}
                        >
                            {percentage}%
                        </PaperText>
                    </View>
                </View>
            </View>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 32, // theme.roundness.lg
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionLabel: {
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 12,
        fontSize: 11,
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
    },
    chartContainer: {
        marginLeft: 16,
    },
});
