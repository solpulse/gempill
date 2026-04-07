import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { ScheduledTime } from '../../types/GempillTypes';

interface TimeScheduleInputProps {
    times: ScheduledTime[];
    onOpenPicker: (index: number) => void;
    onAddSlot: () => void;
    onRemoveSlot: (index: number) => void;
    formatTime: (date: Date) => string;
    error?: boolean;
}

export const TimeScheduleInput: React.FC<TimeScheduleInputProps> = ({
    times,
    onOpenPicker,
    onAddSlot,
    onRemoveSlot,
    formatTime,
    error
}) => {
    const theme = useTheme();

    return (
        <View>
            {times.map((item, index) => (
                <View key={index} style={styles.timeRow}>
                    <TouchableOpacity
                        style={[styles.timeInput, {
                            backgroundColor: theme.colors.surface,
                            borderColor: error ? theme.colors.error : theme.colors.outline,
                            borderWidth: error ? 2 : 1
                        }]}
                        onPress={() => onOpenPicker(index)}
                    >
                        <Text style={[styles.inputText, { color: theme.colors.onSurface }]}>{formatTime(item.time)}</Text>
                        <Ionicons name="time-outline" size={20} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    {times.length > 1 && (
                        <TouchableOpacity
                            style={[styles.deleteButton, { backgroundColor: theme.colors.errorContainer }]}
                            onPress={() => onRemoveSlot(index)}
                            accessibilityRole="button"
                            accessibilityLabel="Delete time slot"
                        >
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            <TouchableOpacity style={styles.addTimeButton} onPress={onAddSlot}>
                <Ionicons name="add" size={20} color={theme.colors.tertiary || theme.colors.primary} />
                <Text style={[styles.addTimeText, { color: theme.colors.tertiary || theme.colors.primary }]}>Add another time</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeInput: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 12,
    },
    inputText: {
        fontSize: 16,
    },
    deleteButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    addTimeText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
