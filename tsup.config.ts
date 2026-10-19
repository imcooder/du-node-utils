import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        string: 'src/string.ts',
        network: 'src/network.ts',
        id: 'src/id.ts',
        data: 'src/data.ts',
        date: 'src/date.ts',
        collection: 'src/collection.ts',
        crypto: 'src/crypto.ts',
        callback: 'src/callback.ts',
        TimeUse: 'src/TimeUse.ts',
        WordsSum: 'src/WordsSum.ts',
        MaskSecret: 'src/MaskSecret.ts',
        RunCommand: 'src/RunCommand.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    target: 'node18',
    platform: 'node',
    treeshake: true,
});
