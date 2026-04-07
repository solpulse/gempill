import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Menu, useTheme, TextInput as PaperTextInput, Text as PaperText, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
            <View style={[styles.inputGroup, { flex: 1.2, marginRight: 12 }]}>
                <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                    Amount <PaperText style={{ color: theme.colors.error }}>*</PaperText>
                </PaperText>
                <PaperTextInput
                    mode="flat"
                    placeholder="10"
                    value={dosage}
                    onChangeText={setDosage}
                    keyboardType="numeric"
                    maxLength={10}
                    error={error}
                    style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                    underlineColor="transparent"
                    activeUnderlineColor={theme.colors.primary}
                    dense
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Unit</PaperText>
                <Menu
                    visible={showUnitMenu}
                    onDismiss={() => setShowUnitMenu(false)}
                    anchor={
                        <Button
                            mode="contained-tonal"
                            onPress={() => setShowUnitMenu(true)}
                            style={styles.dropdownButton}
                            labelStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
                            contentStyle={{ height: 48, flexDirection: 'row-reverse', justifyContent: 'space-between' }}
                            icon={({ size, color }) => (
                                <MaterialCommunityIcons name="chevron-down" size={size} color={theme.colors.primary} />
                            )}
                        >
                            {dosageUnit}
                        </Button>
                    }
                    contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
                >
                    {unitOptions.map((option) => (
                        <Menu.Item
                            key={option}
                            onPress={() => {
                                setDosageUnit(option);
                                setShowUnitMenu(false);
                            }}
                            title={option}
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
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderRadius: 12, // Rounding for Apothecary look
    },
    dropdownButton: {
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
    },
});
