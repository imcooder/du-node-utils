import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ['src/**/*.ts', 'test/**/*.ts'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            'no-console': 'off',
        },
    },
);
