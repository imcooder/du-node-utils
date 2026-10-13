import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { XTimeUse } from '../src/TimeUse.js';
import { XWordsCount } from '../src/WordsSum.js';
import { maskFields, maskSecret } from '../src/MaskSecret.js';

describe('XTimeUse', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('default timer, tagged stages, restart and cached stops', () => {
        vi.setSystemTime(1000);
        const timer = new XTimeUse();
        vi.setSystemTime(1100);
        timer.start('connect');
        vi.setSystemTime(1250);
        expect(timer.stop('connect')).toBe(150);
        vi.setSystemTime(1400);
        expect(timer.stop('connect')).toBe(150);
        expect(timer.elapsed('connect')).toBe(150);
        expect(timer.stop()).toBe(400);
        expect(timer.stop('never-started')).toBe(400);
        expect(timer.get()).toBe(1000);
        expect(timer.get('connect')).toBe(1100);
        timer.start('q');
        vi.setSystemTime(1450);
        expect(timer.restart('q')).toBe(50);
        expect(timer.get('q')).toBe(1450);
    });
});

describe('XWordsCount', () => {
    it('counts CJK characters and space-separated words incrementally', () => {
        const counter = new XWordsCount({ ignorePunctuation: true });
        counter.append('Hello world');
        expect(counter.wordCount).toBe(2);
        counter.append('你好世界');
        expect(counter.wordCount).toBe(6);
        counter.append('Hello, world!');
        expect(counter.wordCount).toBe(8);
        counter.reset();
        expect(counter.wordCount).toBe(0);
        expect(counter.charCount).toBe(0);
    });
});

describe('maskSecret / maskFields', () => {
    it('masks the middle and keeps short or empty values readable', () => {
        expect(maskSecret('vault:AES256:abcXYZ')).toBe('vau***XYZ');
        expect(maskSecret('ab')).toBe('ab');
        expect(maskSecret('')).toBe('<empty>');
        expect(maskSecret(null)).toBe('<null>');
        expect(maskSecret(undefined)).toBe('<undefined>');
        expect(maskSecret('secret')).toBe('secret');
        expect(maskFields({ password: 'hunter2024', name: 'alice', n: 1 }, ['password', 'n'])).toEqual({
            password: 'hun***024',
            name: 'alice',
            n: 1,
        });
    });
});
