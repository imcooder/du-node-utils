# du-node-utils
dueros node utils

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![David deps][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/du-node-utils.svg
[npm-url]: https://npmjs.com/package/du-node-utils
[download-image]: https://img.shields.io/npm/dm/du-node-utils.svg
[download-url]: https://npmjs.com/package/du-node-utils
[david-image]: https://img.shields.io/david/imcooder/du-node-utils.svg
[david-url]: https://david-dm.org/imcooder/du-node-utils

## Installation

```bash
npm install du-node-utils
```

## Usage

```javascript
const util = require('du-node-utils');
```

You can also import specific modules:

```javascript
const { string, network, id } = require('du-node-utils');
// or
const string = require('du-node-utils/lib/string');
```

## API Reference

### String Utilities

| Method | Description |
|--------|-------------|
| `toString(obj)` | Convert object to string |
| `toObject(str)` | Parse JSON string to object |
| `format(source, data)` | Format string with `#{key}` placeholders |
| `trimStringLeft(str, charset)` | Trim specified characters from left |
| `trimStringRight(str, charset)` | Trim specified characters from right |
| `trimString(str, charset)` | Trim specified characters from both sides |
| `simplifyString(str)` | Keep only alphanumeric and underscores, convert to lowercase |
| `formatErrorMsg(message)` | Format error message |

```javascript
// Example
util.format('Hello #{name}!', { name: 'World' });
// Returns: "Hello World!"

util.simplifyString('Hello World!');
// Returns: "hello_world"
```

### Network/IP Utilities

| Method | Description |
|--------|-------------|
| `getIPAdress()` | Get local IPv4 address |
| `ip2int(ip)` | Convert IP to integer (network byte order) |
| `ip2long(ip)` | Convert IP to long integer |
| `parseIp(ipString)` | Parse IP address from string |
| `getClientIpFromHttpHeader(headers)` | Get client IP from HTTP headers |
| `postJson(options, body)` | Send POST JSON request (returns Promise) |
| `makeRpcUrl(host)` | Generate RPC URL |

```javascript
// Example
util.getIPAdress();
// Returns: "192.168.1.100"

util.ip2long('192.168.1.1');
// Returns: 3232235777
```

### ID/Random Utilities

| Method | Description |
|--------|-------------|
| `makeUUID(trim)` | Generate UUID, optionally remove hyphens |
| `randomInt(min, max)` | Generate random integer in range [min, max) |
| `randomString(len)` | Generate random alphanumeric string |
| `makeUidPostfix()` | Generate hexadecimal UID postfix |
| `makeUserId(appid, uid, cuid)` | Generate user ID |
| `parseUserid(userId)` | Parse user ID |
| `makeDbKey(uid)` | Generate database key |
| `setSessionPrefix(prefix)` | Set custom session ID prefix |
| `generateSessionId()` | Generate unique session ID |

```javascript
// Example
util.makeUUID(true);
// Returns: "550e8400e29b41d4a716446655440000"

util.randomString(8);
// Returns: "a3f7e9b2"

// Session ID with default random prefix
util.generateSessionId();
// Returns: "a3f7e9b2c1d41735088400123x9y8z"

// Session ID with custom prefix
util.setSessionPrefix('myapp');
util.generateSessionId();
// Returns: "myapp1735088400123x9y8z"
```

#### generateSessionId Format

The session ID consists of three parts:

```
{prefix}{timestamp}{randomSuffix}
```

| Part | Description | Example |
|------|-------------|---------|
| prefix | Custom prefix (via `setSessionPrefix`) or random 12-char string | `a3f7e9b2c1d4` |
| timestamp | 13-digit millisecond timestamp | `1735088400123` |
| randomSuffix | 5-character random string (base36) | `x9y8z` |

Example breakdown:
```
a3f7e9b2c1d41735088400123x9y8z
|___________|____________|____|
   prefix     timestamp   rand
  (12 char)   (13 digit)  (5 char)
```

- **prefix**: Identifies the app instance. Use `setSessionPrefix()` to set a custom value, otherwise a random string is generated at module load.
- **timestamp**: Provides natural chronological ordering.
- **randomSuffix**: Prevents collisions when multiple IDs are generated within the same millisecond.

#### Use Cases

- **Request Tracing**: Track requests across microservices by passing session ID in headers
- **Log Correlation**: Group related log entries using the same session ID
- **User Session Management**: Identify user sessions in web applications
- **Distributed Systems**: Trace operations across multiple nodes (prefix identifies the origin node)
- **Debugging**: Quickly locate all logs for a specific request or session

### Data Parsing Utilities

| Method | Description |
|--------|-------------|
| `parseData(data, schema)` | Parse data according to schema |
| `parseArgs(args)` | Parse command line arguments |

```javascript
// Example
const schema = {
    name: { type: 'string' },
    age: { type: 'int' },
    active: { type: 'bool' }
};
util.parseData({ name: 'John', age: '25', active: 'true' }, schema);
// Returns: { name: 'John', age: 25, active: true }
```

### Date/Time Utilities

| Method | Description |
|--------|-------------|
| `now()` | Get current timestamp in milliseconds |
| `formatDate(date, fmt)` | Format date with pattern |

```javascript
// Example
util.now();
// Returns: 1735088400123

util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
// Returns: "2024-01-09 14:30:00"
```

### Collection Utilities

| Method | Description |
|--------|-------------|
| `arrayToMap(array, key)` | Convert array to map using specified key |
| `toArray(obj)` | Convert object to array |
| `clone(obj)` | Shallow clone object |
| `deepClone(obj)` | Deep clone object |
| `selectByIDC(configs, idc)` | Filter configs by IDC |

```javascript
// Example
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
];
util.arrayToMap(users, 'id');
// Returns: { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }

util.deepClone({ a: { b: 1 } });
// Returns: { a: { b: 1 } } (new object)
```

### Crypto Utilities

| Method | Description |
|--------|-------------|
| `md5(str)` | Calculate MD5 hash of string |

```javascript
// Example
util.md5('hello');
// Returns: "5d41402abc4b2a76b9719d911017c592"
```

### Timer Utilities (XTimeUse)

Multi-stage time profiling with independent tag-based timers.

| Method | Description |
|--------|-------------|
| `new XTimeUse()` | Create a timer, starts counting immediately |
| `start(tag?)` | Start timing for a tag. No tag resets the default timer |
| `stop(tag?)` | Stop and return elapsed ms. Cached if already stopped |
| `restart(tag?)` | Restart timing, return previous segment ms |
| `elapsed(tag?)` | Get current elapsed ms without stopping |
| `get(tag?)` | Get start timestamp (ms) |

```javascript
const { XTimeUse } = require('du-node-utils');

// 1. Simple usage
const timer = new XTimeUse();
// ... some work ...
console.log(`took ${timer.stop()}ms`);

// 2. Multi-stage profiling
const t = new XTimeUse();

t.start('connect');
// ... connect to db ...
const connectTime = t.stop('connect');

t.start('query');
// ... run query ...
const queryTime = t.stop('query');

console.log(`total:${t.stop()}ms connect:${connectTime}ms query:${queryTime}ms`);

// 3. Stop without explicit start - measures from creation time
const totalProcess = t.stop('full_process');

// 4. Peek at elapsed without stopping
t.start('long_task');
// ... partial work ...
console.log(`so far: ${t.elapsed('long_task')}ms`);
// ... more work ...
console.log(`done: ${t.stop('long_task')}ms`);

// 5. Restart to measure segments
t.start('phase');
// ... phase 1 ...
const phase1 = t.restart('phase'); // returns phase1 time, restarts
// ... phase 2 ...
const phase2 = t.stop('phase');
```

### Word Counting (XWordsCount)

Incremental text word/character counter with Unicode-aware language support.
Counts are updated on each `append()` call for maximum efficiency.

**Supported languages:** Chinese, Japanese (Hiragana/Katakana), Korean (Hangul), English, German, French, Arabic, Hebrew, Cyrillic, Thai, Greek, Devanagari, and more.

**Counting rules:**
- CJK characters: each character = 1 word
- Non-CJK text: each space-separated token containing at least one alphanumeric character = 1 word

| Method / Property | Description |
|-------------------|-------------|
| `new XWordsCount(options?)` | Create counter. Options: `ignorePunctuation`, `ignoreWhitespace` |
| `append(text)` | Append text and update counts |
| `wordCount` | Current word count (getter) |
| `charCount` | Current character count (getter) |
| `reset()` | Reset all counts |

```javascript
const { XWordsCount } = require('du-node-utils');

const counter = new XWordsCount({ ignorePunctuation: true });

// English
counter.append('Hello world');
console.log(counter.wordCount); // 2

// Chinese
counter.append('你好世界');
console.log(counter.wordCount); // 6 (2 English + 4 CJK)

// Japanese (Hiragana/Katakana each char = 1 word)
counter.append('こんにちは');
console.log(counter.wordCount); // 11 (6 + 5 Hiragana)

// Korean (each Hangul syllable = 1 word)
counter.append('안녕하세요');
console.log(counter.wordCount); // 16 (11 + 5 Hangul)

// German (umlauts: ä, ö, ü, ß treated as alphanumeric)
counter.append('Straße überall');
console.log(counter.wordCount); // 18 (16 + 2 German words)

// French (accented chars: é, è, ç, ê treated as alphanumeric)
counter.append('café résumé');
console.log(counter.wordCount); // 20 (18 + 2 French words)

// Arabic
counter.append('مرحبا بالعالم');
console.log(counter.wordCount); // 22 (20 + 2 Arabic words)

// Mixed in one append
counter.reset();
counter.append('Hello 你好 こんにちは Straße مرحبا');
console.log(counter.wordCount); // 10 (1 Hello + 2 你好 + 5 こんにちは + 1 Straße + 1 مرحبا)
```

#### Punctuation handling

```javascript
// ignorePunctuation: true (punctuation skipped)
const withIgnore = new XWordsCount({ ignorePunctuation: true });
withIgnore.append('Hello, world!');
console.log(withIgnore.wordCount); // 2 ("Hello" + "world", punctuation ignored)
console.log(withIgnore.charCount); // 10 (only letters, comma and ! excluded)

withIgnore.reset();
withIgnore.append('你好。世界');
console.log(withIgnore.wordCount); // 4 (你好世界, 。is CJK punctuation, skipped)
console.log(withIgnore.charCount); // 4

// ignorePunctuation: false (default, punctuation counted)
const noIgnore = new XWordsCount();
noIgnore.append('Hello, world!');
console.log(noIgnore.wordCount); // 2 ("Hello," and "world!" both contain alphanumeric)
console.log(noIgnore.charCount); // 12 (all non-whitespace chars including , and !)

noIgnore.reset();
noIgnore.append('你好。世界');
console.log(noIgnore.wordCount); // 5 (你好。世界, 。in CJK range counts as 1 word)
console.log(noIgnore.charCount); // 5
```

### Callback/Response Utilities

| Method | Description |
|--------|-------------|
| `invokeCallback(cb, ...args)` | Safely invoke callback function |
| `json(status, msg, data)` | Build JSON response object |
| `stringArrayBuffer(str)` | Convert string to ArrayBuffer |

```javascript
// Example
util.json(0, 'success', { id: 1 });
// Returns: { status: 0, msg: 'success', data: { id: 1 } }
```

## License

MIT
