import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { TimePickerModal } from 'react-native-paper-dates';
import { useUser } from '../context/UserContext';
import { useTheme, Text as PaperText, TextInput as PaperTextInput, Button } from 'react-native-paper';
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
        const success = await originalHandleSave();
        if (success && isOnboarding) {
            await completeOnboarding();
        }
    };

    const colorOptions = [
        '#A5D6A7', '#F48FB1', '#FFF59D', '#90CAF9', '#CE93D8', '#FFCC80', '#B0BEC5',
    ];

    const iconOptions = ['medical-bag', 'pill', 'custom-tablet', 'bottle-tonic-plus', 'bandage', 'nutrition'];
    const unitOptions = ['mg', 'ml', 'IU', 'mcg', 'g', 'tablets', 'capsules', 'pills', 'drops', 'puffs'];

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Apothecary Header - Clean & Minimalist */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <PaperText variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                        {isEditing ? 'Edit Entry' : 'Personal Prescription'}
                    </PaperText>
                    <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
                        <PaperText variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '700' }}>DONE</PaperText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* Identification Section */}
                    <View style={styles.inputGroup}>
                        <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                            Medication or Supplement <PaperText style={{ color: theme.colors.error }}>*</PaperText>
                        </PaperText>
                        <PaperTextInput
                            mode="flat"
                            placeholder="e.g., Lisinopril"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            value={name}
                            onChangeText={setName}
                            maxLength={100}
                            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                            error={!!errors.name}
                            underlineColor="transparent"
                            activeUnderlineColor={theme.colors.primary}
                        />
                        {errors.name && (
                            <PaperText variant="labelSmall" style={{ color: theme.colors.error, marginTop: 4, marginLeft: 4 }}>
                                Identification is required
                            </PaperText>
                        )}
                    </View>

                    {/* Dosage Component - Handled In-Screen for better control */}
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
                        <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Schedule</PaperText>
                        <TimeScheduleInput
                            times={times}
                            onOpenPicker={openTimePicker}
                            onAddSlot={addTimeSlot}
                            onRemoveSlot={removeTimeSlot}
                            formatTime={formatTime}
                            error={errors.times}
                        />
                    </View>

                    {/* Aesthetics - Grouped Selection */}
                    <View style={[styles.inputGroup, { marginTop: 8 }]}>
                        <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Identity Label</PaperText>
                        <ColorSelector
                            selectedColor={color}
                            onSelectColor={setColor}
                            options={colorOptions}
                        />
                        <View style={{ height: 24 }} />
                        <PaperText variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Iconography</PaperText>
                        <IconSelector
                            selectedIcon={icon}
                            onSelectIcon={setIcon}
                            options={iconOptions}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Floating Action Container - Replaces rigid footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <Button 
                    mode="contained" 
                    onPress={handleSave} 
                    style={styles.saveButton} 
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 16, fontWeight: '700' }}
                >
                    {isEditing ? 'Update Prescription' : 'Archive Entry'}
                </Button>
            </View>

            <TimePickerModal
                visible={showTimePicker}
                onDismiss={onDismissTimePicker}
                onConfirm={onConfirmTimePicker}
                hours={activeTimeIndex !== null && times[activeTimeIndex] ? times[activeTimeIndex].time.getHours() : 12}
                minutes={activeTimeIndex !== null && times[activeTimeIndex] ? times[activeTimeIndex].time.getMinutes() : 0}
                use24HourClock={is24Hour === true}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'normal',
    },
    saveHeaderButton: {
        paddingHorizontal: 8,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 120,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        borderRadius: 12,
        height: 56,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    saveButton: {
        borderRadius: 16,
    },
});
