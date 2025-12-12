import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MedicationIcon } from '../MedicationIcon';

interface IconSelectorProps {
    selectedIcon: string;
    onSelectIcon: (icon: string) => void;
    options: string[];
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelectIcon, options }) => {
    const theme = useTheme();
    return (
        <View style={styles.iconRow}>
            {options.map((i, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.iconCircle,
                        { backgroundColor: theme.colors.surfaceVariant },
                        selectedIcon === i && { backgroundColor: theme.colors.tertiaryContainer }
                    ]}
                    onPress={() => onSelectIcon(i)}
                >
                    <MedicationIcon
                        name={i}
                        size={24}
                        color={selectedIcon === i ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    iconRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
