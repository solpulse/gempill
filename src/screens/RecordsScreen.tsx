import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from '../components/CalendarView';
import { AdherenceCard } from '../components/AdherenceCard';
import { MedicationListItem } from '../components/MedicationListItem';
import { DayDetailModal } from '../components/DayDetailModal';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedication } from '../context/MedicationContext';
import { useMonthlyRecords } from '../hooks/useMonthlyRecords';

export const RecordsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { medications } = useMedication(); // Still need medication list for "My Pill Box"

    const {
        currentDate,
        setCurrentDate,
        calendarDays,
        monthlyPercentage,
        monthlyStreak,
        selectedDay,
        isModalVisible,
        handleDayPress,
        dismissModal
    } = useMonthlyRecords();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Records</Text>
                    <TouchableOpacity>
                        <Ionicons name="person-circle-outline" size={32} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Calendar */}
                <CalendarView
                    currentDate={currentDate}
                    onMonthChange={setCurrentDate}
                    days={calendarDays}
                    onDayPress={handleDayPress}
                />

                {/* Adherence Streak */}
                <AdherenceCard streakDays={monthlyStreak} percentage={monthlyPercentage} />

                {/* My Pill Box */}
                <Text style={styles.sectionTitle}>My Pill Box</Text>

                {medications.map((med) => (
                    <MedicationListItem
                        key={med.id}
                        name={med.name}
                        details={`${med.dosage} ${med.dosageUnit}, ${med.frequency}`}
                        iconColor={med.color}
                        icon={med.icon}
                        onPress={() => navigation.navigate('MedDetail', { medId: med.id })}
                    />
                ))}

            </ScrollView>

            {/* Add Button FAB */}
            <TouchableOpacity
                style={[styles.fab, { bottom: 24 }]}
                onPress={() => navigation.navigate('AddMedication')}
            >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.fabText}>Add</Text>
            </TouchableOpacity>

            {/* Day Detail Modal */}
            {selectedDay && (
                <DayDetailModal
                    visible={isModalVisible}
                    onDismiss={dismissModal}
                    date={selectedDay.date}
                    adherence={selectedDay.data.adherence}
                    logs={selectedDay.data.logs}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary, // Use primary color
        borderRadius: 16, // Slightly more squared for extended FAB
        paddingVertical: 16,
        paddingHorizontal: 20,
        ...shadows.medium,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
