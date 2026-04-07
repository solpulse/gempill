import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ColorSelectorProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
    options: string[];
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onSelectColor, options }) => {
    const theme = useTheme();
    return (
        <View style={styles.colorRow}>
            {options.map((c, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={[
                        styles.colorBox,
                        { backgroundColor: c },
                        selectedColor === c && [styles.selectedColor, { borderColor: theme.colors.primary }]
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
        gap: 12,
        width: '100%',
    },
    colorBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
    },
    selectedColor: {
        borderWidth: 3,
    },
});
