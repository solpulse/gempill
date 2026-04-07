import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
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
import { useTheme, Chip, FAB, Portal, Dialog, Button, Text as PaperText } from 'react-native-paper';
import Constants from 'expo-constants';

import { Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import { usePermission } from '../context/PermissionContext';

type FilterType = 'Active' | 'Paused' | 'Finished' | 'Cancelled';

export const RecordsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { medications } = useMedication();
    const { resetOnboarding } = useUser();
    const theme = useTheme();

    const [selectedFilter, setSelectedFilter] = React.useState<FilterType>('Active');
    const [isProfileDialogVisible, setIsProfileDialogVisible] = React.useState(false);
    const [isResetConfirmVisible, setIsResetConfirmVisible] = React.useState(false);

    const filteredMedications = React.useMemo(() => {
        return medications.filter(med => {
            if (selectedFilter === 'Active') return med.status === 'Active';
            if (selectedFilter === 'Paused') return med.status === 'Paused';
            if (selectedFilter === 'Finished') return med.status === 'Finished';
            if (selectedFilter === 'Cancelled') return med.status === 'Cancelled' || (med.status as any) === 'Stopped'; // fallback for old data
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

    const { checkPermissions } = usePermission();

    const showProfileDialog = () => setIsProfileDialogVisible(true);
    const hideProfileDialog = () => setIsProfileDialogVisible(false);

    const showResetConfirm = () => {
        hideProfileDialog();
        setIsResetConfirmVisible(true);
    };
    const hideResetConfirm = () => setIsResetConfirmVisible(false);

    const handleReset = async () => {
        hideResetConfirm();
        await resetOnboarding();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}>
                {/* Apothecary Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleContainer}>
                        <PaperText variant="displaySmall" style={[styles.headerTitle, { color: theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                            Apothecary Records
                        </PaperText>
                        <View style={styles.curatorRule} />
                    </View>
                    <TouchableOpacity onPress={showProfileDialog} style={[styles.profileButton, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Ionicons name="finger-print-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Calendar Record - Intentional Floating */}
                <CalendarView
                    currentDate={currentDate}
                    onMonthChange={setCurrentDate}
                    days={calendarDays}
                    onDayPress={handleDayPress}
                />

                {/* Calibration Streak */}
                <View style={{ marginTop: 24 }}>
                    <AdherenceCard streakDays={monthlyStreak} percentage={monthlyPercentage} />
                </View>

                {/* Management Section */}
                <PaperText variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                    Management Box
                </PaperText>

                {/* Refined Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {(['Active', 'Paused', 'Finished', 'Cancelled'] as const).map((filter) => {
                            const isSelected = selectedFilter === filter;
                            return (
                                <Chip
                                    key={filter}
                                    selected={isSelected}
                                    onPress={() => setSelectedFilter(filter)}
                                    showSelectedOverlay={false}
                                    style={[
                                        styles.filterChip, 
                                        { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant }
                                    ]}
                                    textStyle={{ color: isSelected ? '#FFFFFF' : theme.colors.onSurfaceVariant, fontSize: 13, fontWeight: isSelected ? '700' : '500' }}
                                >
                                    {filter}
                                </Chip>
                            );
                        })}
                    </View>
                </ScrollView>

                {filteredMedications.length === 0 ? (
                    <View style={styles.emptyListContainer}>
                        <PaperText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', textAlign: 'center' }}>
                            Your {selectedFilter.toLowerCase()} archives are currently empty.
                        </PaperText>
                    </View>
                ) : (
                    filteredMedications.map((med) => (
                        <MedicationListItem
                            key={med.id}
                            name={med.name}
                            details={`${med.dosage} ${med.dosageUnit} • ${med.frequency}`}
                            iconColor={med.color}
                            icon={med.icon}
                            onPress={() => {
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

            {/* Apothecary FAB - Replaced custom FAB with MD3 Paper FAB */}
            <FAB
                icon="plus"
                label="Prescription"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#FFFFFF"
                onPress={() => navigation.navigate('AddMedication', {})}
                variant="primary"
            />

            {/* Overlays - Portalized and Themed */}
            <Portal>
                {/* Day Detail - Logic Reserved */}
                {selectedDay && (
                    <DayDetailModal
                        visible={isModalVisible}
                        onDismiss={dismissModal}
                        date={selectedDay.date}
                        adherence={selectedDay.data.adherence}
                        logs={selectedDay.data.logs}
                    />
                )}

                {/* Profile & System Reliability Dialog */}
                <Dialog visible={isProfileDialogVisible} onDismiss={hideProfileDialog} style={styles.dialog}>
                    <Dialog.Title style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }}>System Reliability</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium">Select an action to manage your apothecary state or verify background delivery permissions.</PaperText>
                    </Dialog.Content>
                    <Dialog.Actions style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                        <Button mode="contained-tonal" onPress={async () => { hideProfileDialog(); await checkPermissions(); }} style={styles.dialogButton}>Verify Permissions</Button>
                        <Button mode="text" onPress={showResetConfirm} textColor={theme.colors.error} style={styles.dialogButton}>Reset Onboarding</Button>
                        <Button mode="text" onPress={hideProfileDialog} style={styles.dialogButton}>Dismiss</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Reset Confirmation Dialog */}
                <Dialog visible={isResetConfirmVisible} onDismiss={hideResetConfirm} style={styles.dialog}>
                    <Dialog.Title style={{ color: theme.colors.error, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }}>Confirm Reset</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium">This will clear your profile and return to onboarding. Your recorded medications will remain in storage.</PaperText>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideResetConfirm}>Cancel</Button>
                        <Button mode="contained" onPress={handleReset} buttonColor={theme.colors.error}>Confirm Reset</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
        paddingHorizontal: 24, // Wider margins
        paddingTop: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    headerTitleContainer: {
        flex: 1,
        paddingRight: 20,
    },
    headerTitle: {
        fontWeight: 'normal',
        lineHeight: 36,
    },
    curatorRule: {
        width: 40,
        height: 2,
        backgroundColor: '#324E58',
        marginTop: 8,
        opacity: 0.1,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        marginBottom: 24,
        marginTop: 40,
    },
    filterChip: {
        borderRadius: 12,
        borderWidth: 0,
    },
    emptyListContainer: {
        padding: 40,
        backgroundColor: '#F5F3F0',
        borderRadius: 24,
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        borderRadius: 20,
    },
    dialog: {
        borderRadius: 32,
        backgroundColor: '#FBF9F6',
    },
    dialogButton: {
        borderRadius: 12,
    },
});
