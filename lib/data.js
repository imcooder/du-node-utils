/**
 * @file Data parsing utilities
 * @author imcooder@gmail.com
 */
const _ = require('underscore');

const data = {};

/**
 * Parse data according to schema
 * @param {Object} rawData - Raw data
 * @param {Object} schema - Data structure definition
 * @returns {Object} Parsed data
 */
data.parseData = function (rawData, schema) {
    const expectData = {};
    _.each(rawData, function (value, key) {
        if (key === '') {
            return;
        }
        if (!_.has(schema, key)) {
            console.error('unknown data in db:%s', key);
            return;
        }
        if (schema[key].type === 'string') {
            if (_.isString(value)) {
                expectData[key] = '' + value;
            } else {
                try {
                    const tmp = value.toString();
                    expectData[key] = tmp;
                } catch (error) {
                    console.error('bad string format:%s', error.stack);
                }
            }
        } else if (schema[key].type === 'int') {
            try {
                expectData[key] = parseInt(value, 10);
            } catch (error) {
                console.error('parseint failed:%s', error.stack);
            }
        } else if (schema[key].type === 'bool') {
            if (_.isBoolean(value)) {
                expectData[key] = value;
            } else if (value === 'true') {
                expectData[key] = true;
            } else if (value === 'false') {
                expectData[key] = false;
            } else {
                console.error('bad boolean format key:%s value:%s', key, value);
            }
        }
    });
    return expectData;
};

/**
 * Parse command line arguments
 * @param {Array} args - Argument array
 * @returns {Object} Parsed argument object
 */
data.parseArgs = function (args) {
    const argsMap = {};
    if (args.length < 1) {
        return argsMap;
    }
    const mainPos = 1;
    argsMap.main = args[mainPos];
    for (let i = mainPos + 1; i < args.length; i++) {
        const arg = args[i];
        const sep = arg.indexOf('=');
        let key = arg;
        let value = '';
        if (sep !== -1) {
            key = arg.slice(0, sep);
            while (key.length > 0) {
                if (key[0] === '-') {
                    key = key.slice(1);
                } else {
                    break;
                }
            }
            value = arg.slice(sep + 1);
        }
        if (!isNaN(Number(value)) && (value.indexOf('.') < 0)) {
            value = Number(value);
        }
        argsMap[key] = value;
    }
    return argsMap;
};

module.exports = data;
