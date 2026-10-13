import { describe, expect, it } from 'vitest';
import { arrayToMap, clone, deepClone, selectByIDC, toArray } from '../src/collection.js';

describe('collection', () => {
    it('arrayToMap indexes by key', () => {
        const a = { id: 'x', v: 1 };
        const b = { id: 'y', v: 2 };
        expect(arrayToMap([a, b], 'id')).toEqual({ x: a, y: b });
        expect(arrayToMap([{ v: 1 }] as Array<{ id?: string; v: number }>, 'id')).toEqual({ '': { v: 1 } });
        expect(arrayToMap(null, 'id')).toEqual({});
    });

    it('toArray', () => {
        expect(toArray([1, 2])).toEqual([1, 2]);
        expect(toArray({ a: 1, b: 2 })).toEqual([1, 2]);
        expect(toArray(null)).toEqual([]);
    });

    it('clone is shallow', () => {
        const inner = { z: 1 };
        const src = { a: inner, b: [1] };
        const out = clone(src);
        expect(out).toEqual(src);
        expect(out).not.toBe(src);
        expect(out.a).toBe(inner);
        expect(clone([1, 2])).toEqual([1, 2]);
        expect(clone(5)).toBe(5);
    });

    it('deepClone copies nested structures, special types, prototypes and cycles', () => {
        class Point {
            constructor(
                public x: number,
                public y: number,
            ) {}
            len(): number {
                return Math.hypot(this.x, this.y);
            }
        }
        const src: Record<string, unknown> = {
            d: new Date(1000),
            r: /a/gi,
            m: new Map([['k', { n: 1 }]]),
            s: new Set([1, 2]),
            arr: [{ q: 1 }],
            p: new Point(3, 4),
            buf: new Uint8Array([1, 2]),
        };
        src.self = src;
        const out = deepClone(src);
        expect(out).not.toBe(src);
        expect(out.d).toEqual(new Date(1000));
        expect(out.d).not.toBe(src.d);
        expect((out.r as RegExp).flags).toBe('gi');
        expect((out.m as Map<string, { n: number }>).get('k')).toEqual({ n: 1 });
        expect((out.m as Map<string, { n: number }>).get('k')).not.toBe(
            (src.m as Map<string, { n: number }>).get('k'),
        );
        expect(out.s).toEqual(new Set([1, 2]));
        expect(out.arr).toEqual([{ q: 1 }]);
        expect((out.arr as unknown[])[0]).not.toBe((src.arr as unknown[])[0]);
        expect(out.p).toBeInstanceOf(Point);
        expect((out.p as Point).len()).toBe(5);
        expect(out.buf).toEqual(new Uint8Array([1, 2]));
        expect(out.self).toBe(out);
        expect(deepClone(7)).toBe(7);
        expect(deepClone(null)).toBeNull();
    });

    it('selectByIDC', () => {
        const configs = [
            { idc: 'bj' },
            { idc: 'all' },
            { idc: 'sh' },
            {},
            null as unknown as { idc?: string },
        ];
        expect(selectByIDC(configs, 'bj')).toEqual([{ idc: 'bj' }, { idc: 'all' }]);
        expect(selectByIDC(configs, '')).toEqual([{ idc: 'bj' }, { idc: 'all' }, { idc: 'sh' }, {}]);
        expect(selectByIDC(undefined, 'bj')).toEqual([]);
    });
});
