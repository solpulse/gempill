import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Button, Text as PaperText, TextInput as PaperInput, Portal, Dialog } from 'react-native-paper';
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
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);

    const handleProfileSubmit = async () => {
        if (!name.trim()) {
            setErrorVisible(true);
            return;
        }
        updateUserProfile({ name, age, weight });
        setStep(1);
    };

    const handleAddMedication = () => {
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
                            <View style={[styles.squircleIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <MaterialCommunityIcons name="account-circle-outline" size={56} color={theme.colors.primary} />
                            </View>
                            
                            <PaperText variant="displaySmall" style={[styles.title, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                                Protocol Profile
                            </PaperText>
                            <PaperText variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                                Personalize your apothecary archive for better adherence insights.
                            </PaperText>

                            <View style={styles.form}>
                                <PaperInput
                                    label="Full Name"
                                    mode="flat"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.input}
                                    activeUnderlineColor={theme.colors.primary}
                                    contentStyle={{ fontFamily: 'System' }}
                                />

                                <View style={styles.row}>
                                    <PaperInput
                                        label="Age"
                                        mode="flat"
                                        value={age}
                                        onChangeText={setAge}
                                        keyboardType="numeric"
                                        style={[styles.input, { flex: 1, marginRight: 12 }]}
                                        activeUnderlineColor={theme.colors.primary}
                                    />
                                    <PaperInput
                                        label="Weight (kg)"
                                        mode="flat"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        style={[styles.input, { flex: 1 }]}
                                        activeUnderlineColor={theme.colors.primary}
                                    />
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={handleProfileSubmit}
                                    style={styles.button}
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Initialize Protocol
                                </Button>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={[styles.squircleIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <MaterialCommunityIcons name="pill" size={56} color={theme.colors.primary} />
                            </View>
                            <PaperText variant="displaySmall" style={[styles.title, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                                Catalog Intake
                            </PaperText>
                            <PaperText variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                                To begin tracking, let's archive your first medication or supplement schedule.
                            </PaperText>

                            <View style={styles.spacer} />

                            <Button
                                mode="contained"
                                onPress={handleAddMedication}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                icon="plus"
                            >
                                Add First Medication
                            </Button>
                        </>
                    )}
                </View>

                <Portal>
                    <Dialog visible={errorVisible} onDismiss={() => setErrorVisible(false)} style={{ borderRadius: 28, backgroundColor: theme.colors.surface }}>
                        <Dialog.Title style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }}>Identity Required</Dialog.Title>
                        <Dialog.Content>
                            <PaperText variant="bodyMedium">Please provide a name to initialize your local protocol profile.</PaperText>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setErrorVisible(false)}>Understood</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
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
        padding: 32,
        justifyContent: 'center',
    },
    squircleIcon: {
        width: 100,
        height: 100,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 32,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: 'normal',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    button: {
        borderRadius: 32,
        marginTop: 24,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    spacer: {
        height: 24,
    }
});
