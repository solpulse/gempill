import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useMedicationHistory } from '../hooks/useMedicationHistory';
import { useMedication } from '../context/MedicationContext';
import { MedicationInfoCard } from '../components/med-detail/MedicationInfoCard';
import { ManageIntakeActions } from '../components/med-detail/ManageIntakeActions';
import { IntakeHistoryList } from '../components/med-detail/IntakeHistoryList';
import { AdherenceCard } from '../components/AdherenceCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MedDetail'>;

export const MedDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    // We expect the full medication object now, or at least we need the ID from it if passing param is changed.
    // Ideally useMedicationHistory might need just ID.
    const { medication: initialMedication } = route.params;
    const medId = initialMedication.id;

    const { medication, history, adherencePercentage, takenCount, expectedCount } = useMedicationHistory(medId);
    const { stopMedication, finishMedication, pauseMedication, resumeMedication } = useMedication();
    const theme = useTheme();

    const handleStop = () => {
        stopMedication(medId);
    };

    const handleFinish = () => {
        finishMedication(medId);
    };

    const handlePause = (days?: number) => {
        pauseMedication(medId, days);
    };

    const handleResume = () => {
        resumeMedication(medId);
    };

    if (!medication) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Medication not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header mode="small" elevated>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="" />
                <Appbar.Action
                    icon="pencil"
                    onPress={() => {
                        const serializedMed = {
                            ...medication,
                            startDate: typeof medication.startDate === 'string' ? medication.startDate : new Date(medication.startDate).toISOString(), // Ensure it's string
                            pausedUntil: medication.pausedUntil ? (typeof medication.pausedUntil === 'string' ? medication.pausedUntil : new Date(medication.pausedUntil).toISOString()) : undefined
                        };
                        navigation.navigate('AddMedication', { medication: serializedMed as any })
                    }}
                />
            </Appbar.Header>

            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.contentContainer}>

                    <MedicationInfoCard medication={medication} />

                    <ManageIntakeActions
                        medication={medication}
                        onStop={handleStop}
                        onFinish={handleFinish}
                        onPause={handlePause}
                        onResume={handleResume}
                    />

                    <AdherenceCard
                        streakDays={takenCount} // Assuming streak logic is similar or passed differently, using takenCount for now as placeholder for streak
                        percentage={adherencePercentage}
                        showStreak={false}
                        style={{ marginBottom: 16 }}
                    />

                    <IntakeHistoryList history={history} />

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
});
