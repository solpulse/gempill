import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { colors } from '../../theme/colors';

interface DosageInputProps {
    dosage: string;
    setDosage: (text: string) => void;
    dosageUnit: string;
    setDosageUnit: (unit: string) => void;
    showUnitMenu: boolean;
    setShowUnitMenu: (visible: boolean) => void;
    unitOptions: string[];
}

export const DosageInput: React.FC<DosageInputProps> = ({
    dosage,
    setDosage,
    dosageUnit,
    setDosageUnit,
    showUnitMenu,
    setShowUnitMenu,
    unitOptions
}) => {
    return (
        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
                <Text style={styles.label}>Dosage Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor={colors.textSecondary}
                    value={dosage}
                    onChangeText={setDosage}
                    keyboardType="numeric"
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Dosage Unit</Text>
                <Menu
                    visible={showUnitMenu}
                    onDismiss={() => setShowUnitMenu(false)}
                    anchor={
                        <TouchableOpacity
                            style={styles.dropdownInput}
                            onPress={() => setShowUnitMenu(true)}
                        >
                            <Text style={styles.inputText}>{dosageUnit}</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    }
                    contentStyle={{ backgroundColor: colors.surface }}
                >
                    {unitOptions.map((option) => (
                        <Menu.Item
                            key={option}
                            onPress={() => {
                                setDosageUnit(option);
                                setShowUnitMenu(false);
                            }}
                            title={option}
                            titleStyle={{ color: colors.text }}
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
        color: colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: colors.text,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    inputText: {
        fontSize: 16,
        color: colors.text,
    },
});
