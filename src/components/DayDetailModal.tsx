import React from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, IconButton, Button, Surface, useTheme } from 'react-native-paper';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors'; // Fallback if theme not fully set up
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
    const progressColor = percentage === 100 ? colors.success : colors.primary;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDismiss}
        >
            <View style={styles.modalOverlay}>
                <Surface style={styles.modalContent} elevation={4}>
                    {/* Header */}
                    <View style={styles.header}>
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
                                    stroke={colors.surfaceVariant}
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
                                    fill={colors.text}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {`${percentage}%`}
                                </SvgText>
                            </Svg>
                            <Text variant="labelLarge" style={styles.adherenceLabel}>Daily Adherence</Text>
                        </View>

                        {/* Logs List */}
                        <View style={styles.logsContainer}>
                            <Text variant="titleMedium" style={styles.logsTitle}>Medication Log</Text>
                            {logs.length > 0 ? (
                                logs.map((log, index) => {
                                    // Determine styles based on status, matching PillEntry
                                    let badgeBg = colors.surfaceVariant;
                                    let badgeText = colors.textSecondary;

                                    if (log.status === 'Taken') {
                                        badgeBg = colors.successLight;
                                        badgeText = '#004D40'; // Dark green from PillEntry
                                    } else if (log.status === 'Missed' || log.status === 'Skipped') {
                                        badgeBg = colors.errorLight;
                                        badgeText = colors.error;
                                    }

                                    return (
                                        <View key={index} style={styles.logItem}>
                                            <View style={[styles.logIcon, { backgroundColor: log.color }]}>
                                                {/* Placeholder for icon */}
                                            </View>
                                            <View style={styles.logDetails}>
                                                <Text variant="bodyLarge" style={styles.medName}>{log.medName}</Text>
                                                <Text variant="bodySmall" style={styles.medTime}>{log.time}</Text>
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
                                <Text variant="bodyMedium" style={styles.emptyText}>No medications scheduled for this day.</Text>
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
        backgroundColor: colors.background,
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
        borderBottomColor: colors.surfaceVariant,
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
        color: colors.textSecondary,
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
        backgroundColor: colors.surface,
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
    medTime: {
        color: colors.textSecondary,
    },
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
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 16,
    },
});
