// eslint.config.js
import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      import: pluginImport,
      'simple-import-sort': simpleImportSort,
      sonarjs,
    },
    rules: {
      // ⚙️ Reglas base recomendadas de ESLint
      ...js.configs.recommended.rules,

      // ✅ Buenas prácticas
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-debugger': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-shadow': 'error',
      'no-undef': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],

      // 💅 Estilo y formato
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'only-multiline'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'eol-last': ['error', 'always'],

      // 🧠 Código innecesario
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/no-relative-parent-imports': 'error',

      // 📦 Organización de imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/newline-after-import': 'error',

      // 🔍 Reglas de calidad de código (sonarjs)
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-useless-catch': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15], 
    },
  },
];
