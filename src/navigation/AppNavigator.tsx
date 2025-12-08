import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { MedsScreen } from '../screens/MedsScreen';
import { MedDetailScreen } from '../screens/MedDetailScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { RootStackParamList } from '../types/GempillTypes';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F5F5F5' },
            }}
        >
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Meds" component={MedsScreen} />
            <Stack.Screen name="MedDetail" component={MedDetailScreen} />
            <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
        </Stack.Navigator>
    );
};
