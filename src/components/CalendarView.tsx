import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { DayData } from '../utils/mockData';

interface CalendarViewProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    days: DayData[];
    onDayPress: (date: Date, data: DayData | undefined) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onMonthChange, days, onDayPress }) => {
    const theme = useTheme();
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handlePrevMonth = () => onMonthChange(subMonths(currentDate, 1));
    const handleNextMonth = () => onMonthChange(addMonths(currentDate, 1));

    const getDayData = (date: Date) => days.find(d => isSameDay(d.date, date));

    const renderDay = (date: Date, index: number) => {
        const isCurrentMonth = isSameMonth(date, monthStart);
        const isToday = isSameDay(date, new Date());
        const dayData = getDayData(date);
        const adherence = dayData?.adherence || 0;
        const hasData = !!dayData && dayData.status !== 'none';

        // Progress Ring Config
        const size = 40;
        const strokeWidth = 3;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const progress = adherence * circumference;

        // Colors
        const textColor = isToday ? theme.colors.primary : (isCurrentMonth ? theme.colors.onSurface : theme.colors.onSurfaceVariant);
        const ringColor = adherence === 1 ? theme.colors.tertiary : theme.colors.primary;
        // If 100% adherence, track should be same as fill (success) to avoid grey border.
        // Otherwise use surfaceVariant for the track.
        const trackColor = adherence === 1 ? theme.colors.tertiary : theme.colors.surfaceVariant;

        return (
            <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dayCell, !isCurrentMonth && styles.dimmedCell]}
                onPress={() => onDayPress(date, dayData)}
                disabled={!isCurrentMonth}
            >
                <View style={styles.dayContent}>
                    {hasData ? (
                        <Svg width={size} height={size}>
                            {/* Background Ring / Track */}
                            <Circle
                                stroke={trackColor}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                                fill={adherence === 1 ? theme.colors.tertiary : 'transparent'}
                            />
                            {/* Progress Ring */}
                            {adherence < 1 && adherence > 0 && (
                                <Circle
                                    stroke={ringColor}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - progress}
                                    strokeLinecap="round"
                                    rotation="-90"
                                    origin={`${size / 2}, ${size / 2}`}
                                    fill="none"
                                />
                            )}
                            {/* Date Text */}
                            <SvgText
                                x={size / 2}
                                y={size / 2}
                                fontSize="14"
                                fontWeight={isToday ? "bold" : "normal"}
                                fill={adherence === 1 ? theme.colors.onTertiary : textColor}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                dy="1" // Optical adjustment
                            >
                                {format(date, 'd')}
                            </SvgText>
                        </Svg>
                    ) : (
                        <View style={[styles.dayCircle, isToday && { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text style={[styles.dayText, { color: textColor, fontWeight: isToday ? 'bold' : 'normal' }]}>
                                {format(date, 'd')}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton icon="chevron-left" onPress={handlePrevMonth} />
                <Text variant="titleLarge" style={[styles.monthTitle, { color: theme.colors.onSurface }]}>
                    {format(currentDate, 'MMMM yyyy')}
                </Text>
                <IconButton icon="chevron-right" onPress={handleNextMonth} />
            </View>

            {/* Week Days */}
            <View style={styles.weekRow}>
                {weekDays.map((day, index) => (
                    <Text key={index} style={[styles.weekDayText, { color: theme.colors.onSurfaceVariant }]} variant="labelMedium">{day}</Text>
                ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
                {calendarDays.map(renderDay)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthTitle: {
        fontWeight: 'bold',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    weekDayText: {
        width: 40,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dimmedCell: {
        opacity: 0.3,
    },
    dayContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 14,
    },
});
