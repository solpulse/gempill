import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { TimePickerModal } from 'react-native-paper-dates';
import { useUser } from '../context/UserContext';
import { useTheme } from 'react-native-paper';
import { useMedicationForm } from '../hooks/useMedicationForm';

// Decomposed Components
import { ColorSelector } from '../components/forms/ColorSelector';
import { IconSelector } from '../components/forms/IconSelector';
import { TimeScheduleInput } from '../components/forms/TimeScheduleInput';
import { DosageInput } from '../components/forms/DosageInput';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

export const AddMedicationScreen: React.FC<Props> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { isOnboarding } = route.params || {};
    const theme = useTheme();
    const { completeOnboarding } = useUser();

    const {
        name, setName,
        dosage, setDosage,
        dosageUnit, setDosageUnit,
        times, formatTime, addTimeSlot, removeTimeSlot,
        color, setColor,
        icon, setIcon,
        isEditing, is24Hour,
        showUnitMenu, setShowUnitMenu,
        showTimePicker, activeTimeIndex,
        openTimePicker, onDismissTimePicker, onConfirmTimePicker,
        handleSave: originalHandleSave,
        errors
    } = useMedicationForm(navigation, route);

    const handleSave = async () => {
        // Call the original save logic from the hook
        const success = await originalHandleSave();

        if (success && isOnboarding) {
            await completeOnboarding();
            // AppNavigator will see the state change and switch stacks automatically?
            // Usually yes, if we are using conditional rendering. 
            // If not, we might need manual navigation. 
            // But 'completeOnboarding' changes 'hasCompletedOnboarding' which AppNavigator should listen to.
        }
    };

    const colorOptions = [
        '#A5D6A7', // labelGreen
        '#F48FB1', // labelPink
        '#FFF59D', // labelYellow
        '#90CAF9', // labelBlue
        '#CE93D8', // labelPurple
        '#FFCC80', // labelOrange
        '#B0BEC5', // labelGrey
    ];

    const iconOptions = ['medical-bag', 'pill', 'custom-tablet', 'bottle-tonic-plus', 'bandage', 'nutrition'];
    const unitOptions = ['mg', 'ml', 'IU', 'mcg', 'g', 'tablets', 'capsules', 'pills', 'drops', 'puffs'];

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant, backgroundColor: theme.colors.background }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>{isEditing ? 'Edit Medication' : 'Add Medication'}</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>{isEditing ? 'Save' : 'Add'}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                    {/* Medication Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Medication Name/Supplement</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.surface,
                                borderColor: errors.name ? theme.colors.error : theme.colors.outline,
                                borderWidth: errors.name ? 2 : 1,
                                color: theme.colors.onSurface
                            }]}
                            placeholder="e.g., Lisinopril"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Dosage Component */}
                    <DosageInput
                        dosage={dosage}
                        setDosage={setDosage}
                        dosageUnit={dosageUnit}
                        setDosageUnit={setDosageUnit}
                        showUnitMenu={showUnitMenu}
                        setShowUnitMenu={setShowUnitMenu}
                        unitOptions={unitOptions}
                        error={errors.dosage}
                    />

                    {/* Intake Time Component */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Intake Time</Text>
                        <TimeScheduleInput
                            times={times}
                            onOpenPicker={openTimePicker}
                            onAddSlot={addTimeSlot}
                            onRemoveSlot={removeTimeSlot}
                            formatTime={formatTime}
                            error={errors.times}
                        />
                    </View>

                    {/* Color Label Component */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Color Label</Text>
                        <ColorSelector
                            selectedColor={color}
                            onSelectColor={setColor}
                            options={colorOptions}
                        />
                    </View>

                    {/* Medication Icon Component */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Medication Icon</Text>
                        <IconSelector
                            selectedIcon={icon}
                            onSelectIcon={setIcon}
                            options={iconOptions}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Footer Actions */}
            <View style={[styles.footer, {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outlineVariant,
                paddingBottom: Math.max(insets.bottom, 20)
            }]}>
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]} onPress={() => navigation.goBack()}>
                    <Text style={[styles.cancelButtonText, { color: theme.colors.onSurfaceVariant }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSave}>
                    <Text style={[styles.footerSaveButtonText, { color: theme.colors.onPrimary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Material Design 3 Time Picker Modal */}
            <TimePickerModal
                visible={showTimePicker}
                onDismiss={onDismissTimePicker}
                onConfirm={onConfirmTimePicker}
                hours={activeTimeIndex !== null && times[activeTimeIndex] ? times[activeTimeIndex].time.getHours() : 12}
                minutes={activeTimeIndex !== null && times[activeTimeIndex] ? times[activeTimeIndex].time.getMinutes() : 0}
                use24HourClock={is24Hour === true} // strictly boolean
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    inputGroup: {
        marginBottom: 24,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 30, // Pill shape
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16, // Taller button
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderRadius: 30, // Pill shape
    },
    footerSaveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
