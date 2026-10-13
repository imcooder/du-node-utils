/** Index an array of objects by the value of `key`; items without the key land under ''. */
export function arrayToMap<T extends object>(
    array: readonly T[] | null | undefined,
    key: keyof T,
): Record<string, T> {
    const map: Record<string, T> = {};
    if (!Array.isArray(array)) {
        return map;
    }
    for (const item of array) {
        const keyValue = Object.prototype.hasOwnProperty.call(item, key) ? String(item[key]) : '';
        map[keyValue] = item;
    }
    return map;
}

/** Values of an object (or a shallow copy of an array); non-objects yield []. */
export function toArray<T>(obj: readonly T[] | Record<string, T> | null | undefined): T[] {
    if (Array.isArray(obj)) {
        return [...obj];
    }
    if (obj && typeof obj === 'object') {
        return Object.values(obj);
    }
    return [];
}

/** Shallow copy: arrays are sliced, objects spread, primitives returned as-is. */
export function clone<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return [...obj] as T;
    }
    if (obj && typeof obj === 'object') {
        return { ...obj };
    }
    return obj;
}

/** Deep copy preserving Date, RegExp, Map, Set, arrays, plain objects and class prototypes; handles cycles. */
export function deepClone<T>(obj: T): T {
    return cloneValue(obj, new WeakMap()) as T;
}

function cloneValue(value: unknown, seen: WeakMap<object, unknown>): unknown {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    const cached = seen.get(value);
    if (cached) {
        return cached;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags);
    }
    if (value instanceof Map) {
        const out = new Map();
        seen.set(value, out);
        for (const [k, v] of value) {
            out.set(cloneValue(k, seen), cloneValue(v, seen));
        }
        return out;
    }
    if (value instanceof Set) {
        const out = new Set();
        seen.set(value, out);
        for (const v of value) {
            out.add(cloneValue(v, seen));
        }
        return out;
    }
    if (Array.isArray(value)) {
        const out: unknown[] = [];
        seen.set(value, out);
        for (const v of value) {
            out.push(cloneValue(v, seen));
        }
        return out;
    }
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return structuredClone(value);
    }
    const out = Object.create(Object.getPrototypeOf(value) as object | null) as Record<PropertyKey, unknown>;
    seen.set(value, out);
    for (const key of Reflect.ownKeys(value)) {
        out[key] = cloneValue((value as Record<PropertyKey, unknown>)[key], seen);
    }
    return out;
}

export interface IdcConfig {
    idc?: string;
}

/** Configs whose `idc` is `all` or equals `idc`; an empty `idc` selects every object entry. */
export function selectByIDC<T extends IdcConfig>(configs: readonly T[] | null | undefined, idc: string): T[] {
    if (!Array.isArray(configs)) {
        return [];
    }
    return configs.filter((item) => {
        if (!item || typeof item !== 'object') {
            return false;
        }
        if (idc === '') {
            return true;
        }
        const thisIDC = item.idc ?? '';
        return thisIDC !== '' && (thisIDC === 'all' || thisIDC === idc);
    });
}
