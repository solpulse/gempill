/**
 * Parses a time string into total minutes from midnight.
 * Supports "HH:mm" (24h) and "hh:mm A" (12h) formats.
 * @param timeStr e.g. "14:30", "02:30 PM", "11:40 PM"
 * @returns Minutes from midnight (0-1439), or NaN if invalid.
 */
export const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return NaN;

    const cleanStr = timeStr.trim().toUpperCase();
    const isPm = cleanStr.includes('PM');
    const isAm = cleanStr.includes('AM');

    // Aggressive parsing: strict digits for time parts
    // "11:40 PM" -> matches 11, 40
    const match = cleanStr.match(/(\d{1,2})[\s\S]*:[\s\S]*(\d{2})/);

    if (!match) return NaN;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (isNaN(hours) || isNaN(minutes)) return NaN;

    // Adjust for 12h format
    if (isPm && hours < 12) {
        hours += 12;
    }
    if (isAm && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
};

/**
 * Adds minutes to a time string and returns the new time string.
 * Preserves the format (12h vs 24h) of the input if possible, 
 * but for this app's consistency, we might prefer normalizing to 24h or 12h.
 * Given the user's data seems to be 12h "11:40 PM", we should probably return 12h format 
 * if the input was 12h, or just standardized 24h.
 * 
 * Strategy: Return 24h "HH:mm" for consistency in logic, 
 * but if we need to display valid times, we can format later.
 * For now, let's normalize to "HH:mm" (24h) which is less ambiguous for the system.
 */
export const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
    let totalMinutes = parseTimeToMinutes(timeStr);
    if (isNaN(totalMinutes)) return timeStr; // Fallback

    totalMinutes += minutesToAdd;

    // Handle day rollover
    while (totalMinutes >= 1440) totalMinutes -= 1440;
    while (totalMinutes < 0) totalMinutes += 1440;

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

import * as Localization from 'expo-localization';

/**
 * Checks if the system uses 24-hour format.
 */
export const isSystem24Hour = (): boolean => {
    const calendars = Localization.getCalendars();
    return calendars && calendars.length > 0 ? (calendars[0].uses24hourClock ?? false) : false;
};

/**
 * Formats a "HH:mm" (24h) string into a system-locale aware display string.
 * @param timeStr "HH:mm"
 */
export const formatTimeForDisplay = (timeStr: string): string => {
    const minutes = parseTimeToMinutes(timeStr);
    if (isNaN(minutes)) return timeStr;

    const date = new Date();
    date.setHours(Math.floor(minutes / 60));
    date.setMinutes(minutes % 60);

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !isSystem24Hour()
    });
};

/**
 * Checks if a scheduled time is "past due" compared to "now".
 */
export const isTimePastDue = (scheduledTimeStr: string, now: Date = new Date()): boolean => {
    const scheduledMinutes = parseTimeToMinutes(scheduledTimeStr);
    if (isNaN(scheduledMinutes)) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Simple comparison for same day.
    // DOES NOT handle wrap around (e.g. scheduled 23:00, now 01:00 next day)
    // But for "Daily Schedule" logic, we usually reset.
    // But for "Daily Schedule" logic, we usually reset.
    return scheduledMinutes <= currentMinutes;
};

/**
 * Returns a time-dependent greeting based on the current hour.
 */
export const getTimeOfDayGreeting = (date: Date = new Date()): string => {
    const hours = date.getHours();

    if (hours >= 5 && hours < 12) {
        return 'Good Morning';
    } else if (hours >= 12 && hours < 17) {
        return 'Good Afternoon';
    } else if (hours >= 17 && hours < 21) {
        return 'Good Evening';
    } else {
        return 'Good Night';
    }
};
