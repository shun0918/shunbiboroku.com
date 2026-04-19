import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier/flat';
import prettierPlugin from 'eslint-plugin-prettier';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'tmp/**',
      'scripts/**',
      'next-sitemap.config.js',
      'next.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        React: 'writable',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '19.2' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error',
    },
  },
  prettier,
];
