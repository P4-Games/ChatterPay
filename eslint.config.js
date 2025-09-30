// eslint.config.cjs
const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const nextPlugin = require('@next/eslint-plugin-next')
const perfectionist = require('eslint-plugin-perfectionist')
const unusedImports = require('eslint-plugin-unused-imports')
const prettier = require('eslint-plugin-prettier')

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/public/**',
      '**/scripts/**',
      '**/out/**',
      '**/node_modules/**',
      '**/prisma/**',
      '**/.next/**',
      'next.config.js',
      'vite.config.js',
      'vite.config.ts',
      'src/reportWebVitals.{js,ts}',
      'src/service-worker.{js,ts}',
      'src/serviceWorkerRegistration.{js,ts}',
      'src/setupTests.{js,ts}',
      'commitlint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      perfectionist,
      'unused-imports': unusedImports,
      prettier,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      'no-undef': 0,
      'no-alert': 0,
      camelcase: 0,
      'no-console': 0,
      'no-unused-vars': ['off', { ignoreRestSiblings: true }],
      'no-param-reassign': 0,
      'no-underscore-dangle': 0,
      'no-restricted-exports': 0,
      'react/no-children-prop': 0,
      'react/react-in-jsx-scope': 0,
      'jsx-a11y/anchor-is-valid': 0,
      'react/no-array-index-key': 0,
      'no-promise-executor-return': 0,
      'react/require-default-props': 0,
      'react/jsx-props-no-spreading': 0,
      'react/display-name': 0,
      'import/prefer-default-export': 0,
      'react/function-component-definition': 0,
      '@typescript-eslint/naming-convention': 0,
      'jsx-a11y/control-has-associated-label': 0,
      '@typescript-eslint/no-use-before-define': 0,
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          varsIgnorePattern: '^_|^T$',
          argsIgnorePattern: '^_|^T$',
        },
      ],
      'react/jsx-no-duplicate-props': ['warn', { ignoreCase: false }],

      // hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // fix redeclare
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',

      // unused-imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'off',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // perfectionist
      'perfectionist/sort-named-imports': [
        'warn',
        { order: 'asc', type: 'line-length' },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        { order: 'asc', type: 'line-length' },
      ],
      'perfectionist/sort-exports': [
        'warn',
        { order: 'asc', type: 'line-length' },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          order: 'asc',
          type: 'line-length',
          newlinesBetween: 'always',
          groups: [
            ['builtin', 'external'],
            'custom-mui',
            'custom-routes',
            'custom-hooks',
            'custom-utils',
            'internal',
            'custom-components',
            'custom-sections',
            'custom-types',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          customGroups: {
            value: {
              'custom-mui': '^@mui/',
              'custom-routes': '^src/routes/',
              'custom-hooks': '^src/hooks/',
              'custom-utils': '^src/utils/',
              'custom-components': '^src/components/',
              'custom-sections': '^src/sections/',
              'custom-types': '^src/types/',
            },
          },
          internalPattern: ['^src/'],
        },
      ],
    },
  },

  // type-aware linting solo para TS
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
]
