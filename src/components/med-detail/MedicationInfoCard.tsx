import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Card, Text as PaperText, useTheme } from 'react-native-paper';
import { MedicationIcon } from '../MedicationIcon';
import { Medication } from '../../types/GempillTypes';

interface MedicationInfoCardProps {
    medication: Medication;
}

export const MedicationInfoCard: React.FC<MedicationInfoCardProps> = ({ medication }) => {
    const theme = useTheme();

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
            <Card.Content style={styles.medInfoContent}>
                <View style={styles.medInfoRow}>
                    <View style={styles.medInfoText}>
                        <PaperText 
                            variant="headlineSmall" 
                            style={[styles.nameText, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}
                        >
                            {medication.name}
                        </PaperText>
                        <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                            {medication.dosage} {medication.dosageUnit}
                        </PaperText>
                        <PaperText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            Scheduled at {medication.scheduledTimes.join(', ')}
                        </PaperText>
                    </View>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
                        <MedicationIcon
                            name={medication.icon || "medical-bag"}
                            size={32}
                            color={theme.colors.primary}
                        />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        borderRadius: 32, // theme.roundness.lg
    },
    medInfoContent: {
        padding: 24,
    },
    medInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medInfoText: {
        flex: 1,
    },
    nameText: {
        marginBottom: 4,
    },
    iconContainer: {
        padding: 16,
        borderRadius: 16, // Squircle
    },
});
