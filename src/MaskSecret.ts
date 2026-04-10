/**
 * mask-secret.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilities for masking sensitive values in logs.
 *
 * maskSecret(value)
 *   Partially masks a string — keeps first/last N chars, replaces middle with ***
 *   maskSecret('vault:AES256:abcXYZ')  →  'vau***XYZ'
 *   maskSecret('ab')                   →  'ab'          (too short, show all)
 *   maskSecret(null)                   →  '<null>'
 *   maskSecret('')                     →  '<empty>'
 *
 * maskFields(obj, keys)
 *   Returns a shallow copy of obj with the specified keys masked.
 *   Safe to pass directly to JSON.stringify for log output.
 *   maskFields({ password: 'secret', name: 'alice' }, ['password'])
 *   →  { password: 'sec***ret', name: 'alice' }
 */

/**
 * Partially mask a sensitive string value.
 *
 * @param value      The string to mask. null/undefined returns '<null>'/'<undefined>'.
 * @param keepChars  Characters to keep at each end (default 3).
 *                   If value.length <= keepChars * 2, the full string is returned.
 */
export function maskSecret(value: string | null | undefined, keepChars = 3): string {
    if (value === null)      return '<null>';
    if (value === undefined) return '<undefined>';
    if (value.length === 0)  return '<empty>';
    if (value.length <= keepChars * 2) return value;
    return `${value.slice(0, keepChars)}***${value.slice(-keepChars)}`;
}

/**
 * Return a shallow copy of `obj` with the listed keys masked via maskSecret.
 * Non-string values at those keys are left as-is.
 *
 * @param obj        The source object (not mutated).
 * @param keys       The property names whose values should be masked.
 * @param keepChars  Forwarded to maskSecret (default 3).
 */
export function maskFields<T extends Record<string, unknown>>(
    obj: T,
    keys: (keyof T)[],
    keepChars = 3,
): T {
    const result = { ...obj };
    for (const key of keys) {
        const val = result[key];
        if (typeof val === 'string') {
            (result as Record<string, unknown>)[key as string] = maskSecret(val, keepChars);
        }
    }
    return result;
}
