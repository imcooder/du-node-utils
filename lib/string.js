/**
 * @file String utilities
 * @author imcooder@gmail.com
 */
const _ = require('underscore');

const string = {};

/**
 * Convert object to string
 * @param {*} obj - Object to convert
 * @returns {string} Converted string
 */
string.toString = function (obj) {
    let str = '';
    if (_.isString(obj)) {
        str = obj;
    } else if (_.isObject(obj) || _.isArray(obj)) {
        try {
            str = JSON.stringify(obj);
        } catch (error) {
            console.error('json stringify failed:', obj);
        }
    } else if (obj === undefined || obj === null) {
        str = '';
    } else {
        try {
            str = obj.toString();
        } catch (error) {
            console.error('json stringify failed:', obj);
        }
    }
    return str;
};

/**
 * Parse string to object
 * @param {string} body - String to parse
 * @returns {*} Parsed object
 */
string.toObject = function (body) {
    if (body && _.isString(body)) {
        try {
            body = JSON.parse(body);
        } catch (error) {
            console.error('parse json failed:str[%s] error:%s', error.stack);
        }
    }
    return body;
};

/**
 * Format string with #{key} placeholders
 * @param {string} source - Source string
 * @param {Object} data - Data object
 * @returns {string} Formatted string
 */
string.format = function (source, data) {
    const toString = Object.prototype.toString;
    if (data) {
        return source.replace(/#\{(.+?)\}/g, function (match, key) {
            let replacer = data[key];
            if ('[object Function]' === toString.call(replacer)) {
                replacer = replacer(key);
            }
            if (replacer === undefined) {
                return '';
            }
            return replacer;
        });
    }
    return source;
};

/**
 * Trim specified characters from left side
 * @param {string} str - Source string
 * @param {string} charset - Characters to trim
 * @returns {string} Trimmed string
 */
string.trimStringLeft = function (str, charset) {
    if (!str || !charset) {
        return str;
    }
    let firstNotIn = -1;
    for (let i = 0; i < str.length; i++) {
        if (charset.indexOf(str.charAt(i)) === -1) {
            firstNotIn = i;
            break;
        }
    }
    if (firstNotIn < 0) {
        return '';
    }
    return str.substr(firstNotIn);
};

/**
 * Trim specified characters from right side
 * @param {string} str - Source string
 * @param {string} charset - Characters to trim
 * @returns {string} Trimmed string
 */
string.trimStringRight = function (str, charset) {
    if (!str || !charset) {
        return str;
    }
    let lastFirstNotIn = -1;
    for (let i = str.length - 1; i >= 0; i--) {
        if (charset.indexOf(str.charAt(i)) === -1) {
            lastFirstNotIn = i;
            break;
        }
    }
    if (lastFirstNotIn < 0) {
        return '';
    }
    return str.substr(0, lastFirstNotIn + 1);
};

/**
 * Trim specified characters from both sides
 * @param {string} str - Source string
 * @param {string} charset - Characters to trim
 * @returns {string} Trimmed string
 */
string.trimString = function (str, charset) {
    if (!str || !charset) {
        return str;
    }
    return string.trimStringLeft(string.trimStringRight(str, charset), charset);
};

/**
 * Simplify string, keep only alphanumeric and underscores
 * @param {string} str - Source string
 * @returns {string} Simplified string
 */
string.simplifyString = function (str) {
    const ret = str.toString().replace(/[^0-9A-Za-z_.]/g, '_').toLowerCase();
    return string.trimString(ret, '_').trim();
};

/**
 * Format error message
 * @param {*} message - Error message
 * @returns {string} Formatted error message
 */
string.formatErrorMsg = function (message) {
    if (!message) {
        return '';
    }
    const msg = message.toString();
    const matchs = /service\=(\S+)/i.exec(msg);
    if (matchs) {
        return matchs[1] + ' error';
    }
    return msg;
};

module.exports = string;
