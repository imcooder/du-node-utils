/**
 * @file 文件介绍
 * @author imcooder@gmail.com
 */
/* eslint-disable fecs-camelcase */
/* jshint esversion: 6 */
/* jshint node:true */
var _ = require('underscore');
var request = require('request');
let Clone = require('clone');
var crypto = require('crypto');
var util = {

};
module.exports = util;

util.makeUserId = function (appid, uid, cuid) {
    return 'connect.' + appid + '.' + uid + '.' + cuid;
};
util.toString = function (obj) {
    var str = '';
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
util.toObject = function (body) {
    if (body && _.isString(body)) {
        try {
            body = JSON.parse(body);
        } catch (error) {
            console.error('parse json failed:str[%s] error:%s', error.stack);
        }
    }
    return body;
};
util.parseUserid = function (userId) {
    var items = userId.split('.');
    if (items.length < 4) {
        return null;
    }
    return {
        id: userId,
        appid: items[1],
        uid: items[2],
        cuid: items[3],
    };
};

util.makeDbKey = function (uid) {
    return 'connect.' + uid;
};
util.makeUUID = function (trim) {
    var uuidV4 = require('uuid/v4');
    var id = uuidV4();
    if (trim) {
        id = id.replace(/[-]/g, '');
    }
    return id;
};
util.randomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};
util.invokeCallback = function (cb) {
    if (typeof cb === 'function') {
        var len = arguments.length;
        if (len == 1) {
            return cb();
        }

        if (len == 2) {
            return cb(arguments[1]);
        }

        if (len == 3) {
            return cb(arguments[1], arguments[2]);
        }

        if (len == 4) {
            return cb(arguments[1], arguments[2], arguments[3]);
        }

        var args = Array(len - 1);
        for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
        cb.apply(null, args);
        // cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};
util.randomString = function (len) {
    var chars = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    var maxPos = chars.length;
    var out = '';
    for (var i = 0; i < len; i++) {　　　　
        out += chars.charAt(Math.floor(Math.random() * maxPos));　　
    }
    return out;
};
util.makeUidPostfix = function () {
    var self = this;
    return (self.now() * 1000 + Math.floor(Math.random() * 1000)).toString(16);
};
util.now = function () {
    return (new Date()).valueOf();
};
util.toArray = function (obj) {

};
// print the file name and the line number ~ begin
function getStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack) {
    return stack[1].getLineNumber();
}

util.parseData = function (data, schema) {
    var expectData = {};
    _.each(data, function (value, key) {
        if (key === '') {
            return;
        }
        if (!_.has(schema, key)) {
            console.error('unknown data in db:%s', key);
            return;
        }
        if (schema[key].type == 'string') {
            if (_.isString(value)) {
                expectData[key] = '' + value;
            } else {
                try {
                    var tmp = value.toString();
                    expectData[key] = tmp;
                } catch (error) {
                    console.error('bad string format:%s', error.stack);
                }
            }
        } else if (schema[key].type == 'int') {
            try {
                expectData[key] = parseInt(value, 10);
            } catch (error) {
                console.error('parseint failed:%s', error.stack);
            }
        } else if (schema[key].type == 'bool') {
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
util.postJson = function (options, body) {
    var p = new Promise(function (resolve, reject) {
        options.json = body;
        // console.log(options);
        request.post(options, function (err, httpResponse, data) {
            if (err) {
                if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                    console.error('[http] timeout opt:%j', options);
                    reject(new Error('timeout'));
                    return;
                }
                console.error('[http]callback failed opt:[%j] body[%j] error:%s', options, data,
                    err.stack);
                reject(err);
                return;
            }
            // console.log('[http]callback success [%s] opt:%j response[%j]', options.url, options,
            //    data);
            var jsonObject = data;
            resolve(jsonObject);
            return;
        });
    });
    return p;
};

util.json = function (status, msg, data) {
    var ret = {
        status: status || 0,
        msg: msg || ''
    };
    if (data) {
        ret.data = data;
    }
    return ret;
};

util.stringArrayBuffer = function (str) {
    var buffer = new ArrayBuffer(str.length);
    var bytes = new Uint8Array(buffer);
    str.split('').forEach(function (str, i) {
        bytes[i] = str.charCodeAt(0);
    });
    return buffer;
};

util.format = function (source, data) {
    var toString = Object.prototype.toString;
    if (data) {
        return source.replace(/#\{(.+?)\}/g, function (match, key) {
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
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
util.getIPAdress = function () {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};
util.arrayToMap = function (array, key) {
    if (!array) {
        return {};
    }
    if (!_.isArray(array)) {
        return {};
    }
    var map = {};
    _.each(array, function (item) {
        let keyValue = '';
        if (_.has(item, key)) {
            keyValue = item[key];
        }
        map[keyValue] = item;
    });
    return map;
};
util.makeRpcUrl = function (host) {
    var url = 'http://#{host}/api/rpc/invoke';
    return util.format(url, {
        host: host
    });
};
//yyyy-MM-dd hh:mm:ss.S
//yyyy-M-d h:m:s.S
util.formatDate = function (date, fmt) {
    if (!_.isDate(date)) {
        return "";
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
util.selectByIDC = function (configs, idc) {
    let confs = [];
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
        let thisIDC = item.idc || '';
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

util.clone = function (obj) {
    return _.clone(obj);
};
util.deepClone = function (obj) {
    return Clone(obj);
};

function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    return md5sum.digest('hex');
}

util.ip2int = function (ip) {
    let n = util.ip2long(ip);
    /** convert to network order */
    n = ((n & 0xFF) << 24) | (((n >> 8) & 0xFF) << 16) | (((n >> 16) & 0xFF) << 8) | ((n >> 24) & 0xFF);
    return n < (1 << 31) ? n : n - (1 << 32);
};

util.ip2long = function (ip) {
    var ipl = 0;
    ip.split('.').forEach(function (octet) {
        ipl <<= 8;
        ipl += parseInt(octet, 10);
    });
    return (ipl >>> 0);
};

util.parseArgs = function (args) {
    let argsMap = {};
    if (args.length < 1) {
        return argsMap;
    }
    let mainPos = 1;
    argsMap.main = args[mainPos];
    for (let i = mainPos + 1; i < args.length; i++) {
        let arg = args[i];
        let sep = arg.indexOf('=');
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

util.formatErrorMsg = (message) => {
    if (!message) {
        return '';
    }
    let msg = message.toString();
    let matchs = /service\=(\S+)/i.exec(msg);
    if (matchs) {
        return matchs[1] + ' error';
    }
    return msg;
}