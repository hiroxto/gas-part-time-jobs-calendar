module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    'googleappsscript/googleappsscript': true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
    'promise',
    'googleappsscript',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-new': 'off',
    indent: ['error', 2],
    'promise/catch-or-return': ['error', { allowThen: true, terminationMethod: ['catch', 'asCallback', 'finally'] }],
  },
};
