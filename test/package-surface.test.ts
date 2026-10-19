import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as api from '../src/index.js';
import duNodeUtils from '../src/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PUBLIC_API = [
    'toString',
    'toObject',
    'format',
    'trimStringLeft',
    'trimStringRight',
    'trimString',
    'simplifyString',
    'formatErrorMsg',
    'getIPAdress',
    'ip2int',
    'ip2long',
    'parseIp',
    'getClientIpFromHttpHeader',
    'postJson',
    'makeRpcUrl',
    'makeUUID',
    'randomInt',
    'randomString',
    'makeUidPostfix',
    'makeUserId',
    'parseUserid',
    'makeDbKey',
    'setSessionPrefix',
    'generateSessionId',
    'parseData',
    'parseArgs',
    'now',
    'formatDate',
    'arrayToMap',
    'toArray',
    'clone',
    'deepClone',
    'selectByIDC',
    'md5',
    'invokeCallback',
    'json',
    'stringArrayBuffer',
    'XTimeUse',
    'XWordsCount',
    'maskSecret',
    'maskFields',
    'runCommand',
    'commandSucceeded',
];

const NAMESPACES = ['string', 'network', 'id', 'data', 'date', 'collection', 'crypto', 'callback'];

function runNode(args: string[]): string {
    return execFileSync(process.execPath, args, { cwd: root, encoding: 'utf-8' }).trim();
}

describe('public API surface', () => {
    it('exports every 1.x name plus the module namespaces', () => {
        for (const name of PUBLIC_API) {
            expect(typeof (api as Record<string, unknown>)[name], name).toBe('function');
            expect(typeof (duNodeUtils as Record<string, unknown>)[name], `default.${name}`).toBe('function');
        }
        for (const ns of NAMESPACES) {
            expect(typeof (api as Record<string, unknown>)[ns], ns).toBe('object');
            expect((duNodeUtils as Record<string, unknown>)[ns]).toBe((api as Record<string, unknown>)[ns]);
        }
    });
});

describe('built package (dist/)', () => {
    it.skipIf(!existsSync(resolve(root, 'dist/index.js')))(
        'is importable as ESM with named imports via the exports map',
        () => {
            const out = runNode([
                '--input-type=module',
                '-e',
                [
                    "import { generateSessionId, XTimeUse, XWordsCount, string } from 'du-node-utils';",
                    "import du from 'du-node-utils';",
                    "import { md5 } from 'du-node-utils/lib/crypto';",
                    "import { formatDate } from 'du-node-utils/date';",
                    'console.log(JSON.stringify([generateSessionId().length, typeof XTimeUse, typeof XWordsCount, typeof string.format, typeof du.generateSessionId, md5("hello"), formatDate(new Date(2024,0,9), "yyyy-MM-dd")]));',
                ].join(''),
            ]);
            expect(JSON.parse(out)).toEqual([
                30,
                'function',
                'function',
                'function',
                'function',
                '5d41402abc4b2a76b9719d911017c592',
                '2024-01-09',
            ]);
        },
    );

    it.skipIf(!existsSync(resolve(root, 'dist/index.cjs')))(
        'is requireable as CommonJS with the flat aggregate shape',
        () => {
            const out = runNode([
                '-e',
                [
                    "const du = require('du-node-utils');",
                    "const { XTimeUse } = require('du-node-utils/lib/TimeUse');",
                    'console.log(JSON.stringify([typeof du.generateSessionId, typeof du.XWordsCount, typeof du.string.format, typeof XTimeUse, typeof du.default.generateSessionId]));',
                ].join(''),
            ]);
            expect(JSON.parse(out)).toEqual(['function', 'function', 'function', 'function', 'function']);
        },
    );
});
