/**
 * @file Callback/Response utilities
 * @author imcooder@gmail.com
 */

const callback = {};

/**
 * Safely invoke callback function
 * @param {Function} cb - Callback function
 * @param {...*} args - Arguments to pass to callback
 */
callback.invokeCallback = function (cb) {
    if (typeof cb === 'function') {
        const len = arguments.length;
        if (len === 1) {
            return cb();
        }
        if (len === 2) {
            return cb(arguments[1]);
        }
        if (len === 3) {
            return cb(arguments[1], arguments[2]);
        }
        if (len === 4) {
            return cb(arguments[1], arguments[2], arguments[3]);
        }
        const args = Array(len - 1);
        for (let i = 1; i < len; i++) {
            args[i - 1] = arguments[i];
        }
        cb.apply(null, args);
    }
};

/**
 * Build JSON response object
 * @param {number} status - Status code
 * @param {string} msg - Message
 * @param {*} data - Data
 * @returns {Object} Response object
 */
callback.json = function (status, msg, data) {
    const ret = {
        status: status || 0,
        msg: msg || ''
    };
    if (data) {
        ret.data = data;
    }
    return ret;
};

/**
 * Convert string to ArrayBuffer
 * @param {string} str - Source string
 * @returns {ArrayBuffer} ArrayBuffer object
 */
callback.stringArrayBuffer = function (str) {
    const buffer = new ArrayBuffer(str.length);
    const bytes = new Uint8Array(buffer);
    str.split('').forEach(function (str, i) {
        bytes[i] = str.charCodeAt(0);
    });
    return buffer;
};

module.exports = callback;
