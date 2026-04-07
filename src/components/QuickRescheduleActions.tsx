import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface QuickRescheduleActionsProps {
    onAddMinutes: (minutes: number) => void;
}

export const QuickRescheduleActions: React.FC<QuickRescheduleActionsProps> = ({ onAddMinutes }) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(10)}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.label}
            >
                +10m
            </Button>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(30)}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.label}
            >
                +30m
            </Button>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(60)}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.label}
            >
                +1h
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 8,
        gap: 12,
        marginVertical: 12,
    },
    button: {
        flex: 1,
        borderRadius: 16,
    },
    buttonContent: {
        height: 48,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
    }
});
