"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSecret = maskSecret;
exports.maskFields = maskFields;
/**
 * Partially mask a sensitive string value.
 *
 * @param value      The string to mask. null/undefined returns '<null>'/'<undefined>'.
 * @param keepChars  Characters to keep at each end (default 3).
 *                   If value.length <= keepChars * 2, the full string is returned.
 */
function maskSecret(value, keepChars = 3) {
    if (value === null)
        return '<null>';
    if (value === undefined)
        return '<undefined>';
    if (value.length === 0)
        return '<empty>';
    if (value.length <= keepChars * 2)
        return value;
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
function maskFields(obj, keys, keepChars = 3) {
    const result = { ...obj };
    for (const key of keys) {
        const val = result[key];
        if (typeof val === 'string') {
            result[key] = maskSecret(val, keepChars);
        }
    }
    return result;
}
//# sourceMappingURL=MaskSecret.js.map