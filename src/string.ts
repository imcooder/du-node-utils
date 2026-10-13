/** Convert any value to a string: strings pass through, objects are JSON-encoded, null/undefined become ''. */
export function toString(obj: unknown): string {
    if (typeof obj === 'string') {
        return obj;
    }
    if (obj === undefined || obj === null) {
        return '';
    }
    if (typeof obj === 'object') {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            console.error('json stringify failed:', error);
            return '';
        }
    }
    return String(obj);
}

/** Parse a JSON string; non-strings and unparsable input are returned unchanged. */
export function toObject<T = unknown>(body: string): T | string;
export function toObject<T>(body: T): T;
export function toObject(body: unknown): unknown {
    if (body && typeof body === 'string') {
        try {
            return JSON.parse(body) as unknown;
        } catch (error) {
            console.error('parse json failed:str[%s] error:%s', body, (error as Error).stack);
        }
    }
    return body;
}

export type FormatValue = string | number | boolean | null | undefined | ((key: string) => unknown);

/**
 * Replace `#{key}` placeholders with values from `data`.
 * A function value is called with the key; `undefined` renders as ''.
 */
export function format(source: string, data?: Record<string, FormatValue> | null): string {
    if (!data) {
        return source;
    }
    return source.replace(/#\{(.+?)\}/g, (_match: string, key: string) => {
        let replacer: unknown = data[key];
        if (typeof replacer === 'function') {
            replacer = (replacer as (key: string) => unknown)(key);
        }
        if (replacer === undefined) {
            return '';
        }
        return String(replacer);
    });
}

/** Strip every leading character that appears in `charset`. */
export function trimStringLeft(str: string, charset: string): string {
    if (!str || !charset) {
        return str;
    }
    let firstNotIn = -1;
    for (let i = 0; i < str.length; i++) {
        if (!charset.includes(str.charAt(i))) {
            firstNotIn = i;
            break;
        }
    }
    return firstNotIn < 0 ? '' : str.slice(firstNotIn);
}

/** Strip every trailing character that appears in `charset`. */
export function trimStringRight(str: string, charset: string): string {
    if (!str || !charset) {
        return str;
    }
    let lastNotIn = -1;
    for (let i = str.length - 1; i >= 0; i--) {
        if (!charset.includes(str.charAt(i))) {
            lastNotIn = i;
            break;
        }
    }
    return lastNotIn < 0 ? '' : str.slice(0, lastNotIn + 1);
}

/** Strip characters from `charset` at both ends. */
export function trimString(str: string, charset: string): string {
    if (!str || !charset) {
        return str;
    }
    return trimStringLeft(trimStringRight(str, charset), charset);
}

/** Lower-case and collapse everything but `[0-9A-Za-z_.]` into `_`, then trim `_`. */
export function simplifyString(str: unknown): string {
    const ret = String(str)
        .replace(/[^0-9A-Za-z_.]/g, '_')
        .toLowerCase();
    return trimString(ret, '_').trim();
}

/** Reduce a `service=<name>` style error to `<name> error`; other messages pass through as strings. */
export function formatErrorMsg(message: unknown): string {
    if (!message) {
        return '';
    }
    const msg = String(message);
    const match = /service=(\S+)/i.exec(msg);
    return match ? `${match[1]} error` : msg;
}
