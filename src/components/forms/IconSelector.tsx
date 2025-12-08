import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { MedicationIcon } from '../MedicationIcon';

interface IconSelectorProps {
    selectedIcon: string;
    onSelectIcon: (icon: string) => void;
    options: string[];
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelectIcon, options }) => {
    return (
        <View style={styles.iconRow}>
            {options.map((i, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.iconCircle,
                        selectedIcon === i && { backgroundColor: colors.successLight }
                    ]}
                    onPress={() => onSelectIcon(i)}
                >
                    <MedicationIcon
                        name={i}
                        size={24}
                        color={selectedIcon === i ? colors.success : colors.textSecondary}
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
        backgroundColor: colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
