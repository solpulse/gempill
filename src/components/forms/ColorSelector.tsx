import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ColorSelectorProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
    options: string[];
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onSelectColor, options }) => {
    return (
        <View style={styles.colorRow}>
            {options.map((c, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        selectedColor === c && styles.selectedColor
                    ]}
                    onPress={() => onSelectColor(c)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: colors.text,
    },
    addColorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
