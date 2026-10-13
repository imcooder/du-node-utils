import { networkInterfaces } from 'node:os';
import { format } from './string.js';

const ipReg = /(\d+)\.(\d+)\.(\d+)\.(\d+)/;

/** First non-internal IPv4 address of this host, or '' when none is found. */
export function getIPAdress(): string {
    try {
        for (const iface of Object.values(networkInterfaces())) {
            for (const alias of iface ?? []) {
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    } catch {
        return '';
    }
    return '';
}

/** Dotted IPv4 → unsigned 32-bit host-order integer. */
export function ip2long(ip: string): number {
    let ipl = 0;
    for (const octet of ip.split('.')) {
        ipl <<= 8;
        ipl += parseInt(octet, 10);
    }
    return ipl >>> 0;
}

/** Dotted IPv4 → signed 32-bit network-order integer. */
export function ip2int(ip: string): number {
    const n = ip2long(ip);
    return ((n & 0xff) << 24) | (((n >> 8) & 0xff) << 16) | (((n >> 16) & 0xff) << 8) | ((n >> 24) & 0xff);
}

/** First dotted IPv4 found in `ipString`, or null. */
export function parseIp(ipString: string | null | undefined): string | null {
    if (!ipString) {
        return null;
    }
    const match = ipString.match(ipReg);
    return match ? match[0] : null;
}

export type HttpHeaders = Record<string, string | string[] | undefined>;

/** Client IPv4 from `x-forwarded-for` or `clientip`, or '' when neither carries one. */
export function getClientIpFromHttpHeader(headers: HttpHeaders): string {
    for (const name of ['x-forwarded-for', 'clientip']) {
        const raw = headers[name];
        const value = Array.isArray(raw) ? raw.join(',') : raw;
        const match = value ? value.match(ipReg) : null;
        if (match) {
            return match[0];
        }
    }
    return '';
}

export interface PostJsonOptions {
    url?: string;
    uri?: string;
    headers?: Record<string, string>;
    /** Request timeout in milliseconds; rejects with `Error('timeout')`. */
    timeout?: number;
}

/**
 * POST a JSON body and resolve with the parsed JSON response (or the raw text when
 * the body is not JSON). Non-2xx statuses reject with the status in the message.
 */
export async function postJson<T = unknown>(options: PostJsonOptions, body: unknown): Promise<T> {
    const url = options.url ?? options.uri;
    if (!url) {
        throw new Error('postJson: options.url is required');
    }
    const controller = new AbortController();
    const timer = options.timeout ? setTimeout(() => controller.abort(), options.timeout) : null;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const text = await response.text();
        if (!response.ok) {
            throw new Error(`postJson: HTTP ${response.status} ${text}`);
        }
        try {
            return JSON.parse(text) as T;
        } catch {
            return text as T;
        }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.error('[http] timeout opt:%j', options);
            throw new Error('timeout');
        }
        throw error;
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

/** `http://<host>/api/rpc/invoke` */
export function makeRpcUrl(host: string): string {
    return format('http://#{host}/api/rpc/invoke', { host });
}
