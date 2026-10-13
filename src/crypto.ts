import { createHash } from 'node:crypto';

/** Lower-case hex MD5 of a UTF-8 string. */
export function md5(str: string): string {
    return createHash('md5').update(str).digest('hex');
}
