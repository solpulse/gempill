import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Appbar, Card, Text, useTheme, Chip, Divider } from 'react-native-paper';
import { Svg, Circle } from 'react-native-svg';
import { useMedicationHistory } from '../hooks/useMedicationHistory';
import { MedicationIcon } from '../components/MedicationIcon';
import { Button, Dialog, Portal, RadioButton, TextInput as PaperInput } from 'react-native-paper';
import { useMedication } from '../context/MedicationContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MedDetail'>;

export const MedDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { medId } = route.params;
    const { medication, history, adherencePercentage, takenCount, expectedCount } = useMedicationHistory(medId);
    const { stopMedication, pauseMedication, resumeMedication } = useMedication();
    const theme = useTheme();

    const [freezeDialogVisible, setFreezeDialogVisible] = React.useState(false);
    const [freezeType, setFreezeType] = React.useState<'indefinite' | 'days'>('indefinite');
    const [freezeDays, setFreezeDays] = React.useState('7');

    const handleStop = () => {
        stopMedication(medId);
    };

    const handleFreeze = () => {
        if (freezeType === 'indefinite') {
            pauseMedication(medId);
        } else {
            const days = parseInt(freezeDays);
            if (!isNaN(days) && days > 0) {
                pauseMedication(medId, days);
            }
        }
        setFreezeDialogVisible(false);
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
                    onPress={() => navigation.navigate('AddMedication', { medication })}
                />
            </Appbar.Header>

            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.contentContainer}>

                    {/* Medication Info Card */}
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

                    {/* Manage Intake Card */}
                    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                Manage Intake
                            </Text>
                            <Divider style={{ marginBottom: 16 }} />

                            {medication.status === 'Active' ? (
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
                                        icon="stop"
                                        onPress={handleStop}
                                        style={{ flex: 1, marginLeft: 8 }}
                                    >
                                        Stop
                                    </Button>
                                </View>
                            ) : (
                                <View>
                                    <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.primary, textAlign: 'center' }}>
                                        Status: {medication.status.toUpperCase()}
                                        {medication.pausedUntil && ` until ${medication.pausedUntil.toLocaleDateString()}`}
                                    </Text>
                                    <Button
                                        mode="contained"
                                        icon="play"
                                        onPress={handleResume}
                                    >
                                        Resume Intake
                                    </Button>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

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

                    {/* Adherence Card */}
                    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                Monthly Adherence
                            </Text>
                            <Divider style={{ marginBottom: 16 }} />

                            <View style={styles.adherenceRow}>
                                <View>
                                    <Text variant="displayMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>
                                        {adherencePercentage}%
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, maxWidth: 200 }}>
                                        {takenCount} taken out of {expectedCount} expected this month
                                    </Text>
                                </View>
                                <View style={styles.circularProgressContainer}>
                                    <Svg width={64} height={64}>
                                        {/* Track */}
                                        <Circle
                                            stroke={theme.colors.surfaceVariant}
                                            cx={32}
                                            cy={32}
                                            r={29}
                                            strokeWidth={6}
                                            fill="none"
                                        />
                                        {/* Progress */}
                                        <Circle
                                            stroke={theme.colors.primary}
                                            cx={32}
                                            cy={32}
                                            r={29}
                                            strokeWidth={6}
                                            strokeDasharray={2 * Math.PI * 29}
                                            strokeDashoffset={2 * Math.PI * 29 * (1 - adherencePercentage / 100)}
                                            strokeLinecap="round"
                                            rotation="-90"
                                            origin="32, 32"
                                            fill="none"
                                        />
                                    </Svg>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Intake Log History */}
                    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                                Intake Log History
                            </Text>
                            <Divider style={{ marginBottom: 8 }} />

                            {history.length > 0 ? (
                                history.map((item, index) => (
                                    <View key={index}>
                                        <View style={styles.historyRow}>
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
                                        </View>
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
    card: {
        marginBottom: 16,
        borderRadius: 24, // High rounded corners for MD3
    },
    medInfoContent: {
        paddingHorizontal: 0, // Reset padding to handle accent bar
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
    adherenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    circularProgressContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
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
});
