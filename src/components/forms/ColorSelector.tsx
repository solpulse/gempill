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
                    style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        selectedColor === c && [styles.selectedColor, { borderColor: theme.colors.onSurface }]
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
    },
    addColorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
