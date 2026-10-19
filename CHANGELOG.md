# Changelog

## 2.1.0

- `runCommand` / `commandSucceeded`: non-blocking process runner with timeout, abort signal, capped stdout/stderr capture and `prependPath`.

## 2.0.0

### Breaking

- Requires Node.js 18 or newer.
- Zero runtime dependencies: `request`, `underscore`, `clone`, `uuid` and the deprecated `crypto` placeholder are gone.
  - `postJson(options, body)` now runs on the global `fetch`. It keeps the `url`/`uri`, `headers` and `timeout` options and still rejects with `Error('timeout')`; non-2xx responses now reject instead of resolving.
  - `deepClone` is a built-in structural clone (Date, RegExp, Map, Set, typed arrays, class prototypes, cycles).
- `toArray(obj)` is implemented (object values / array copy); it used to return `undefined`.
- Published files are `dist/` only (no `src/`, source maps for the TypeScript classes, or `tsconfig.json`).

### Fixed

- `ip2int` returned every value off by one: the old range check compared against `1 << 31`, which is negative in JavaScript, so the `- (1 << 32)` branch (i.e. `- 1`) always ran. It now returns the signed network-order integer.

### Added

- Dual ESM + CommonJS build with full type declarations for both. `import { generateSessionId } from 'du-node-utils'` works natively in Node ESM (including bundled Electron main processes), and `require('du-node-utils')` keeps the flat aggregate shape.
- Subpath exports: `du-node-utils/<module>` and the historical `du-node-utils/lib/<module>` both resolve for every module.
- Every module is TypeScript with strict types; all 1.x names and the eight module namespaces are kept.
- Test suite (vitest) incl. a real Node ESM / CJS interop check against the built package, ESLint + Prettier, GitHub Actions CI on Node 18/20/22.

## 1.4.0

- `maskSecret` / `maskFields` for log-safe masking of sensitive values.

## 1.3.x

- `XTimeUse` multi-stage timer, `XWordsCount` Unicode-aware word counter, modular `lib/` layout, type declarations.
