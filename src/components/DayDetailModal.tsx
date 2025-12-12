import React from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, IconButton, Surface, useTheme } from 'react-native-paper';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { DailyLog } from '../utils/mockData';

interface DayDetailModalProps {
    visible: boolean;
    onDismiss: () => void;
    date: Date;
    adherence: number;
    logs: DailyLog[];
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
    visible,
    onDismiss,
    date,
    adherence,
    logs
}) => {
    const theme = useTheme();

    // Progress Ring Configuration
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = adherence * circumference;
    const percentage = Math.round(adherence * 100);

    // Color determination
    const progressColor = percentage === 100 ? theme.colors.tertiary : theme.colors.primary;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDismiss}
        >
            <View style={styles.modalOverlay}>
                <Surface style={[styles.modalContent, { backgroundColor: theme.colors.background }]} elevation={4}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
                        <Text variant="titleLarge" style={styles.dateTitle}>
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                        <IconButton icon="close" onPress={onDismiss} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Adherence Ring */}
                        <View style={styles.ringContainer}>
                            <Svg width={size} height={size}>
                                {/* Background Circle */}
                                <Circle
                                    stroke={theme.colors.surfaceVariant}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                />
                                {/* Progress Circle */}
                                <Circle
                                    stroke={progressColor}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - progress}
                                    strokeLinecap="round"
                                    rotation="-90"
                                    origin={`${size / 2}, ${size / 2}`}
                                    fill="none"
                                />
                                <SvgText
                                    x={size / 2}
                                    y={size / 2}
                                    fontSize="24"
                                    fontWeight="bold"
                                    fill={theme.colors.onSurface}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {`${percentage}%`}
                                </SvgText>
                            </Svg>
                            <Text variant="labelLarge" style={[styles.adherenceLabel, { color: theme.colors.onSurfaceVariant }]}>Daily Adherence</Text>
                        </View>

                        {/* Logs List */}
                        <View style={styles.logsContainer}>
                            <Text variant="titleMedium" style={styles.logsTitle}>Medication Log</Text>
                            {logs.length > 0 ? (
                                logs.map((log, index) => {
                                    // Determine styles based on status, matching PillEntry
                                    let badgeBg = theme.colors.surfaceVariant;
                                    let badgeText = theme.colors.onSurfaceVariant;

                                    if (log.status === 'Taken') {
                                        badgeBg = theme.colors.tertiaryContainer;
                                        badgeText = theme.colors.onTertiaryContainer;
                                    } else if (log.status === 'Missed' || log.status === 'Skipped') {
                                        badgeBg = theme.colors.errorContainer;
                                        badgeText = theme.colors.onErrorContainer;
                                    }

                                    return (
                                        <View key={index} style={[styles.logItem, { backgroundColor: theme.colors.surface }]}>
                                            <View style={[styles.logIcon, { backgroundColor: log.color }]}>
                                                {/* Placeholder for icon */}
                                            </View>
                                            <View style={styles.logDetails}>
                                                <Text variant="bodyLarge" style={styles.medName}>{log.medName}</Text>
                                                <Text variant="bodySmall" style={[styles.medTime, { color: theme.colors.onSurfaceVariant }]}>{log.time}</Text>
                                            </View>
                                            <View style={[
                                                styles.statusBadge,
                                                { backgroundColor: badgeBg }
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    { color: badgeText }
                                                ]}>
                                                    {log.status}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No medications scheduled for this day.</Text>
                            )}
                        </View>
                    </ScrollView>
                </Surface>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    dateTitle: {
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    ringContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    adherenceLabel: {
        marginTop: 8,
    },
    logsContainer: {
        gap: 16,
    },
    logsTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    logIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    logDetails: {
        flex: 1,
    },
    medName: {
        fontWeight: '600',
    },
    medTime: {},
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 16,
    },
});
