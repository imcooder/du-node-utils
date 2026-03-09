/**
 * @file du-node-utils type declarations
 */

// Re-export TypeScript classes
export { XTimeUse } from './lib/TimeUse';
export { XWordsCount, XWordsCountOptions } from './lib/WordsSum';

// String utilities
export function toString(obj: any): string;
export function toObject(body: string): any;
export function format(source: string, data: Record<string, any>): string;
export function trimStringLeft(str: string, charset: string): string;
export function trimStringRight(str: string, charset: string): string;
export function trimString(str: string, charset: string): string;
export function simplifyString(str: string): string;
export function formatErrorMsg(message: any): string;

// Network/IP utilities
export function getIPAdress(): string;
export function ip2int(ip: string): number;
export function ip2long(ip: string): number;
export function parseIp(ipString: string): string;
export function getClientIpFromHttpHeader(headers: Record<string, string | string[] | undefined>): string;
export function postJson(options: any, body: any): Promise<any>;
export function makeRpcUrl(host: string): string;

// ID/Random utilities
export function makeUUID(trim?: boolean): string;
export function randomInt(min: number, max: number): number;
export function randomString(len: number): string;
export function makeUidPostfix(): string;
export function makeUserId(appid: string, uid: string, cuid: string): string;
export function parseUserid(userId: string): { id: string; appid: string; uid: string; cuid: string } | null;
export function makeDbKey(uid: string): string;
export function setSessionPrefix(prefix: string): void;
export function generateSessionId(): string;

// Data parsing utilities
export function parseData(data: any, schema: any): any;
export function parseArgs(args: any): any;

// Date/Time utilities
export function now(): number;
export function formatDate(date: Date, fmt: string): string;

// Collection utilities
export function arrayToMap(array: any[], key: string): Record<string, any>;
export function toArray(obj: any): any[];
export function clone(obj: any): any;
export function deepClone(obj: any): any;
export function selectByIDC(configs: any[], idc: string): any[];

// Crypto utilities
export function md5(str: string): string;

// Callback/Response utilities
export function invokeCallback(cb: Function, ...args: any[]): void;
export function json(status: number, msg: string, data?: any): { status: number; msg: string; data: any };
export function stringArrayBuffer(str: string): ArrayBuffer;

// Sub-modules
export const string: any;
export const network: any;
export const id: any;
export const data: any;
export const date: any;
export const collection: any;
export const crypto: any;
export const callback: any;
