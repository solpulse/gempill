import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface QuickRescheduleActionsProps {
    onAddMinutes: (minutes: number) => void;
}

export const QuickRescheduleActions: React.FC<QuickRescheduleActionsProps> = ({ onAddMinutes }) => {
    return (
        <View style={styles.container}>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(10)}
                style={styles.button}
                compact
            >
                +10m
            </Button>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(30)}
                style={styles.button}
                compact
            >
                +30m
            </Button>
            <Button
                mode="contained-tonal"
                onPress={() => onAddMinutes(60)}
                style={styles.button}
                compact
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
        gap: 8,
        marginVertical: 16,
    },
    button: {
        flex: 1,
    }
});
