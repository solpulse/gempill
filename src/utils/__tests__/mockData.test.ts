import { generateMockHistory } from '../mockData';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

describe('generateMockHistory', () => {
    it('should generate an array of DayData for the entire month of the given date', () => {
        // Use a fixed date to ensure predictable testing
        // For example, February 2024 (a leap year)
        const testDate = new Date(2024, 1, 15); // Month is 0-indexed, so 1 is February

        const history = generateMockHistory(testDate);

        // February 2024 has 29 days
        expect(history).toHaveLength(29);

        const start = startOfMonth(testDate);
        const end = endOfMonth(testDate);
        const expectedDays = eachDayOfInterval({ start, end });

        expectedDays.forEach((expectedDay, index) => {
            const dayData = history[index];

            // Check that the date is correct
            expect(isSameDay(dayData.date, expectedDay)).toBe(true);

            // Check default properties
            expect(dayData.adherence).toBe(0);
            expect(dayData.logs).toEqual([]);
            expect(dayData.status).toBe('none');
        });
    });

    it('should handle different months correctly (e.g. 31 days)', () => {
        // January 2024 has 31 days
        const testDate = new Date(2024, 0, 10);
        const history = generateMockHistory(testDate);

        expect(history).toHaveLength(31);
    });

    it('should handle different months correctly (e.g. 30 days)', () => {
        // April 2024 has 30 days
        const testDate = new Date(2024, 3, 5);
        const history = generateMockHistory(testDate);

        expect(history).toHaveLength(30);
    });
});
