import React, { useEffect, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    Easing
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Dose } from '../types/GempillTypes';
import { useTheme, Text as PaperText } from 'react-native-paper';
import { MedicationIcon } from './MedicationIcon';

interface PillEntryProps {
    dose: Dose;
    onTake: (doseId: string) => void;
    onSkip: (doseId: string) => void;
    onPending: (doseId: string) => void;
}

const PillEntryComponent: React.FC<PillEntryProps> = ({ dose, onTake, onSkip, onPending }) => {
    const theme = useTheme();

    // Animation Values
    const animValue = useSharedValue(0);

    useEffect(() => {
        let targetValue = 0;
        if (dose.status === 'Taken') targetValue = 1;
        else if (dose.status === 'Skipped') targetValue = -1;
        else targetValue = 0;

        animValue.value = withTiming(targetValue, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
        });
    }, [dose.status]);

    const handleTake = useCallback(() => {
        if (dose.status === 'Taken') onPending(dose.id);
        else onTake(dose.id);
    }, [dose.id, dose.status, onTake, onPending]);

    const handleSkip = useCallback(() => {
        if (dose.status === 'Skipped') onPending(dose.id);
        else onSkip(dose.id);
    }, [dose.id, dose.status, onSkip, onPending]);

    // Constants
    const BUTTON_SIZE = 48;
    const EXPANDED_WIDTH = 120;

    // Animated Styles
    const takeButtonStyle = useAnimatedStyle(() => {
        const width = interpolate(animValue.value, [-1, 0, 1], [0, BUTTON_SIZE, EXPANDED_WIDTH], Extrapolation.CLAMP);
        const opacity = interpolate(animValue.value, [-1, 0, 1], [0, 1, 1], Extrapolation.CLAMP);
        const marginRight = interpolate(animValue.value, [-1, 0, 1], [0, 12, 0], Extrapolation.CLAMP);
        return { width, opacity, marginRight };
    });

    const skipButtonStyle = useAnimatedStyle(() => {
        const width = interpolate(animValue.value, [-1, 0, 1], [EXPANDED_WIDTH, BUTTON_SIZE, 0], Extrapolation.CLAMP);
        const opacity = interpolate(animValue.value, [-1, 0, 1], [1, 1, 0], Extrapolation.CLAMP);
        return { width, opacity };
    });

    const takeIconStyle = useAnimatedStyle(() => {
        const translateX = interpolate(animValue.value, [0, 1], [0, -32], Extrapolation.CLAMP);
        return { transform: [{ translateX }] };
    });

    const skipIconStyle = useAnimatedStyle(() => {
        const translateX = interpolate(animValue.value, [-1, 0], [-32, 0], Extrapolation.CLAMP);
        return { transform: [{ translateX }] };
    });

    const takeTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animValue.value, [0, 0.7, 1], [0, 0, 1], Extrapolation.CLAMP);
        const translateX = interpolate(animValue.value, [0, 1], [10, 0], Extrapolation.CLAMP);
        return { opacity, transform: [{ translateX }] };
    });

    const skipTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animValue.value, [-1, -0.7, 0], [1, 0, 0], Extrapolation.CLAMP);
        const translateX = interpolate(animValue.value, [-1, 0], [0, 10], Extrapolation.CLAMP);
        return { opacity, transform: [{ translateX }] };
    });

    if ((dose.status as string) === 'Missed') {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.surface, borderRadius: 20 }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer }]}>
                    <MedicationIcon name={dose.icon || "pill"} size={22} color={theme.colors.error} />
                </View>
                <View style={styles.detailsContainer}>
                    <PaperText variant="titleMedium" style={styles.nameText}>{dose.name}</PaperText>
                    <PaperText variant="bodySmall" style={{ color: theme.colors.error, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }}>
                        Missed Intake Archive
                    </PaperText>
                </View>
                <View style={styles.actionContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.colors.error} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderRadius: 20, marginBottom: 12 }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MedicationIcon name={dose.icon || "pill"} size={22} color={theme.colors.primary} />
            </View>

            <View style={styles.detailsContainer}>
                <PaperText variant="titleMedium" style={styles.nameText}>{dose.name}</PaperText>
                <PaperText variant="bodySmall" style={styles.subtext}>
                    {dose.dosage} {dose.dosageUnit} • {dose.frequency}
                </PaperText>
            </View>

            <View style={styles.actionContainer}>
                <View style={styles.buttonsWrapper}>
                    <Animated.View style={[{ overflow: 'hidden' }, takeButtonStyle]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleTake}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Animated.View style={takeIconStyle}>
                                    <MaterialCommunityIcons name="check" size={22} color="white" />
                                </Animated.View>
                                <Animated.Text style={[styles.buttonText, { color: "white" }, takeTextStyle]}>
                                    Taken
                                </Animated.Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={[{ overflow: 'hidden' }, skipButtonStyle]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
                            onPress={handleSkip}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Animated.View style={skipIconStyle}>
                                    <MaterialCommunityIcons name="close" size={22} color={theme.colors.onSecondaryContainer} />
                                </Animated.View>
                                <Animated.Text style={[styles.buttonText, { color: theme.colors.onSecondaryContainer }, skipTextStyle]}>
                                    Skip
                                </Animated.Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

export const PillEntry = memo(PillEntryComponent);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailsContainer: {
        flex: 1,
        marginRight: 8,
    },
    nameText: {
        fontWeight: '700',
        fontSize: 16,
    },
    subtext: {
        fontSize: 12,
        opacity: 0.7,
    },
    actionContainer: {
        width: 120,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
    },
    actionButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    buttonText: {
        fontWeight: '700',
        fontSize: 14,
        position: 'absolute',
        left: 44,
        right: 0,
    },
});
