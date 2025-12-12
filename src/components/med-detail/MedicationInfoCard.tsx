import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MedicationIcon } from '../MedicationIcon';
import { Medication } from '../../types/GempillTypes';

interface MedicationInfoCardProps {
    medication: Medication;
}

export const MedicationInfoCard: React.FC<MedicationInfoCardProps> = ({ medication }) => {
    const theme = useTheme();

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content style={styles.medInfoContent}>
                <View style={styles.medInfoRow}>
                    <View style={[styles.accentBar, { backgroundColor: medication.color || theme.colors.primary }]} />
                    <View style={styles.medInfoText}>
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>
                            {medication.name}
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Dosage: {medication.dosage} {medication.dosageUnit}
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            Times: {medication.scheduledTimes.join(', ')}
                        </Text>
                    </View>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
                        <MedicationIcon
                            name={medication.icon || "medical-bag"}
                            size={32}
                            color={theme.colors.onSurface}
                        />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 24,
    },
    medInfoContent: {
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    medInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        paddingVertical: 16,
    },
    accentBar: {
        width: 8,
        height: '100%',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginRight: 16,
    },
    medInfoText: {
        flex: 1,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 16,
    },
});
