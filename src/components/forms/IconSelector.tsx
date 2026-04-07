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
                    activeOpacity={0.8}
                    style={[
                        styles.iconBox,
                        { backgroundColor: theme.colors.surfaceVariant },
                        selectedIcon === i && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => onSelectIcon(i)}
                >
                    <MedicationIcon
                        name={i}
                        size={22}
                        color={selectedIcon === i ? '#FFFFFF' : theme.colors.primary}
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
        justifyContent: 'flex-start',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
