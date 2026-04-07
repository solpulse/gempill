import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { MedDetailScreen } from '../screens/MedDetailScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useTheme } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../types/GempillTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { hasCompletedOnboarding, isLoading } = useUser();
    const theme = useTheme();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={hasCompletedOnboarding ? "Main" : "Onboarding"}
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
                animation: 'slide_from_right',
                animationDuration: 300,
            }}
        >
            {hasCompletedOnboarding ? (
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen
                        name="MedDetail"
                        component={MedDetailScreen}
                        options={{
                            animation: 'slide_from_bottom',
                        }}
                    />
                    <Stack.Screen
                        name="AddMedication"
                        component={AddMedicationScreen}
                        options={{
                            animation: 'slide_from_bottom',
                            presentation: 'modal',
                        }}
                    />
                </>
            ) : (
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
