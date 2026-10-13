import { describe, expect, it } from 'vitest';
import {
    format,
    formatErrorMsg,
    simplifyString,
    toObject,
    toString,
    trimString,
    trimStringLeft,
    trimStringRight,
} from '../src/string.js';

describe('string', () => {
    it('toString handles strings, objects, nullish and primitives', () => {
        expect(toString('a')).toBe('a');
        expect(toString({ a: 1 })).toBe('{"a":1}');
        expect(toString([1, 2])).toBe('[1,2]');
        expect(toString(null)).toBe('');
        expect(toString(undefined)).toBe('');
        expect(toString(42)).toBe('42');
        expect(toString(true)).toBe('true');
    });

    it('toObject parses JSON and passes everything else through', () => {
        expect(toObject('{"a":1}')).toEqual({ a: 1 });
        expect(toObject('not json')).toBe('not json');
        expect(toObject('')).toBe('');
        const obj = { b: 2 };
        expect(toObject(obj)).toBe(obj);
    });

    it('format replaces #{key} placeholders, calls functions and blanks undefined', () => {
        expect(format('Hello #{name}!', { name: 'World' })).toBe('Hello World!');
        expect(format('#{a}-#{b}', { a: 1, b: (key) => key.toUpperCase() })).toBe('1-B');
        expect(format('#{missing}x', {})).toBe('x');
        expect(format('#{a}', null)).toBe('#{a}');
    });

    it('trims arbitrary charsets from either end', () => {
        expect(trimStringLeft('__a__', '_')).toBe('a__');
        expect(trimStringRight('__a__', '_')).toBe('__a');
        expect(trimString('__a__', '_')).toBe('a');
        expect(trimString('____', '_')).toBe('');
        expect(trimString('', '_')).toBe('');
        expect(trimString('abc', '')).toBe('abc');
    });

    it('simplifyString and formatErrorMsg', () => {
        expect(simplifyString('Hello World!')).toBe('hello_world');
        expect(simplifyString(' a.b ')).toBe('a.b');
        expect(formatErrorMsg('')).toBe('');
        expect(formatErrorMsg('service=db failed')).toBe('db error');
        expect(formatErrorMsg(new Error('boom'))).toBe('Error: boom');
    });
});
