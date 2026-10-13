import { describe, expect, it } from 'vitest';
import {
    generateSessionId,
    makeDbKey,
    makeUUID,
    makeUidPostfix,
    makeUserId,
    parseUserid,
    randomInt,
    randomString,
    setSessionPrefix,
} from '../src/id.js';

describe('id', () => {
    it('generateSessionId is prefix + 13-digit timestamp + 5 base36 chars', () => {
        const id = generateSessionId();
        expect(id).toMatch(/^[0-9a-z]{12}\d{13}[0-9a-z]{5}$/);
        expect(id).toHaveLength(30);
        const ts = Number(id.slice(12, 25));
        expect(Math.abs(Date.now() - ts)).toBeLessThan(2000);
    });

    it('setSessionPrefix replaces the prefix and ignores empty values', () => {
        setSessionPrefix('myapp');
        expect(generateSessionId()).toMatch(/^myapp\d{13}[0-9a-z]{5}$/);
        setSessionPrefix('');
        expect(generateSessionId().startsWith('myapp')).toBe(true);
        setSessionPrefix('abcdefghijkl');
    });

    it('makeUUID', () => {
        expect(makeUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(makeUUID(true)).toMatch(/^[0-9a-f]{32}$/);
    });

    it('random helpers stay inside their ranges', () => {
        for (let i = 0; i < 200; i++) {
            const n = randomInt(3, 6);
            expect(n).toBeGreaterThanOrEqual(3);
            expect(n).toBeLessThan(6);
        }
        expect(randomString(16)).toMatch(/^[0-9a-z]{16}$/);
        expect(randomString(0)).toBe('');
        expect(makeUidPostfix()).toMatch(/^[0-9a-f]+$/);
    });

    it('user ids round-trip', () => {
        const id = makeUserId('app', 'u1', 'c1');
        expect(id).toBe('connect.app.u1.c1');
        expect(parseUserid(id)).toEqual({ id, appid: 'app', uid: 'u1', cuid: 'c1' });
        expect(parseUserid('too.short')).toBeNull();
        expect(makeDbKey('u1')).toBe('connect.u1');
    });
});
