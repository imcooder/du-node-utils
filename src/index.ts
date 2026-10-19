export * from './string.js';
export * from './network.js';
export * from './id.js';
export * from './data.js';
export * from './date.js';
export * from './collection.js';
export * from './crypto.js';
export * from './callback.js';
export { XTimeUse } from './TimeUse.js';
export { XWordsCount, type XWordsCountOptions } from './WordsSum.js';
export { maskSecret, maskFields } from './MaskSecret.js';
export { runCommand, commandSucceeded, type RunCommandOptions, type RunCommandResult } from './RunCommand.js';

import * as string from './string.js';
import * as network from './network.js';
import * as id from './id.js';
import * as data from './data.js';
import * as date from './date.js';
import * as collection from './collection.js';
import * as crypto from './crypto.js';
import * as callback from './callback.js';
import { XTimeUse } from './TimeUse.js';
import { XWordsCount } from './WordsSum.js';
import { maskSecret, maskFields } from './MaskSecret.js';
import { runCommand, commandSucceeded } from './RunCommand.js';

export { string, network, id, data, date, collection, crypto, callback };

const duNodeUtils = {
    ...string,
    ...network,
    ...id,
    ...data,
    ...date,
    ...collection,
    ...crypto,
    ...callback,
    XTimeUse,
    XWordsCount,
    maskSecret,
    maskFields,
    runCommand,
    commandSucceeded,
    string,
    network,
    id,
    data,
    date,
    collection,
    crypto,
    callback,
};

export default duNodeUtils;
