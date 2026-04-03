import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Button } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const theme = useTheme();
    const { updateUserProfile } = useUser();

    // Step 0: Profile Input
    // Step 1: Prompt to add meds
    const [step, setStep] = useState(0);

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');

    const handleProfileSubmit = async () => {
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }
        updateUserProfile({ name, age, weight });
        setStep(1);
    };

    const handleAddMedication = () => {
        // Navigate to AddMedication with special flag
        navigation.navigate('AddMedication', { isOnboarding: true });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    {step === 0 ? (
                        <>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="account-circle-outline" size={80} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.title, { color: theme.colors.onBackground }]}>Welcome to Gempill</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Let's get to know you better</Text>

                            <View style={styles.form}>
                                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Name</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.onSurface,
                                        borderColor: theme.colors.outline
                                    }]}
                                    placeholder="Your Name"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    value={name}
                                    onChangeText={setName}
                                    maxLength={50}
                                />

                                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Age</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.onSurface,
                                        borderColor: theme.colors.outline
                                    }]}
                                    placeholder="Age"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    maxLength={3}
                                />

                                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Weight</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.onSurface,
                                        borderColor: theme.colors.outline
                                    }]}
                                    placeholder="Weight (kg/lbs)"
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />

                                <Button
                                    mode="contained"
                                    onPress={handleProfileSubmit}
                                    style={styles.button}
                                    contentStyle={{ paddingVertical: 8 }}
                                >
                                    Continue
                                </Button>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="pill" size={80} color={theme.colors.secondary} />
                            </View>
                            <Text style={[styles.title, { color: theme.colors.onBackground }]}>Add Your First Medication</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                                To get the most out of Gempill, let's set up your first medication or supplement schedule.
                            </Text>

                            <View style={styles.spacer} />

                            <Button
                                mode="contained"
                                onPress={handleAddMedication}
                                style={styles.button}
                                contentStyle={{ paddingVertical: 8 }}
                            >
                                Add Medication
                            </Button>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        fontSize: 16,
    },
    button: {
        borderRadius: 30,
        marginTop: 12,
    },
    spacer: {
        height: 40,
    }
});
