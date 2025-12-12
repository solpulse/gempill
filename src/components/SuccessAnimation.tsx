import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export const SuccessAnimation = () => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const theme = useTheme();

    useEffect(() => {
        // Animation should last 1.5 seconds total
        scale.value = withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.exp)
        });
        opacity.value = withTiming(1, {
            duration: 800
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, animatedStyle]}>
                <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
                <Text style={[styles.text, { color: theme.colors.primary }]}>Rescheduled!</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 250,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: 'bold',
    },
});
