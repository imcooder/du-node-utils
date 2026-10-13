/** Current time as a millisecond timestamp. */
export function now(): number {
    return Date.now();
}

/**
 * Format a date with `y M d h m s q S` tokens, e.g. `yyyy-MM-dd hh:mm:ss.S`.
 * Repeated tokens zero-pad to their width (`MM` → `01`); a single token is unpadded.
 * Returns '' for anything that is not a valid Date.
 */
export function formatDate(dateObj: Date, fmt: string): string {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
        return '';
    }
    const fields: Record<string, number> = {
        'M+': dateObj.getMonth() + 1,
        'd+': dateObj.getDate(),
        'h+': dateObj.getHours(),
        'm+': dateObj.getMinutes(),
        's+': dateObj.getSeconds(),
        'q+': Math.floor((dateObj.getMonth() + 3) / 3),
        S: dateObj.getMilliseconds(),
    };
    let out = fmt;
    const year = /(y+)/.exec(out);
    if (year?.[1]) {
        out = out.replace(year[1], String(dateObj.getFullYear()).slice(4 - year[1].length));
    }
    for (const [token, value] of Object.entries(fields)) {
        const match = new RegExp(`(${token})`).exec(out);
        if (!match?.[1]) {
            continue;
        }
        const text = String(value);
        out = out.replace(match[1], match[1].length === 1 ? text : `00${text}`.slice(text.length));
    }
    return out;
}
