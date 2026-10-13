import { describe, expect, it, vi } from 'vitest';
import { invokeCallback, json, stringArrayBuffer } from '../src/callback.js';
import { md5 } from '../src/crypto.js';

describe('crypto', () => {
    it('md5', () => {
        expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
});

describe('callback', () => {
    it('invokeCallback forwards args and tolerates non-functions', () => {
        const cb = vi.fn((a: number, b: number) => a + b);
        expect(invokeCallback(cb, 1, 2)).toBe(3);
        expect(invokeCallback(undefined, 1)).toBeUndefined();
        expect(invokeCallback(null)).toBeUndefined();
    });

    it('json envelope', () => {
        expect(json(0, '')).toEqual({ status: 0, msg: '' });
        expect(json(1, 'bad', { a: 1 })).toEqual({ status: 1, msg: 'bad', data: { a: 1 } });
        expect(json(2, 'empty', 0)).toEqual({ status: 2, msg: 'empty' });
    });

    it('stringArrayBuffer maps code units to bytes', () => {
        expect([...new Uint8Array(stringArrayBuffer('AB'))]).toEqual([65, 66]);
    });
});
