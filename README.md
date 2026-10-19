# du-node-utils

Dependency-free Node.js utilities: session ids, strings, dates, collections, IP helpers, a multi-stage timer, a Unicode-aware word counter and a non-blocking process runner. TypeScript, ESM + CommonJS, Node ≥ 18.

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

Every module is also a subpath: `du-node-utils/string`, `du-node-utils/network`, `du-node-utils/id`, `du-node-utils/data`, `du-node-utils/date`, `du-node-utils/collection`, `du-node-utils/crypto`, `du-node-utils/callback`, `du-node-utils/TimeUse`, `du-node-utils/WordsSum`, `du-node-utils/MaskSecret`, `du-node-utils/RunCommand`. The 1.x paths `du-node-utils/lib/<module>` keep working.

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

### runCommand / commandSucceeded

Run an executable without blocking the event loop. The returned promise **always resolves** with a result object: a missing binary, a non-zero exit, a timeout or an abort never throw.

```ts
import { runCommand, commandSucceeded } from 'du-node-utils';

const result = await runCommand('ffmpeg', ['-version'], { captureStdout: true, timeoutMs: 10_000 });
if (commandSucceeded(result)) {
    console.log(result.stdout);
} else {
    console.log(result.spawnError, result.timedOut, result.aborted, result.code, result.stderr);
}
```

Signature: `runCommand(executable: string, args: string[], options?: RunCommandOptions): Promise<RunCommandResult>`. The arguments are passed as an array and no shell is involved.

**Result**

| Field                                 | Meaning                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `code` / `signal`                     | Exit code and terminating signal; both `null` when the process never started                  |
| `timedOut`                            | Killed because `timeoutMs` elapsed                                                            |
| `aborted`                             | Killed (or never started) because `signal` aborted                                            |
| `spawnError`                          | Message when the process could not be started (missing file, no permission); otherwise `null` |
| `stdout` / `stderr`                   | Captured output, limited by the caps below                                                    |
| `stdoutTruncated` / `stderrTruncated` | `true` when output exceeded its cap                                                           |

`commandSucceeded(result)` is true only when the process started, exited with `0`, and was neither timed out nor aborted.

**Options**

| Option                              | Default             | Meaning                                                                                                              |
| ----------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `timeoutMs`                         | none                | Kill the process with `SIGKILL` after this many milliseconds                                                         |
| `signal`                            | none                | `AbortSignal`; aborting kills the process. An already-aborted signal resolves immediately without starting it        |
| `cwd`                               | parent's            | Working directory of the child                                                                                       |
| `env`                               | parent's            | Variables merged over the parent environment (`undefined` removes one). The parent's `process.env` is never modified |
| `prependPath`                       | none                | Directories put in front of the child's `PATH`; the system `PATH` stays behind them as the fallback                  |
| `captureStdout`                     | `false`             | Keep stdout in `result.stdout` (otherwise it is discarded)                                                           |
| `stdoutMaxChars` / `stderrMaxChars` | `65536`             | Characters kept in the result                                                                                        |
| `stdoutKeep` / `stderrKeep`         | `'head'` / `'tail'` | Which end survives when the cap is exceeded; stderr keeps the tail because errors come last                          |
| `onStdout` / `onStderr`             | none                | Called with each decoded chunk as it arrives, regardless of the caps                                                 |

**Prefer our own binary, fall back to the system one**

```ts
const result = await runCommand('ffmpeg', ['-i', input, '-f', 'null', '-'], {
    prependPath: ['/opt/app/resources/ffmpeg'], // found there first, otherwise the system PATH decides
    timeoutMs: 60_000,
});
```

**Cancel a long job**

```ts
const controller = new AbortController();
const pending = runCommand('ffmpeg', args, { signal: controller.signal });
cancelButton.onclick = () => controller.abort();
const result = await pending; // result.aborted === true after a cancel
```

**Stream progress or very large output**

```ts
await runCommand('ffmpeg', ['-progress', 'pipe:1', '-i', input, output], {
    onStdout: (chunk) => parseProgress(chunk), // every chunk, not limited by the caps
});
```

Memory stays bounded: output beyond the cap is still read and dropped, so a chatty child never stalls on a full pipe. Check `stdoutTruncated` / `stderrTruncated` if completeness matters, or consume the stream with the callbacks.

**Platform notes** (macOS, Linux, Windows)

- Windows: `windowsHide` is set; a bare name such as `ffmpeg` resolves to `ffmpeg.exe`, but the current directory is searched before `PATH`, so pass an absolute path when that matters; the `Path` variable is matched case-insensitively.
- `.cmd` / `.bat` files cannot be started without a shell (Node rejects them); this helper deliberately never uses a shell.
- A timeout or abort kills the direct child only. If a descendant keeps the pipes open, the promise still resolves after a short grace period.

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
