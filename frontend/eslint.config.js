import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/jsx-uses-react': 'error',     // Mark React as used when JSX is present
      'react/jsx-uses-vars': 'error',      // Mark variables used in JSX as used
      'react/react-in-jsx-scope': 'off',   // Not needed with React 17+ JSX transform
      'react/prop-types': 'off',           // Using runtime checks instead of PropTypes
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-key': 'warn',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General quality rules
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-console': ['warn', {
        allow: ['warn', 'error'],          // Allow console.warn and console.error
      }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-template-curly-in-string': 'warn',
      'prefer-const': 'warn',
      'eqeqeq': ['warn', 'always'],
      'no-var': 'error',
    },
  },
  {
    // Ignore built output and node_modules
    ignores: ['dist/**', 'node_modules/**', '*.config.*'],
  },
];
