export type SchemaFieldType = 'string' | 'int' | 'bool';

export interface SchemaField {
    type: SchemaFieldType;
}

export type Schema = Record<string, SchemaField>;

export type ParsedData = Record<string, string | number | boolean>;

/** Coerce `rawData` fields to the types declared in `schema`; unknown keys and unconvertible values are logged and dropped. */
export function parseData(rawData: Record<string, unknown>, schema: Schema): ParsedData {
    const expectData: ParsedData = {};
    for (const [key, value] of Object.entries(rawData ?? {})) {
        if (key === '') {
            continue;
        }
        const field = Object.prototype.hasOwnProperty.call(schema, key) ? schema[key] : undefined;
        if (!field) {
            console.error('unknown data in db:%s', key);
            continue;
        }
        switch (field.type) {
            case 'string':
                if (typeof value === 'string') {
                    expectData[key] = value;
                } else if (value === null || value === undefined) {
                    console.error('bad string format key:%s value:%s', key, value);
                } else {
                    expectData[key] = String(value);
                }
                break;
            case 'int':
                expectData[key] = parseInt(String(value), 10);
                break;
            case 'bool':
                if (typeof value === 'boolean') {
                    expectData[key] = value;
                } else if (value === 'true') {
                    expectData[key] = true;
                } else if (value === 'false') {
                    expectData[key] = false;
                } else {
                    console.error('bad boolean format key:%s value:%s', key, value);
                }
                break;
        }
    }
    return expectData;
}

export interface ParsedArgs {
    main?: string | undefined;
    [key: string]: string | number | undefined;
}

/**
 * Parse `process.argv`-style arguments: `argv[1]` becomes `main`, each later `--key=value`
 * (any number of leading dashes) becomes `key: value`. Values without a `.` that parse as a
 * number are coerced, so a bare flag or an empty value becomes `0`.
 */
export function parseArgs(args: readonly string[]): ParsedArgs {
    const argsMap: ParsedArgs = {};
    if (args.length < 1) {
        return argsMap;
    }
    const mainPos = 1;
    argsMap.main = args[mainPos];
    for (let i = mainPos + 1; i < args.length; i++) {
        const arg = args[i] ?? '';
        const sep = arg.indexOf('=');
        let key = arg;
        let value: string | number = '';
        if (sep !== -1) {
            key = arg.slice(0, sep).replace(/^-+/, '');
            value = arg.slice(sep + 1);
        }
        if (!Number.isNaN(Number(value)) && !value.includes('.')) {
            value = Number(value);
        }
        argsMap[key] = value;
    }
    return argsMap;
}
