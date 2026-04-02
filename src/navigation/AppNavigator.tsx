import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { MedDetailScreen } from '../screens/MedDetailScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useUser } from '../context/UserContext';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../types/GempillTypes';
import { useTheme } from 'react-native-paper';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { hasCompletedOnboarding, isLoading } = useUser();
    const theme = useTheme();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={hasCompletedOnboarding ? "Main" : "Onboarding"}
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }, // Use theme background to avoid flashes
                animation: 'slide_from_right', // Smooth native slide
                animationDuration: 300, // Slightly slower for smoother feel
            }}
        >
            {hasCompletedOnboarding ? (
                // Post-onboarding stack
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen
                        name="MedDetail"
                        component={MedDetailScreen}
                        options={{
                            animation: 'slide_from_bottom', // Modal-like for detail screens
                        }}
                    />
                    <Stack.Screen
                        name="AddMedication"
                        component={AddMedicationScreen}
                        options={{
                            animation: 'slide_from_bottom',
                            presentation: 'modal', // Full modal presentation
                        }}
                    />
                </>
            ) : (
                // Onboarding stack
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen
                        name="AddMedication"
                        component={AddMedicationScreen}
                        options={{
                            animation: 'fade_from_bottom',
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
