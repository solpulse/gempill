import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { MedicationHistoryItem } from '../../types/GempillTypes';
import { useMedication } from '../../context/MedicationContext';
import { Alert, TouchableOpacity } from 'react-native';

interface IntakeHistoryListProps {
    history: MedicationHistoryItem[];
}

export const IntakeHistoryList: React.FC<IntakeHistoryListProps> = ({ history }) => {
    const theme = useTheme();
    const { updateDoseStatus } = useMedication();

    const handleLogPress = (doseId: string | undefined) => {
        if (!doseId) return;
        Alert.alert(
            "Update Dose Status",
            "Select new status:",
            [
                { text: "Taken", onPress: () => updateDoseStatus(doseId, 'Taken') },
                { text: "Skipped", onPress: () => updateDoseStatus(doseId, 'Skipped') },
                { text: "Missed", onPress: () => updateDoseStatus(doseId, 'Missed') },
                { text: "Pending", onPress: () => updateDoseStatus(doseId, 'Pending') },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    Intake Log History
                </Text>
                <Divider style={{ marginBottom: 8 }} />

                {history.length > 0 ? (
                    history.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity onPress={() => handleLogPress(item.doseId)} style={styles.historyRow}>
                                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {item.date} at {item.time}
                                </Text>
                                <Chip
                                    mode="flat"
                                    style={{
                                        backgroundColor: item.status === 'Taken'
                                            ? theme.colors.primaryContainer
                                            : theme.colors.errorContainer
                                    }}
                                    textStyle={{
                                        color: item.status === 'Taken'
                                            ? theme.colors.onPrimaryContainer
                                            : theme.colors.onErrorContainer
                                    }}
                                >
                                    {item.status.toUpperCase()}
                                </Chip>
                            </TouchableOpacity>
                            {index < history.length - 1 && <Divider />}
                        </View>
                    ))
                ) : (
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', padding: 8 }}>
                        No history available for this month.
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 24,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
});
