/**
 * @file Network/IP utilities
 * @author imcooder@gmail.com
 */
const request = require('request');
const string = require('./string');

const ipReg = /(\d+)\.(\d+)\.(\d+)\.(\d+)/g;

const network = {};

/**
 * Get local IP address
 * @returns {string} IP address
 */
network.getIPAdress = function () {
    const interfaces = require('os').networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};

/**
 * Convert IP to integer (network byte order)
 * @param {string} ip - IP address
 * @returns {number} Integer representation
 */
network.ip2int = function (ip) {
    let n = network.ip2long(ip);
    // convert to network order
    n = ((n & 0xFF) << 24) | (((n >> 8) & 0xFF) << 16) | (((n >> 16) & 0xFF) << 8) | ((n >> 24) & 0xFF);
    return n < (1 << 31) ? n : n - (1 << 32);
};

/**
 * Convert IP to long integer
 * @param {string} ip - IP address
 * @returns {number} Long integer representation
 */
network.ip2long = function (ip) {
    let ipl = 0;
    ip.split('.').forEach(function (octet) {
        ipl <<= 8;
        ipl += parseInt(octet, 10);
    });
    return (ipl >>> 0);
};

/**
 * Parse IP address from string
 * @param {string} ipString - String containing IP
 * @returns {string|null} IP address or null
 */
network.parseIp = function (ipString) {
    if (!ipString) {
        return null;
    }
    const matchs = ipString.match(ipReg);
    if (!matchs) {
        return null;
    }
    return matchs[0];
};

/**
 * Get client IP from HTTP headers
 * @param {Object} headers - HTTP request headers
 * @returns {string} Client IP address
 */
network.getClientIpFromHttpHeader = function (headers) {
    let matchs = null;
    if (headers['x-forwarded-for']) {
        matchs = headers['x-forwarded-for'].match(ipReg);
        if (matchs) {
            return matchs[0];
        }
    }
    if (headers.clientip) {
        matchs = headers.clientip.match(ipReg);
        if (matchs) {
            return matchs[0];
        }
    }
    return '';
};

/**
 * Send POST JSON request
 * @param {Object} options - Request options
 * @param {Object} body - Request body
 * @returns {Promise} Promise object
 */
network.postJson = function (options, body) {
    const p = new Promise(function (resolve, reject) {
        options.json = body;
        request.post(options, function (err, httpResponse, data) {
            if (err) {
                if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                    console.error('[http] timeout opt:%j', options);
                    reject(new Error('timeout'));
                    return;
                }
                console.error('[http]callback failed opt:[%j] body[%j] error:%s', options, data, err.stack);
                reject(err);
                return;
            }
            const jsonObject = data;
            resolve(jsonObject);
        });
    });
    return p;
};

/**
 * Generate RPC URL
 * @param {string} host - Host address
 * @returns {string} RPC URL
 */
network.makeRpcUrl = function (host) {
    const url = 'http://#{host}/api/rpc/invoke';
    return string.format(url, {
        host: host
    });
};

module.exports = network;
