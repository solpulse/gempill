import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Dose } from '../types/GempillTypes';
import { colors } from '../theme/colors';
import { MedicationIcon } from './MedicationIcon';

interface PillEntryProps {
    dose: Dose;
    onTake: (doseId: string) => void;
    onSkip: (doseId: string) => void;
    onPending: (doseId: string) => void;
}

export const PillEntry: React.FC<PillEntryProps> = ({ dose, onTake, onSkip, onPending }) => {
    // Animation Values
    // 0: Pending (Both visible)
    // 1: Taken (Check expanded, Cross hidden)
    // -1: Skipped (Cross expanded, Check hidden)
    const animValue = useSharedValue(0);

    useEffect(() => {
        let targetValue = 0;
        if (dose.status === 'Taken') targetValue = 1;
        else if (dose.status === 'Skipped') targetValue = -1;
        else targetValue = 0;

        animValue.value = withTiming(targetValue, {
            duration: 250,
            easing: Easing.out(Easing.cubic),
        });
    }, [dose.status]);

    const handleTake = () => {
        if (dose.status === 'Taken') {
            onPending(dose.id);
        } else {
            onTake(dose.id);
        }
    };

    const handleSkip = () => {
        if (dose.status === 'Skipped') {
            onPending(dose.id);
        } else {
            onSkip(dose.id);
        }
    };

    // Constants
    const BUTTON_SIZE = 44;
    const EXPANDED_WIDTH = 110;

    // Animated Styles
    const takeButtonStyle = useAnimatedStyle(() => {
        const width = interpolate(
            animValue.value,
            [-1, 0, 1],
            [0, BUTTON_SIZE, EXPANDED_WIDTH],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            animValue.value,
            [-1, 0, 1],
            [0, 1, 1],
            Extrapolation.CLAMP
        );
        const marginRight = interpolate(
            animValue.value,
            [-1, 0, 1],
            [0, 12, 0],
            Extrapolation.CLAMP
        );
        return {
            width,
            opacity,
            marginRight,
        };
    });

    const skipButtonStyle = useAnimatedStyle(() => {
        const width = interpolate(
            animValue.value,
            [-1, 0, 1],
            [EXPANDED_WIDTH, BUTTON_SIZE, 0],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            animValue.value,
            [-1, 0, 1],
            [1, 1, 0],
            Extrapolation.CLAMP
        );
        return {
            width,
            opacity,
        };
    });

    const takeIconStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animValue.value,
            [0, 1],
            [0, -28],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateX }],
        };
    });

    const skipIconStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            animValue.value,
            [-1, 0],
            [-28, 0],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateX }],
        };
    });

    const takeTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animValue.value,
            [0, 0.7, 1],
            [0, 0, 1],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            animValue.value,
            [0, 1],
            [10, 0],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ translateX }],
        };
    });

    const skipTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animValue.value,
            [-1, -0.7, 0],
            [1, 0, 0],
            Extrapolation.CLAMP
        );
        const translateX = interpolate(
            animValue.value,
            [-1, 0],
            [0, 10],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ translateX }],
        };
    });


    // Missed status is static and distinct
    if ((dose.status as string) === 'Missed') {
        return (
            <View style={styles.container}>
                <View style={[styles.iconContainer, { backgroundColor: dose.color || colors.primaryLight }]}>
                    <MedicationIcon name={dose.icon || "pill"} size={24} color={colors.text} />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.medName}>{dose.name}</Text>
                    <Text style={styles.dosageText}>{dose.dosage} {dose.dosageUnit}, {dose.frequency}</Text>
                </View>
                <View style={styles.actionContainer}>
                    <View style={styles.missedBadge}>
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.missedBadgeText}>Missed</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Pill Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: dose.color || colors.primaryLight }]}>
                <MedicationIcon name={dose.icon || "pill"} size={24} color={colors.text} />
            </View>

            {/* Details Container */}
            <View style={styles.detailsContainer}>
                <Text style={styles.medName}>{dose.name}</Text>
                <Text style={styles.dosageText}>
                    {dose.dosage} {dose.dosageUnit}, {dose.frequency}
                </Text>
            </View>

            {/* Action Container - Fixed Width for centering */}
            <View style={styles.actionContainer}>
                <View style={styles.buttonsWrapper}>
                    {/* Take Button */}
                    <Animated.View style={[
                        { overflow: 'hidden' },
                        takeButtonStyle
                    ]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                            onPress={handleTake}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Animated.View style={takeIconStyle}>
                                    <Ionicons name="checkmark" size={28} color={colors.success} style={{ fontWeight: '900' }} />
                                </Animated.View>
                                <Animated.Text
                                    style={[
                                        styles.buttonText,
                                        { color: colors.success },
                                        takeTextStyle
                                    ]}
                                    numberOfLines={1}
                                >
                                    Taken
                                </Animated.Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Skip Button */}
                    <Animated.View style={[
                        { overflow: 'hidden' },
                        skipButtonStyle
                    ]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                            onPress={handleSkip}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Animated.View style={skipIconStyle}>
                                    <Ionicons name="close" size={28} color={colors.error} style={{ fontWeight: '900' }} />
                                </Animated.View>
                                <Animated.Text
                                    style={[
                                        styles.buttonText,
                                        { color: colors.error },
                                        skipTextStyle
                                    ]}
                                    numberOfLines={1}
                                >
                                    Skipped
                                </Animated.Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailsContainer: {
        flex: 1,
        marginRight: 8,
    },
    medName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    dosageText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    actionContainer: {
        width: 110, // Fixed width to contain the buttons/expanded button
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%', // Take full width of animated container
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 15,
        position: 'absolute',
        left: 40, // Offset from icon (icon size + spacing)
        right: 0,
    },
    missedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorLight,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        width: '100%', // Fill container
        justifyContent: 'center',
    },
    missedBadgeText: {
        color: colors.error,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
});
