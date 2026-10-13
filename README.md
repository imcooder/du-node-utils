# du-node-utils

Dependency-free Node.js utilities: session ids, strings, dates, collections, IP helpers, a multi-stage timer and a Unicode-aware word counter. TypeScript, ESM + CommonJS, Node ≥ 18.

[![NPM version](https://img.shields.io/npm/v/du-node-utils.svg)](https://npmjs.com/package/du-node-utils)
[![npm download](https://img.shields.io/npm/dm/du-node-utils.svg)](https://npmjs.com/package/du-node-utils)
[![CI](https://github.com/imcooder/du-node-utils/actions/workflows/ci.yml/badge.svg)](https://github.com/imcooder/du-node-utils/actions/workflows/ci.yml)

## Install

```bash
npm install du-node-utils
```

## Usage

```ts
// ESM / TypeScript
import { generateSessionId, XTimeUse, formatDate } from 'du-node-utils';
import { md5 } from 'du-node-utils/crypto';

// CommonJS
const du = require('du-node-utils');
du.generateSessionId();

// Module namespaces
import { string, id } from 'du-node-utils';
string.format('Hello #{name}!', { name: 'World' });
```

Every module is also a subpath: `du-node-utils/string`, `du-node-utils/network`, `du-node-utils/id`, `du-node-utils/data`, `du-node-utils/date`, `du-node-utils/collection`, `du-node-utils/crypto`, `du-node-utils/callback`, `du-node-utils/TimeUse`, `du-node-utils/WordsSum`, `du-node-utils/MaskSecret`. The 1.x paths `du-node-utils/lib/<module>` keep working.

## API

### id

| Function                                           | Description                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `generateSessionId()`                              | `{prefix}{13-digit ms timestamp}{5 random base36 chars}`; sortable per instance, unique per millisecond |
| `setSessionPrefix(prefix)`                         | Replace the instance prefix (default: random 12-char base36)                                            |
| `makeUUID(trim?)`                                  | RFC 4122 v4 UUID; `trim` removes hyphens                                                                |
| `randomInt(min, max)`                              | Integer in `[min, max)`                                                                                 |
| `randomString(len)`                                | `[0-9a-z]` string                                                                                       |
| `makeUidPostfix()`                                 | Hex of `now_ms * 1000 + random`                                                                         |
| `makeUserId(appid, uid, cuid)` / `parseUserid(id)` | `connect.<appid>.<uid>.<cuid>` and back                                                                 |
| `makeDbKey(uid)`                                   | `connect.<uid>`                                                                                         |

### string

| Function                                        | Description                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `toString(value)`                               | Strings pass through, objects JSON-encode, nullish → `''`         |
| `toObject(str)`                                 | `JSON.parse` that returns the input unchanged when it is not JSON |
| `format(source, data)`                          | Replace `#{key}`; function values are called with the key         |
| `trimStringLeft/Right/trimString(str, charset)` | Trim any character of `charset`                                   |
| `simplifyString(str)`                           | Lower-case, non `[0-9A-Za-z_.]` → `_`, trimmed                    |
| `formatErrorMsg(message)`                       | `service=<name>` errors → `<name> error`                          |

### network

| Function                             | Description                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `getIPAdress()`                      | First non-internal IPv4 of this host                                                      |
| `ip2long(ip)` / `ip2int(ip)`         | Host-order unsigned / network-order signed 32-bit                                         |
| `parseIp(str)`                       | First dotted quad in a string                                                             |
| `getClientIpFromHttpHeader(headers)` | From `x-forwarded-for`, then `clientip`                                                   |
| `postJson(options, body)`            | `fetch`-based JSON POST; `{ url \| uri, headers?, timeout? }`; rejects `Error('timeout')` |
| `makeRpcUrl(host)`                   | `http://<host>/api/rpc/invoke`                                                            |

### date, data, collection, crypto, callback

| Function                        | Description                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `now()`                         | Millisecond timestamp                                                                                 |
| `formatDate(date, fmt)`         | Tokens `y M d h m s q S`; repeated tokens zero-pad (`yyyy-MM-dd hh:mm:ss.S`)                          |
| `parseData(raw, schema)`        | Coerce fields to `string` / `int` / `bool` per schema                                                 |
| `parseArgs(argv)`               | `argv[1]` → `main`; `--key=value` pairs; integer-like values (an empty value included) become numbers |
| `arrayToMap(array, key)`        | Index objects by a property                                                                           |
| `toArray(obj)`                  | Object values / array copy                                                                            |
| `clone(obj)` / `deepClone(obj)` | Shallow / structural deep copy (Date, RegExp, Map, Set, prototypes, cycles)                           |
| `selectByIDC(configs, idc)`     | Entries whose `idc` is `all` or matches                                                               |
| `md5(str)`                      | Lower-case hex MD5                                                                                    |
| `invokeCallback(cb, ...args)`   | Call when `cb` is a function                                                                          |
| `json(status, msg, data?)`      | `{ status, msg, data? }` envelope                                                                     |
| `stringArrayBuffer(str)`        | One byte per code unit                                                                                |

### XTimeUse

```ts
const timer = new XTimeUse();
timer.start('connect');
// ...
const connectMs = timer.stop('connect');
const totalMs = timer.stop();
timer.elapsed('connect'); // cached once stopped
timer.restart('query'); // returns the previous segment, starts a new one
```

### XWordsCount

```ts
const counter = new XWordsCount({ ignorePunctuation: true });
counter.append('Hello world'); // wordCount 2
counter.append('你好世界'); // wordCount 6 — each CJK character is one word
counter.charCount;
counter.reset();
```

### maskSecret / maskFields

```ts
maskSecret('vault:AES256:abcXYZ'); // 'vau***XYZ'
maskFields({ password: 'hunter2024', name: 'alice' }, ['password']); // { password: 'hun***024', name: 'alice' }
```

## Development

```bash
npm install
npm run lint      # eslint + prettier --check
npm run typecheck
npm test          # tsup build + vitest (includes an ESM/CJS interop check on dist/)
```

Releases: bump `version`, update `CHANGELOG.md`, `npm publish` (`prepublishOnly` runs lint, typecheck, build and tests).

## License

MIT
