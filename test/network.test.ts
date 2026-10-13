import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    getClientIpFromHttpHeader,
    getIPAdress,
    ip2int,
    ip2long,
    makeRpcUrl,
    parseIp,
    postJson,
} from '../src/network.js';

describe('network ip helpers', () => {
    it('ip2long / ip2int', () => {
        expect(ip2long('10.0.0.1')).toBe(167772161);
        expect(ip2long('255.255.255.255')).toBe(4294967295);
        expect(ip2int('10.0.0.1')).toBe(16777226);
        expect(ip2int('192.168.1.1')).toBe(16885952);
        expect(ip2int('1.0.0.200')).toBe(-939524095);
    });

    it('parseIp finds the first dotted quad', () => {
        expect(parseIp('client 10.1.2.3 port 80')).toBe('10.1.2.3');
        expect(parseIp('none')).toBeNull();
        expect(parseIp('')).toBeNull();
        expect(parseIp(undefined)).toBeNull();
    });

    it('getClientIpFromHttpHeader prefers x-forwarded-for, then clientip', () => {
        expect(getClientIpFromHttpHeader({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('1.2.3.4');
        expect(getClientIpFromHttpHeader({ clientip: '9.9.9.9' })).toBe('9.9.9.9');
        expect(getClientIpFromHttpHeader({ 'x-forwarded-for': ['7.7.7.7'] })).toBe('7.7.7.7');
        expect(getClientIpFromHttpHeader({})).toBe('');
    });

    it('getIPAdress returns a string', () => {
        expect(typeof getIPAdress()).toBe('string');
    });

    it('makeRpcUrl', () => {
        expect(makeRpcUrl('host:8080')).toBe('http://host:8080/api/rpc/invoke');
    });
});

describe('postJson', () => {
    let server: Server;
    let base = '';

    beforeAll(async () => {
        server = createServer((req, res) => {
            let raw = '';
            req.on('data', (chunk: Buffer) => (raw += chunk.toString()));
            req.on('end', () => {
                if (req.url === '/slow') {
                    setTimeout(() => res.end('{}'), 500);
                    return;
                }
                if (req.url === '/text') {
                    res.end('plain');
                    return;
                }
                if (req.url === '/fail') {
                    res.statusCode = 500;
                    res.end('nope');
                    return;
                }
                res.setHeader('content-type', 'application/json');
                res.end(
                    JSON.stringify({
                        method: req.method,
                        got: JSON.parse(raw),
                        auth: req.headers.authorization,
                    }),
                );
            });
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const address = server.address();
        base = typeof address === 'object' && address ? `http://127.0.0.1:${address.port}` : '';
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('posts JSON with headers and resolves the parsed body', async () => {
        const result = await postJson<{ method: string; got: unknown; auth: string }>(
            { url: `${base}/echo`, headers: { authorization: 'Bearer x' } },
            { a: 1 },
        );
        expect(result).toEqual({ method: 'POST', got: { a: 1 }, auth: 'Bearer x' });
    });

    it('accepts the legacy uri option and returns text when the body is not JSON', async () => {
        await expect(postJson({ uri: `${base}/text` }, {})).resolves.toBe('plain');
    });

    it('rejects with timeout and on HTTP errors', async () => {
        await expect(postJson({ url: `${base}/slow`, timeout: 50 }, {})).rejects.toThrow('timeout');
        await expect(postJson({ url: `${base}/fail` }, {})).rejects.toThrow('HTTP 500');
        await expect(postJson({}, {})).rejects.toThrow('url is required');
    });
});
