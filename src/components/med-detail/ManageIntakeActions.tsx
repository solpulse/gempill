import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Button, Card, Dialog, Portal, RadioButton, Text as PaperText, TextInput as PaperInput, useTheme } from 'react-native-paper';
import { Medication } from '../../types/GempillTypes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
            <Card.Content style={styles.cardContent}>
                <PaperText variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    MANAGEMENT
                </PaperText>

                {medication.status === 'Active' ? (
                    <View style={styles.actionContainer}>
                        <View style={styles.row}>
                            <Button
                                mode="outlined"
                                icon="snowflake"
                                onPress={() => setFreezeDialogVisible(true)}
                                style={styles.flexButton}
                                contentStyle={styles.buttonHeight}
                                labelStyle={styles.buttonLabel}
                            >
                                Freeze
                            </Button>
                            <View style={{ width: 12 }} />
                            <Button
                                mode="contained"
                                buttonColor={theme.colors.error}
                                icon="close-octagon"
                                onPress={onStop}
                                style={styles.flexButton}
                                contentStyle={styles.buttonHeight}
                                labelStyle={[styles.buttonLabel, { color: 'white' }]}
                            >
                                Stop
                            </Button>
                        </View>
                        <Button
                            mode="contained"
                            icon="check-decagram"
                            onPress={onFinish}
                            style={styles.fullButton}
                            contentStyle={styles.buttonHeight}
                            labelStyle={styles.buttonLabel}
                        >
                            Complete Course
                        </Button>
                    </View>
                ) : (
                    <View>
                        <View style={[
                            styles.statusBadge,
                            {
                                backgroundColor: theme.colors.primaryContainer,
                                marginBottom: 16
                            }
                        ]}>
                            <MaterialCommunityIcons 
                                name={medication.status === 'Paused' ? "pause-circle" : "stop-circle"} 
                                size={20} 
                                color={theme.colors.primary} 
                                style={{ marginRight: 8 }}
                            />
                            <PaperText
                                variant="labelLarge"
                                style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
                            >
                                {medication.status === 'Paused' ? 'SYSTEM FROZEN' : medication.status.toUpperCase()}
                                {medication.pausedUntil && ` UNTIL ${new Date(medication.pausedUntil).toLocaleDateString()}`}
                            </PaperText>
                        </View>

                        <Button
                            mode="contained"
                            icon="play"
                            onPress={onResume}
                            style={styles.fullButton}
                            contentStyle={styles.buttonHeight}
                            labelStyle={styles.buttonLabel}
                        >
                            Resume Archive
                        </Button>
                    </View>
                )}

                <Portal>
                    <Dialog 
                        visible={freezeDialogVisible} 
                        onDismiss={() => setFreezeDialogVisible(false)} 
                        style={{ backgroundColor: theme.colors.surface, borderRadius: 32 }}
                    >
                        <Dialog.Title style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', color: theme.colors.primary }}>Freeze Intake</Dialog.Title>
                        <Dialog.Content>
                            <PaperText variant="bodyMedium" style={{ marginBottom: 20, color: theme.colors.onSurfaceVariant }}>
                                Freezing stops all reminders and adherence tracking temporarily.
                            </PaperText>
                            <RadioButton.Group onValueChange={val => setFreezeType(val as 'indefinite' | 'days')} value={freezeType}>
                                <TouchableOpacity onPress={() => setFreezeType('indefinite')} style={styles.radioRow}>
                                    <RadioButton.Android value="indefinite" color={theme.colors.primary} />
                                    <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Indefinite (Manual Resume)</PaperText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setFreezeType('days')} style={styles.radioRow}>
                                    <RadioButton.Android value="days" color={theme.colors.primary} />
                                    <PaperText variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Set Duration (Days)</PaperText>
                                </TouchableOpacity>
                            </RadioButton.Group>

                            {freezeType === 'days' && (
                                <PaperInput
                                    mode="flat"
                                    label="Duration in Days"
                                    value={freezeDays}
                                    onChangeText={setFreezeDays}
                                    keyboardType="numeric"
                                    style={styles.daysInput}
                                    activeUnderlineColor={theme.colors.primary}
                                />
                            )}
                        </Dialog.Content>
                        <Dialog.Actions style={{ padding: 16 }}>
                            <Button onPress={() => setFreezeDialogVisible(false)} labelStyle={{ fontWeight: '700' }}>DISMISS</Button>
                            <Button mode="contained" onPress={handleFreeze} labelStyle={{ fontWeight: '700' }}>CONFIRM FREEZE</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        borderRadius: 32, // theme.roundness.lg
    },
    cardContent: {
        padding: 24,
    },
    sectionLabel: {
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 16,
        fontSize: 12,
    },
    actionContainer: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
    },
    flexButton: {
        flex: 1,
        borderRadius: 16,
    },
    fullButton: {
        borderRadius: 16,
    },
    buttonHeight: {
        height: 52,
    },
    buttonLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        justifyContent: 'center',
    },
    daysInput: {
        marginTop: 12,
        backgroundColor: 'transparent',
    },
});
