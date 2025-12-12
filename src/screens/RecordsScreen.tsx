import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView } from '../components/CalendarView';
import { AdherenceCard } from '../components/AdherenceCard';
import { MedicationListItem } from '../components/MedicationListItem';
import { DayDetailModal } from '../components/DayDetailModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/GempillTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedication } from '../context/MedicationContext';
import { useMonthlyRecords } from '../hooks/useMonthlyRecords';
import { useTheme, Chip } from 'react-native-paper';
import Constants from 'expo-constants';

import { useUser } from '../context/UserContext';
import { Alert } from 'react-native';

type FilterType = 'Active' | 'Frozen' | 'Finished';

export const RecordsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { medications } = useMedication();
    const { resetOnboarding } = useUser();
    const theme = useTheme();

    const [selectedFilter, setSelectedFilter] = React.useState<FilterType>('Active');

    const filteredMedications = React.useMemo(() => {
        return medications.filter(med => {
            if (selectedFilter === 'Active') return med.status === 'Active';
            if (selectedFilter === 'Frozen') return med.status === 'Paused';
            if (selectedFilter === 'Finished') return med.status === 'Stopped';
            return false;
        });
    }, [medications, selectedFilter]);

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

    const handleProfilePress = () => {
        Alert.alert(
            "Reset App",
            "Are you sure you want to reset onboarding and clear local data?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: 'destructive',
                    onPress: async () => {
                        await resetOnboarding();
                        // Navigation will automatically switch due to validation in AppNavigator
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Records</Text>
                        <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
                    </View>
                    <TouchableOpacity onPress={handleProfilePress}>
                        <Ionicons name="person-circle-outline" size={32} color={theme.colors.onSurface} />
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
                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>My Pill Box</Text>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {(['Active', 'Frozen', 'Finished'] as const).map((filter) => {
                            const isSelected = selectedFilter === filter;
                            return (
                                <Chip
                                    key={filter}
                                    selected={isSelected}
                                    onPress={() => setSelectedFilter(filter)}
                                    showSelectedOverlay
                                    style={{ backgroundColor: isSelected ? theme.colors.secondaryContainer : theme.colors.surfaceVariant }}
                                >
                                    {filter}
                                </Chip>
                            );
                        })}
                    </View>
                </ScrollView>

                {filteredMedications.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceVariant }}>
                        No {selectedFilter.toLowerCase()} medications.
                    </Text>
                ) : (
                    filteredMedications.map((med) => (
                        <MedicationListItem
                            key={med.id}
                            name={med.name}
                            details={`${med.dosage} ${med.dosageUnit}, ${med.frequency}`}
                            iconColor={med.color}
                            icon={med.icon}
                            onPress={() => {
                                // Serialize dates to strings to avoid non-serializable warning
                                const serializedMed = {
                                    ...med,
                                    startDate: typeof med.startDate === 'string' ? med.startDate : new Date(med.startDate).toISOString(),
                                    pausedUntil: med.pausedUntil ? (typeof med.pausedUntil === 'string' ? med.pausedUntil : new Date(med.pausedUntil).toISOString()) : undefined
                                };
                                navigation.navigate('MedDetail', { medication: serializedMed as any })
                            }}
                        />
                    ))
                )}

            </ScrollView>

            {/* Add Button FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 24 }]}
                onPress={() => navigation.navigate('AddMedication')}
            >
                <Ionicons name="add" size={24} color={theme.colors.onPrimary} />
                <Text style={[styles.fabText, { color: theme.colors.onPrimary }]}>Add</Text>
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
        marginBottom: 24, // theme.spacing.l
        marginTop: 16,   // theme.spacing.m
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16, // theme.spacing.m
        marginTop: 24,    // theme.spacing.l
    },
    fab: {
        position: 'absolute',
        bottom: 24, // theme.spacing.l
        right: 24,  // theme.spacing.l
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16, // theme.spacing.m
        paddingVertical: 16, // theme.spacing.m
        paddingHorizontal: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
