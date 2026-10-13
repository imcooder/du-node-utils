import { randomUUID } from 'node:crypto';

function generateRandomString(length: number): string {
    let result = '';
    while (result.length < length) {
        result += Math.random().toString(36).substring(2);
    }
    return result.substring(0, length);
}

let sessionPrefix = generateRandomString(12);

/** Override the instance prefix every `generateSessionId()` starts with (default: a random 12-char base36 string). */
export function setSessionPrefix(prefix: string): void {
    if (prefix && typeof prefix === 'string') {
        sessionPrefix = prefix;
    }
}

/**
 * `{prefix}{13-digit ms timestamp}{5 random base36 chars}` — sortable within one instance,
 * collision-safe within one millisecond.
 */
export function generateSessionId(): string {
    return sessionPrefix + Date.now() + generateRandomString(5);
}

/** RFC 4122 v4 UUID; `trim` drops the hyphens. */
export function makeUUID(trim = false): string {
    const uuid = randomUUID();
    return trim ? uuid.replace(/-/g, '') : uuid;
}

/** Random integer in `[min, max)`. */
export function randomInt(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo)) + lo;
}

const RANDOM_CHARS = '0123456789qwertyuioplkjhgfdsazxcvbnm';

/** Random string over `[0-9a-z]` of the given length. */
export function randomString(len: number): string {
    let out = '';
    for (let i = 0; i < len; i++) {
        out += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
    }
    return out;
}

/** Hex of `now_ms * 1000 + random(0..999)`. */
export function makeUidPostfix(): string {
    return (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString(16);
}

/** `connect.<appid>.<uid>.<cuid>` */
export function makeUserId(appid: string, uid: string, cuid: string): string {
    return `connect.${appid}.${uid}.${cuid}`;
}

export interface ParsedUserId {
    id: string;
    appid: string;
    uid: string;
    cuid: string;
}

/** Inverse of `makeUserId`; null when the id has fewer than four dot-separated parts. */
export function parseUserid(userId: string): ParsedUserId | null {
    const items = userId.split('.');
    if (items.length < 4) {
        return null;
    }
    return { id: userId, appid: items[1] ?? '', uid: items[2] ?? '', cuid: items[3] ?? '' };
}

/** `connect.<uid>` */
export function makeDbKey(uid: string): string {
    return `connect.${uid}`;
}
