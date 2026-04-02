import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Dialog, Divider, Portal, RadioButton, Text, TextInput as PaperInput, useTheme } from 'react-native-paper';
import { Medication } from '../../types/GempillTypes';
import { formatDateMMDDYYYY } from '../../utils/TimeUtils';

interface ManageIntakeActionsProps {
    medication: Medication;
    onStop: () => void;
    onFinish: () => void;
    onPause: (days?: number) => void;
    onResume: () => void;
}

export const ManageIntakeActions: React.FC<ManageIntakeActionsProps> = ({ medication, onStop, onFinish, onPause, onResume }) => {
    const theme = useTheme();
    const [freezeDialogVisible, setFreezeDialogVisible] = useState(false);
    const [freezeType, setFreezeType] = useState<'indefinite' | 'days'>('indefinite');
    const [freezeDays, setFreezeDays] = useState('7');

    const handleFreeze = () => {
        if (freezeType === 'indefinite') {
            onPause();
        } else {
            const days = parseInt(freezeDays);
            if (!isNaN(days) && days > 0) {
                onPause(days);
            }
        }
        setFreezeDialogVisible(false);
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    Manage Intake
                </Text>
                <Divider style={{ marginBottom: 16 }} />

                {medication.status === 'Active' ? (
                    <View style={{ gap: 8 }}>
                        <View style={styles.actionRow}>
                            <Button
                                mode="outlined"
                                icon="snowflake"
                                onPress={() => setFreezeDialogVisible(true)}
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                Freeze
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor={theme.colors.error}
                                icon="cancel"
                                onPress={onStop}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                Cancel
                            </Button>
                        </View>
                        <Button
                            mode="contained"
                            icon="check-all"
                            onPress={onFinish}
                        >
                            Finish
                        </Button>
                    </View>
                ) : (
                    <View>
                        <View style={[
                            styles.statusBadge,
                            {
                                backgroundColor: medication.status === 'Paused' ? theme.colors.secondaryContainer : theme.colors.errorContainer,
                                alignSelf: 'center',
                                marginBottom: 16
                            }
                        ]}>
                            <Text
                                variant="labelLarge"
                                style={{
                                    color: medication.status === 'Paused' ? theme.colors.onSecondaryContainer : theme.colors.onErrorContainer
                                }}
                            >
                                {medication.status === 'Paused' ? 'FROZEN / PAUSED' : medication.status.toUpperCase()}
                                {/* ⚡ Bolt: Replaced toLocaleDateString with fast formatter for performance */}
                                {medication.pausedUntil && ` UNTIL ${formatDateMMDDYYYY(new Date(medication.pausedUntil))}`}
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            icon="play"
                            onPress={onResume}
                        >
                            Resume Intake
                        </Button>
                    </View>
                )}

                <Portal>
                    <Dialog visible={freezeDialogVisible} onDismiss={() => setFreezeDialogVisible(false)} style={{ backgroundColor: theme.colors.surface }}>
                        <Dialog.Title>Freeze Intake</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                                Freezing stops reminders and tracking temporarily.
                            </Text>
                            <RadioButton.Group onValueChange={val => setFreezeType(val as 'indefinite' | 'days')} value={freezeType}>
                                <View style={styles.radioRow}>
                                    <RadioButton value="indefinite" />
                                    <Text>Indefinite (Until resumed)</Text>
                                </View>
                                <View style={styles.radioRow}>
                                    <RadioButton value="days" />
                                    <Text>For specific days</Text>
                                </View>
                            </RadioButton.Group>

                            {freezeType === 'days' && (
                                <PaperInput
                                    mode="outlined"
                                    label="Number of Days"
                                    value={freezeDays}
                                    onChangeText={setFreezeDays}
                                    keyboardType="numeric"
                                    style={{ marginTop: 8 }}
                                />
                            )}
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setFreezeDialogVisible(false)}>Cancel</Button>
                            <Button onPress={handleFreeze}>Freeze</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 24,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
});
