/**
 * @file Date/Time utilities
 * @author imcooder@gmail.com
 */
const _ = require('underscore');

const date = {};

/**
 * Get current timestamp
 * @returns {number} Millisecond timestamp
 */
date.now = function () {
    return (new Date()).valueOf();
};

/**
 * Format date
 * Supported formats: yyyy-MM-dd hh:mm:ss.S or yyyy-M-d h:m:s.S
 *
 * @param {Date} dateObj - Date object
 * @param {string} fmt - Format string
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
 * // Returns: "2024-01-09 14:30:00"
 */
date.formatDate = function (dateObj, fmt) {
    if (!_.isDate(dateObj)) {
        return '';
    }
    const o = {
        'M+': dateObj.getMonth() + 1,  // month
        'd+': dateObj.getDate(),       // day
        'h+': dateObj.getHours(),      // hour
        'm+': dateObj.getMinutes(),    // minute
        's+': dateObj.getSeconds(),    // second
        'q+': Math.floor((dateObj.getMonth() + 3) / 3), // quarter
        'S': dateObj.getMilliseconds() // millisecond
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

module.exports = date;
