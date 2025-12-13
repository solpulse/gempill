import React, { useEffect, useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';

interface ConfettiExplosionProps {
    trigger: boolean;
}

const PARTICLE_COUNT = 38; // Increased by ~25% from 30
const COLORS = ['#FFD700', '#FF6347', '#00CED1', '#ADFF2F', '#FF69B4', '#87CEEB'];

interface ParticleProps {
    index: number;
    trigger: boolean;
    origin: { x: number; y: number };
}

const Particle: React.FC<ParticleProps> = ({ index, trigger, origin }) => {
    // Randomize physics
    const angle = Math.random() * Math.PI * 2; // Full circle
    // const distance = 50 + Math.random() * 100; // 50-150px outward
    // Distance needs to be enough to be visible but not huge
    // Increased distance slightly to match longer flight time
    const distance = 100 + Math.random() * 80;

    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    const scale = 0.5 + Math.random() * 0.8;
    const color = COLORS[index % COLORS.length];
    // Increased duration base by 75ms (350 -> 425)
    const duration = 425 + Math.random() * 200; // ~425-625ms

    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const opacity = useSharedValue(0);
    const particleScale = useSharedValue(0);

    useEffect(() => {
        if (trigger) {
            // Reset
            x.value = 0;
            y.value = 0;
            opacity.value = 1;
            particleScale.value = 0;

            // Animate
            const delay = Math.random() * 50; // Slight stagger

            x.value = withDelay(delay, withTiming(targetX, { duration: duration, easing: Easing.out(Easing.quad) }));
            y.value = withDelay(delay, withTiming(targetY, { duration: duration, easing: Easing.out(Easing.quad) }));

            particleScale.value = withDelay(delay, withSequence(
                withTiming(scale, { duration: duration * 0.2 }),
                withTiming(scale * 0.5, { duration: duration * 0.8 })
            ));

            opacity.value = withDelay(delay, withSequence(
                withTiming(1, { duration: duration * 0.5 }),
                withTiming(0, { duration: duration * 0.5 })
            ));
        }
    }, [trigger]);

    const style = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: x.value },
                { translateY: y.value },
                { scale: particleScale.value }
            ],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[styles.particle, { backgroundColor: color }, style]} />
    );
};

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({ trigger }) => {
    // We render particles absolutely centered
    // To trigger again, the parent toggles `trigger` prop.
    // However, for RE-triggering on same value, standard hook deps work if trigger goes false then true.
    // But the adherence might stay at 100%. User said "When... reaches 100%".
    // So distinct transition 99->100 is the key.

    // We only render if trigger is true? No, particles need to exist to animate out.
    // We can mount them always and just animate opacity.

    // Key to force re-render/reset if needed, but props update handles it inside Particle useEffect.

    return (
        <View style={styles.container} pointerEvents="none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <Particle key={i} index={i} trigger={trigger} origin={{ x: 0, y: 0 }} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'flex-end', // Explode from the right end
        zIndex: 1000, // On top of the bar
    },
    particle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
    },
});
