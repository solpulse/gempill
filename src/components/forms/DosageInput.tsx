import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, useTheme } from 'react-native-paper';

interface DosageInputProps {
    dosage: string;
    setDosage: (text: string) => void;
    dosageUnit: string;
    setDosageUnit: (unit: string) => void;
    showUnitMenu: boolean;
    setShowUnitMenu: (visible: boolean) => void;
    unitOptions: string[];
    error?: boolean;
}

export const DosageInput: React.FC<DosageInputProps> = ({
    dosage,
    setDosage,
    dosageUnit,
    setDosageUnit,
    showUnitMenu,
    setShowUnitMenu,
    unitOptions,
    error
}) => {
    const theme = useTheme();

    return (
        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Dosage Amount</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: theme.colors.surface,
                        borderColor: error ? theme.colors.error : theme.colors.outline,
                        borderWidth: error ? 2 : 1,
                        color: theme.colors.onSurface
                    }]}
                    placeholder="10"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    value={dosage}
                    onChangeText={setDosage}
                    keyboardType="numeric"
                    maxLength={10}
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Dosage Unit</Text>
                <Menu
                    visible={showUnitMenu}
                    onDismiss={() => setShowUnitMenu(false)}
                    anchor={
                        <TouchableOpacity
                            style={[styles.dropdownInput, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.outline
                            }]}
                            onPress={() => setShowUnitMenu(true)}
                        >
                            <Text style={[styles.inputText, { color: theme.colors.onSurface }]}>{dosageUnit}</Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    }
                    contentStyle={{ backgroundColor: theme.colors.surface }}
                >
                    {unitOptions.map((option) => (
                        <Menu.Item
                            key={option}
                            onPress={() => {
                                setDosageUnit(option);
                                setShowUnitMenu(false);
                            }}
                            title={option}
                            titleStyle={{ color: theme.colors.onSurface }}
                        />
                    ))}
                </Menu>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    inputText: {
        fontSize: 16,
    },
});
