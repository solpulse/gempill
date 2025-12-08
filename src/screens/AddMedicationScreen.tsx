import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { TimePickerModal } from 'react-native-paper-dates';
import { useMedicationForm } from '../hooks/useMedicationForm';

// Decomposed Components
import { ColorSelector } from '../components/forms/ColorSelector';
import { IconSelector } from '../components/forms/IconSelector';
import { TimeScheduleInput } from '../components/forms/TimeScheduleInput';
import { DosageInput } from '../components/forms/DosageInput';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMedication'>;

export const AddMedicationScreen: React.FC<Props> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();

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
        handleSave
    } = useMedicationForm(navigation, route);

    const colorOptions = [
        colors.labelGreen,
        colors.labelPink,
        colors.labelYellow,
        colors.labelBlue,
        colors.labelPurple,
        colors.labelOrange,
        colors.labelGrey,
    ];

    const iconOptions = ['medical-bag', 'pill', 'custom-tablet', 'bottle-tonic-plus', 'bandage', 'nutrition'];
    const unitOptions = ['mg', 'ml', 'IU', 'mcg', 'g', 'tablets', 'capsules', 'pills', 'drops', 'puffs'];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Medication' : 'Add Medication'}</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.saveButtonText}>{isEditing ? 'Save' : 'Add'}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                    {/* Medication Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Medication Name/Supplement</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Lisinopril"
                            placeholderTextColor={colors.textSecondary}
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
                    />

                    {/* Intake Time Component */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Intake Time</Text>
                        <TimeScheduleInput
                            times={times}
                            onOpenPicker={openTimePicker}
                            onAddSlot={addTimeSlot}
                            onRemoveSlot={removeTimeSlot}
                            formatTime={formatTime}
                        />
                    </View>

                    {/* Color Label Component */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Color Label</Text>
                        <ColorSelector
                            selectedColor={color}
                            onSelectColor={setColor}
                            options={colorOptions}
                        />
                    </View>

                    {/* Medication Icon Component */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Medication Icon</Text>
                        <IconSelector
                            selectedIcon={icon}
                            onSelectIcon={setIcon}
                            options={iconOptions}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Footer Actions */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.footerSaveButtonText}>Save</Text>
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
        borderBottomColor: '#F0F0F0',
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 30, // Pill shape
        backgroundColor: '#F5F5F5',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16, // Taller button
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderRadius: 30, // Pill shape
        backgroundColor: colors.primary,
    },
    footerSaveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.surface,
    },
});
