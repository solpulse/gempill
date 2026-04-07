import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Card, Chip, Text as PaperText, useTheme, Dialog, Portal, Button } from 'react-native-paper';
import { MedicationHistoryItem, DoseStatus } from '../../types/GempillTypes';
import { useMedication } from '../../context/MedicationContext';

interface IntakeHistoryListProps {
    history: MedicationHistoryItem[];
}

export const IntakeHistoryList: React.FC<IntakeHistoryListProps> = ({ history }) => {
    const theme = useTheme();
    const { updateDoseStatus } = useMedication();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedDoseId, setSelectedDoseId] = useState<string | null>(null);

    const openStatusDialog = (doseId: string | undefined) => {
        if (!doseId) return;
        setSelectedDoseId(doseId);
        setDialogVisible(true);
    };

    const handleStatusUpdate = (status: DoseStatus) => {
        if (selectedDoseId) {
            updateDoseStatus(selectedDoseId, status);
        }
        setDialogVisible(false);
    };

    const statusOptions: DoseStatus[] = ['Taken', 'Skipped', 'Missed', 'Pending'];

    return (
        <View>
            <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
                <Card.Content style={styles.cardContent}>
                    <PaperText variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                        PROTOCOL HISTORY
                    </PaperText>

                    {history.length > 0 ? (
                        <View style={{ gap: 12 }}>
                            {history.map((item, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    onPress={() => openStatusDialog(item.doseId)} 
                                    style={[styles.historyRow, { backgroundColor: theme.colors.surface, borderRadius: 16 }]}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.historyTextContainer}>
                                        <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                                            {item.date}
                                        </PaperText>
                                        <PaperText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            {item.time}
                                        </PaperText>
                                    </View>
                                    <Chip
                                        mode="flat"
                                        style={[styles.statusChip, {
                                            backgroundColor: item.status === 'Taken'
                                                ? theme.colors.primaryContainer
                                                : theme.colors.errorContainer
                                        }]}
                                        textStyle={{
                                            color: item.status === 'Taken'
                                                ? theme.colors.onPrimaryContainer
                                                : theme.colors.onErrorContainer,
                                            fontSize: 11,
                                            fontWeight: '800'
                                        }}
                                    >
                                        {item.status.toUpperCase()}
                                    </Chip>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <PaperText style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', textAlign: 'center', padding: 16 }}>
                            No entries found in this archive.
                        </PaperText>
                    )}
                </Card.Content>
            </Card>

            <Portal>
                <Dialog 
                    visible={dialogVisible} 
                    onDismiss={() => setDialogVisible(false)}
                    style={{ backgroundColor: theme.colors.surface, borderRadius: 32 }}
                >
                    <Dialog.Title style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', color: theme.colors.primary }}>Dose Status Update</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium" style={{ marginBottom: 16 }}>
                            Update the intake result for this archived entry:
                        </PaperText>
                        <View style={{ gap: 8 }}>
                            {statusOptions.map((status) => (
                                <Button 
                                    key={status} 
                                    mode="outlined" 
                                    onPress={() => handleStatusUpdate(status)}
                                    style={{ borderRadius: 12 }}
                                    contentStyle={{ height: 48, justifyContent: 'flex-start' }}
                                    labelStyle={{ fontWeight: '600' }}
                                >
                                    Mark as {status}
                                </Button>
                            ))}
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>DISMISS</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        borderRadius: 32,
    },
    cardContent: {
        padding: 24,
    },
    sectionLabel: {
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 20,
        fontSize: 12,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    historyTextContainer: {
        flex: 1,
    },
    statusChip: {
        borderRadius: 8,
    },
});
