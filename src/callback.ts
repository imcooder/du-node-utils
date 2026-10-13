/** Call `cb` with `args` when it is a function; otherwise a no-op. */
export function invokeCallback<TArgs extends unknown[], TResult>(
    cb: ((...args: TArgs) => TResult) | null | undefined,
    ...args: TArgs
): TResult | undefined {
    if (typeof cb === 'function') {
        return cb(...args);
    }
    return undefined;
}

export interface JsonResponse<T = unknown> {
    status: number;
    msg: string;
    data?: T;
}

/** `{ status, msg, data? }` response envelope; `data` is omitted when falsy. */
export function json<T>(status: number, msg: string, data?: T): JsonResponse<T> {
    const ret: JsonResponse<T> = { status: status || 0, msg: msg || '' };
    if (data) {
        ret.data = data;
    }
    return ret;
}

/** One byte per UTF-16 code unit (low byte only) — matches the historical behaviour. */
export function stringArrayBuffer(str: string): ArrayBuffer {
    const buffer = new ArrayBuffer(str.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return buffer;
}
