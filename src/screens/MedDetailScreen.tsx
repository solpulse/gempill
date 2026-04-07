import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Text as PaperText } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMedicationHistory } from '../hooks/useMedicationHistory';
import { useMedication } from '../context/MedicationContext';
import { MedicationInfoCard } from '../components/med-detail/MedicationInfoCard';
import { ManageIntakeActions } from '../components/med-detail/ManageIntakeActions';
import { IntakeHistoryList } from '../components/med-detail/IntakeHistoryList';
import { AdherenceCard } from '../components/AdherenceCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MedDetail'>;

export const MedDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { medication: initialMedication } = route.params;
    const medId = initialMedication.id;

    const { medication, history, adherencePercentage, takenCount, expectedCount } = useMedicationHistory(medId);
    const { stopMedication, finishMedication, pauseMedication, resumeMedication } = useMedication();
    const theme = useTheme();

    const handleStop = () => stopMedication(medId);
    const handleFinish = () => finishMedication(medId);
    const handlePause = (days?: number) => pauseMedication(medId, days);
    const handleResume = () => resumeMedication(medId);

    if (!medication) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <PaperText style={{ textAlign: 'center', marginTop: 100 }}>Entry not found</PaperText>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Apothecary Detail Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <PaperText variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                        Prescription Archive
                    </PaperText>
                    <TouchableOpacity 
                        onPress={() => {
                            const serializedMed = {
                                ...medication,
                                startDate: typeof medication.startDate === 'string' ? medication.startDate : new Date(medication.startDate).toISOString(),
                                pausedUntil: medication.pausedUntil ? (typeof medication.pausedUntil === 'string' ? medication.pausedUntil : new Date(medication.pausedUntil).toISOString()) : undefined
                            };
                            navigation.navigate('AddMedication', { medication: serializedMed as any });
                        }}
                        style={styles.headerIcon}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    
                    <MedicationInfoCard medication={medication} />

                    <ManageIntakeActions
                        medication={medication}
                        onStop={handleStop}
                        onFinish={handleFinish}
                        onPause={handlePause}
                        onResume={handleResume}
                    />

                    <AdherenceCard
                        streakDays={takenCount}
                        percentage={adherencePercentage}
                        showStreak={false}
                        style={{ marginBottom: 24, borderRadius: 32 }}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerIcon: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'normal',
    },
    contentContainer: {
        padding: 24,
        paddingTop: 8,
    },
});
