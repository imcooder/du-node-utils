/**
 * @file ID/Random generation utilities
 * @author imcooder@gmail.com
 */

const id = {};

/**
 * Generate random alphanumeric string of specified length (base36)
 * @param {number} length - String length
 * @returns {string} Random string
 */
function generateRandomString(length) {
    let result = '';
    while (result.length < length) {
        result += Math.random().toString(36).substring(2);
    }
    return result.substring(0, length);
}

/**
 * Session prefix - can be set by user or use default random string
 * 12-character string to identify app instance in session IDs
 */
let sessionPrefix = generateRandomString(12);

/**
 * Set custom session prefix
 * If not set, a random 12-character string will be used
 *
 * @param {string} prefix - Custom prefix for session ID
 *
 * @example
 * id.setSessionPrefix('myapp123456');
 */
id.setSessionPrefix = function (prefix) {
    if (prefix && typeof prefix === 'string') {
        sessionPrefix = prefix;
    }
};

/**
 * Generate UUID
 * @param {boolean} trim - Whether to remove hyphens
 * @returns {string} UUID
 */
id.makeUUID = function (trim) {
    const uuidV4 = require('uuid/v4');
    let uuid = uuidV4();
    if (trim) {
        uuid = uuid.replace(/[-]/g, '');
    }
    return uuid;
};

/**
 * Generate random integer within specified range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
id.randomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Generate random string of specified length
 * @param {number} len - String length
 * @returns {string} Random string
 */
id.randomString = function (len) {
    const chars = '0123456789qwertyuioplkjhgfdsazxcvbnm';
    const maxPos = chars.length;
    let out = '';
    for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return out;
};

/**
 * Generate UID postfix
 * @returns {string} Hexadecimal postfix
 */
id.makeUidPostfix = function () {
    return (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString(16);
};

/**
 * Generate user ID
 * @param {string} appid - Application ID
 * @param {string} uid - User ID
 * @param {string} cuid - Client ID
 * @returns {string} Complete user ID
 */
id.makeUserId = function (appid, uid, cuid) {
    return 'connect.' + appid + '.' + uid + '.' + cuid;
};

/**
 * Parse user ID
 * @param {string} userId - User ID
 * @returns {Object|null} Parsed result
 */
id.parseUserid = function (userId) {
    const items = userId.split('.');
    if (items.length < 4) {
        return null;
    }
    return {
        id: userId,
        appid: items[1],
        uid: items[2],
        cuid: items[3]
    };
};

/**
 * Generate database key
 * @param {string} uid - User ID
 * @returns {string} Database key
 */
id.makeDbKey = function (uid) {
    return 'connect.' + uid;
};

/**
 * Generate unique session ID
 * Format: {prefix}{timestamp}{randomSuffix}
 *
 * Structure:
 * - prefix: custom or random string (set via setSessionPrefix)
 * - timestamp: 13-digit millisecond timestamp (provides natural ordering)
 * - randomSuffix: 5-character random string (prevents collisions within same millisecond)
 *
 * @returns {string} Unique session ID
 *
 * @example
 * // With default random prefix
 * const sessionId = id.generateSessionId();
 * // Returns: "a3f7e9b2c1d41735088400123x9y8z"
 *
 * // With custom prefix
 * id.setSessionPrefix('myapp');
 * const sessionId = id.generateSessionId();
 * // Returns: "myapp1735088400123x9y8z"
 */
id.generateSessionId = function () {
    const timestamp = Date.now();
    const randomSuffix = generateRandomString(5);
    return sessionPrefix + timestamp + randomSuffix;
};

module.exports = id;
