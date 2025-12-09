import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnUI
} from 'react-native-reanimated';

interface AnimatedSizeWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const AnimatedSizeWrapper: React.FC<AnimatedSizeWrapperProps> = ({ children, style }) => {
    const height = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value > 0 ? height.value : undefined,
            overflow: 'hidden',
        };
    });

    const onLayout = (event: any) => {
        'worklet';
        const targetHeight = event.nativeEvent.layout.height;
        if (targetHeight > 0 && targetHeight !== height.value) {
            if (height.value === 0) {
                height.value = targetHeight;
            } else {
                height.value = withSpring(targetHeight, {
                    mass: 0.6,
                    stiffness: 300,
                    damping: 25,
                });
            }
        }
    };

    return (
        <Animated.View style={[style, animatedStyle]}>
            <View style={{ position: 'absolute', width: '100%' }} onLayout={onLayout}>
                {children}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    hiddenWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        opacity: 0,
        zIndex: -1,
    }
}); 
