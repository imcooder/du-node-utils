/**
 * @file Collection utilities
 * @author imcooder@gmail.com
 */
const _ = require('underscore');
const Clone = require('clone');

const collection = {};

/**
 * Convert array to map
 * @param {Array} array - Source array
 * @param {string} key - Property name to use as key
 * @returns {Object} Map object
 */
collection.arrayToMap = function (array, key) {
    if (!array) {
        return {};
    }
    if (!_.isArray(array)) {
        return {};
    }
    const map = {};
    _.each(array, function (item) {
        let keyValue = '';
        if (_.has(item, key)) {
            keyValue = item[key];
        }
        map[keyValue] = item;
    });
    return map;
};

/**
 * Convert object to array
 * @param {Object} obj - Source object
 * @returns {Array} Array
 */
collection.toArray = function (obj) {
    // TODO: implement
};

/**
 * Shallow clone object
 * @param {*} obj - Source object
 * @returns {*} Cloned object
 */
collection.clone = function (obj) {
    return _.clone(obj);
};

/**
 * Deep clone object
 * @param {*} obj - Source object
 * @returns {*} Deep cloned object
 */
collection.deepClone = function (obj) {
    return Clone(obj);
};

/**
 * Filter configs by IDC
 * @param {Array} configs - Config array
 * @param {string} idc - IDC identifier
 * @returns {Array} Filtered config array
 */
collection.selectByIDC = function (configs, idc) {
    const confs = [];
    if (!_.isArray(configs)) {
        return confs;
    }
    return _.filter(configs, function (item) {
        if (!item || !_.isObject(item)) {
            return false;
        }
        if (idc === '') {
            return true;
        }
        const thisIDC = item.idc || '';
        if (thisIDC === '') {
            return false;
        }
        if (thisIDC === 'all') {
            return true;
        }
        if (thisIDC === idc) {
            return true;
        }
    });
};

module.exports = collection;
