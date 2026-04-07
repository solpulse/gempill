import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme, Button, Text as PaperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
                    <Button
                        mode="contained-tonal"
                        onPress={() => onOpenPicker(index)}
                        style={[styles.timeButton, { 
                            backgroundColor: theme.colors.surfaceVariant,
                            borderColor: error ? theme.colors.error : 'transparent',
                            borderWidth: error ? 1 : 0
                        }]}
                        contentStyle={styles.timeButtonContent}
                        labelStyle={{ color: theme.colors.onSurface, fontSize: 16 }}
                        icon={() => <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />}
                    >
                        {formatTime(item.time)}
                    </Button>
                    
                    {times.length > 1 && (
                        <Button
                            mode="text"
                            onPress={() => onRemoveSlot(index)}
                            style={styles.deleteButton}
                            textColor={theme.colors.error}
                            icon={() => <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.colors.error} />}
                        >
                            {/* Empty label for icon-only feel but functional button */}
                            {''}
                        </Button>
                    )}
                </View>
            ))}

            <Button
                mode="text"
                onPress={onAddSlot}
                style={styles.addTimeButton}
                icon="plus"
                labelStyle={[styles.addTimeText, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' }]}
            >
                Add another time
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeButton: {
        flex: 1,
        borderRadius: 12,
        marginRight: 8,
    },
    timeButtonContent: {
        height: 52,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    deleteButton: {
        minWidth: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTimeButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
        marginLeft: -8, // Align label with start of list
    },
    addTimeText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
