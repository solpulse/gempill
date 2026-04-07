import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Text as PaperText, useTheme } from 'react-native-paper';
import { addDays, format, isSameDay, startOfToday } from 'date-fns';

interface HorizontalCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({ selectedDate, onSelectDate }) => {
    const theme = useTheme();
    const flatListRef = useRef<FlatList>(null);

    // Generate dates: 30 days past, today, 14 days future
    const dates = useMemo(() => {
        const today = startOfToday();
        return Array.from({ length: 45 }, (_, i) => addDays(today, i - 30));
    }, []);

    const todayIndex = 30;

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: todayIndex,
                animated: false,
                viewPosition: 0.5,
            });
        }
    }, [todayIndex]);

    const renderItem = ({ item }: { item: Date }) => {
        const isSelected = isSameDay(item, selectedDate);
        const isToday = isSameDay(item, startOfToday());
        
        return (
            <TouchableOpacity 
                style={styles.dayContainer} 
                onPress={() => onSelectDate(item)}
                activeOpacity={0.8}
            >
                <PaperText 
                    variant="labelSmall" 
                    style={[
                        styles.dayText, 
                        { 
                            color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                            fontWeight: isSelected ? '700' : '500'
                        }
                    ]}
                >
                    {format(item, 'EEEEEE')}
                </PaperText>
                
                <View style={[
                    styles.dateContainer,
                    isSelected && { backgroundColor: theme.colors.primary }
                ]}>
                    <PaperText 
                        variant="titleMedium" 
                        style={[
                            styles.dateText, 
                            { 
                                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                                fontFamily: Platform.OS === 'ios' ? 'System' : 'serif'
                            }
                        ]}
                    >
                        {format(item, 'd')}
                    </PaperText>
                </View>
                {isToday && !isSelected && (
                    <View style={[styles.todayIndicator, { backgroundColor: theme.colors.primary }]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <PaperText variant="titleMedium" style={[styles.headerText, { color: theme.colors.onSurface, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif' }]}>
                    {format(selectedDate, 'MMMM yyyy')}
                </PaperText>
            </View>
            <FlatList
                ref={flatListRef}
                data={dates}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toISOString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, index) => ({
                    length: 64,
                    offset: 64 * index,
                    index,
                })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    header: {
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    headerText: {
        textAlign: 'left',
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    dayContainer: {
        width: 64,
        alignItems: 'center',
    },
    dayText: {
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontSize: 10,
    },
    dateContainer: {
        width: 44,
        height: 48,
        borderRadius: 16, // Squircle-ish
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
    },
    todayIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 6,
    }
});
