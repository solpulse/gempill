import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
// import { MedsScreen } from '../screens/MedsScreen';
import { MedDetailScreen } from '../screens/MedDetailScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useUser } from '../context/UserContext';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../types/GempillTypes';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { hasCompletedOnboarding, isLoading } = useUser();

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
                cardStyle: { backgroundColor: '#F5F5F5' },
            }}
        >
            {hasCompletedOnboarding ? (
                // Post-onboarding stack
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen name="MedDetail" component={MedDetailScreen} />
                    <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
                </>
            ) : (
                // Onboarding stack
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};
