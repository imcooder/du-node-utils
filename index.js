/**
 * @file du-node-utils entry point
 * @author imcooder@gmail.com
 */
/* eslint-disable fecs-camelcase */
/* jshint esversion: 6 */
/* jshint node:true */

// Import modules
const string = require('./lib/string');
const network = require('./lib/network');
const id = require('./lib/id');
const data = require('./lib/data');
const date = require('./lib/date');
const collection = require('./lib/collection');
const cryptoUtil = require('./lib/crypto');
const callback = require('./lib/callback');
const { XTimeUse } = require('./lib/TimeUse');

// Aggregate and export all methods for backward compatibility
const util = {
    // String utilities
    toString: string.toString,
    toObject: string.toObject,
    format: string.format,
    trimStringLeft: string.trimStringLeft,
    trimStringRight: string.trimStringRight,
    trimString: string.trimString,
    simplifyString: string.simplifyString,
    formatErrorMsg: string.formatErrorMsg,

    // Network/IP utilities
    getIPAdress: network.getIPAdress,
    ip2int: network.ip2int,
    ip2long: network.ip2long,
    parseIp: network.parseIp,
    getClientIpFromHttpHeader: network.getClientIpFromHttpHeader,
    postJson: network.postJson,
    makeRpcUrl: network.makeRpcUrl,

    // ID/Random utilities
    makeUUID: id.makeUUID,
    randomInt: id.randomInt,
    randomString: id.randomString,
    makeUidPostfix: id.makeUidPostfix,
    makeUserId: id.makeUserId,
    parseUserid: id.parseUserid,
    makeDbKey: id.makeDbKey,
    setSessionPrefix: id.setSessionPrefix,
    generateSessionId: id.generateSessionId,

    // Data parsing utilities
    parseData: data.parseData,
    parseArgs: data.parseArgs,

    // Date/Time utilities
    now: date.now,
    formatDate: date.formatDate,

    // Collection utilities
    arrayToMap: collection.arrayToMap,
    toArray: collection.toArray,
    clone: collection.clone,
    deepClone: collection.deepClone,
    selectByIDC: collection.selectByIDC,

    // Crypto utilities
    md5: cryptoUtil.md5,

    // Callback/Response utilities
    invokeCallback: callback.invokeCallback,
    json: callback.json,
    stringArrayBuffer: callback.stringArrayBuffer,

    // Timer utilities
    XTimeUse: XTimeUse
};

// Export sub-modules for selective imports
util.string = string;
util.network = network;
util.id = id;
util.data = data;
util.date = date;
util.collection = collection;
util.crypto = cryptoUtil;
util.callback = callback;

module.exports = util;
