/**
 * @file Crypto utilities
 * @author imcooder@gmail.com
 */
const crypto = require('crypto');

const cryptoUtil = {};

/**
 * Calculate MD5 hash of string
 * @param {string} str - Source string
 * @returns {string} MD5 hash (lowercase)
 */
cryptoUtil.md5 = function (str) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
};

module.exports = cryptoUtil;
