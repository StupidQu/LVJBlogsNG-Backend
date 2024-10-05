import pluginJs from '@eslint/js';
import globals from 'globals';

export default [
    pluginJs.configs.recommended,
    {
        files: ['src/**/*.js'],
        rules: {
            semi: 'error',
            quotes: ['error', 'single'],
            'prefer-const': 'error',
        },
        languageOptions: {
            globals: {
                ...globals.node,
            }
        }
    }
];