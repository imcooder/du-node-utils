import { describe, expect, it } from 'vitest';
import { formatDate, now } from '../src/date.js';

describe('date', () => {
    it('now is a millisecond timestamp', () => {
        expect(Math.abs(now() - Date.now())).toBeLessThan(50);
    });

    it('formatDate pads repeated tokens and leaves single tokens unpadded', () => {
        const d = new Date(2024, 0, 9, 14, 3, 7, 5);
        expect(formatDate(d, 'yyyy-MM-dd hh:mm:ss')).toBe('2024-01-09 14:03:07');
        expect(formatDate(d, 'yy/M/d h:m:s.S q')).toBe('24/1/9 14:3:7.5 1');
        expect(formatDate(d, 'yyyy-MM-dd hh:mm:ss.S')).toBe('2024-01-09 14:03:07.5');
    });

    it('formatDate rejects invalid input', () => {
        expect(formatDate(new Date('nope'), 'yyyy')).toBe('');
        expect(formatDate('2024' as unknown as Date, 'yyyy')).toBe('');
    });
});
