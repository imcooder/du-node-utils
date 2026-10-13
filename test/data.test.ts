import { describe, expect, it, vi } from 'vitest';
import { parseArgs, parseData } from '../src/data.js';

describe('data', () => {
    it('parseData coerces by schema, drops unknown keys and unconvertible strings', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const parsed = parseData(
            { name: 42, age: '7', ok: 'true', no: false, bad: 'x', '': 1, extra: 1, s: null, f: '3.9' },
            {
                name: { type: 'string' },
                age: { type: 'int' },
                ok: { type: 'bool' },
                no: { type: 'bool' },
                bad: { type: 'bool' },
                s: { type: 'string' },
                f: { type: 'int' },
            },
        );
        expect(parsed).toEqual({ name: '42', age: 7, ok: true, no: false, f: 3 });
        expect(error).toHaveBeenCalled();
        error.mockRestore();
    });

    it('parseArgs reads main and --key=value pairs, coercing integers and empty values to 0', () => {
        expect(parseArgs([])).toEqual({});
        expect(parseArgs(['only'])).toEqual({ main: undefined });
        expect(parseArgs(['node', 'app.js', '--port=8080', '-v=1.5', 'flag', 'name=x', '--n='])).toEqual({
            main: 'app.js',
            port: 8080,
            v: '1.5',
            flag: 0,
            name: 'x',
            n: 0,
        });
    });
});
