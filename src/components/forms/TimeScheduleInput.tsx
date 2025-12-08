import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ScheduledTime } from '../../types/GempillTypes';

interface TimeScheduleInputProps {
    times: ScheduledTime[];
    onOpenPicker: (index: number) => void;
    onAddSlot: () => void;
    onRemoveSlot: (index: number) => void;
    formatTime: (date: Date) => string;
}

export const TimeScheduleInput: React.FC<TimeScheduleInputProps> = ({
    times,
    onOpenPicker,
    onAddSlot,
    onRemoveSlot,
    formatTime
}) => {
    return (
        <View>
            {times.map((item, index) => (
                <View key={index} style={styles.timeRow}>
                    <TouchableOpacity
                        style={styles.timeInput}
                        onPress={() => onOpenPicker(index)}
                    >
                        <Text style={styles.inputText}>{formatTime(item.time)}</Text>
                        <Ionicons name="time-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                    {times.length > 1 && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => onRemoveSlot(index)}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            <TouchableOpacity style={styles.addTimeButton} onPress={onAddSlot}>
                <Ionicons name="add" size={20} color={colors.success} />
                <Text style={styles.addTimeText}>Add another time</Text>
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginRight: 12,
    },
    inputText: {
        fontSize: 16,
        color: colors.text,
    },
    deleteButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    addTimeText: {
        fontSize: 16,
        color: colors.success,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
