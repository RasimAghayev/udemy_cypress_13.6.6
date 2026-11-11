const globals = require('globals');
const pluginCypress = require('eslint-plugin-cypress');
const pluginJson = require('eslint-plugin-json');

const toGlobals = obj => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === false || value === true) {
      result[key] = value ? 'writable' : 'readonly';
    } else if (value && typeof value === 'object') {
      result[key] = value.readonly ? 'readonly' : value.writable ? 'writable' : 'off';
    } else {
      result[key] = 'readonly';
    }
  }
  return result;
};

module.exports = [
  {
    ignores: [
      'node_modules/',
      'cypress/reports/',
      'cypress/videos/',
      'cypress/screenshots/',
      'cypress/downloads/',
      'cypress/test-results/',
      'cypress/fixtures/',
      '.gitleaks-staged-tmp/',
      'gitleaks-report.json',
      'package-lock.json',
      'renovate.json',
      '.prettierrc.json',
      'package.json',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...toGlobals(globals.browser),
        ...toGlobals(globals.node),
        ...toGlobals(globals.mocha),
        ...pluginCypress.environments.globals.globals,
      },
    },
    plugins: {
      cypress: pluginCypress,
      json: pluginJson,
    },
    rules: {
      ...pluginCypress.configs.recommended.rules,
      'cypress/unsafe-to-chain-command': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^[_$]' }],
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.json'],
    plugins: {
      json: pluginJson,
    },
    rules: {
      ...pluginJson.configs.recommended.rules,
    },
  },
];
