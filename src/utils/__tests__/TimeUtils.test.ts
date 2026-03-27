import { isTimePastDue } from '../TimeUtils';

describe('isTimePastDue', () => {
    // 10:30 AM
    const mockNow = new Date();
    mockNow.setHours(10, 30, 0, 0);

    it('should return true if the scheduled time is in the past (24h format)', () => {
        expect(isTimePastDue('09:00', mockNow)).toBe(true);
        expect(isTimePastDue('10:29', mockNow)).toBe(true);
    });

    it('should return true if the scheduled time is in the past (12h format)', () => {
        expect(isTimePastDue('09:00 AM', mockNow)).toBe(true);
        expect(isTimePastDue('08:30 AM', mockNow)).toBe(true);
    });

    it('should return false if the scheduled time is in the future (24h format)', () => {
        expect(isTimePastDue('11:00', mockNow)).toBe(false);
        expect(isTimePastDue('23:59', mockNow)).toBe(false);
    });

    it('should return false if the scheduled time is in the future (12h format)', () => {
        expect(isTimePastDue('11:00 AM', mockNow)).toBe(false);
        expect(isTimePastDue('02:30 PM', mockNow)).toBe(false);
        expect(isTimePastDue('11:40 PM', mockNow)).toBe(false);
    });

    it('should return true if the scheduled time is exactly the current time', () => {
        expect(isTimePastDue('10:30', mockNow)).toBe(true);
        expect(isTimePastDue('10:30 AM', mockNow)).toBe(true);
    });

    it('should return false for invalid time string inputs', () => {
        expect(isTimePastDue('', mockNow)).toBe(false);
        expect(isTimePastDue('invalid', mockNow)).toBe(false);
        expect(isTimePastDue('25:00', mockNow)).toBe(false); // parseTimeToMinutes returns NaN for out of range hours? No, parseTimeToMinutes doesn't check range but it might return NaN if regex doesn't match
    });

    it('should use current time if now parameter is not provided', () => {
        // This is a bit tricky to test without mocking Date,
        // but we can check it doesn't crash and returns a boolean.
        expect(typeof isTimePastDue('00:00')).toBe('boolean');
    });
});
