module.exports = {
  root: true,
  env: {
    node: true,
  },
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": '2022',
    "ecmaFeatures": {
      "globalReturn": false,
      "impliedStrict": false,
      "jsx": false
    }
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    "plugin:cypress/recommended"
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-deprecated-html-element-is': 'warn',
    '@typescript-eslint/no-unused-vars': ["warn", { "argsIgnorePattern": "^_" }],
  },
  "overrides": [
    {
      "files": ["**/*.js"],
      "rules": {
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
      }
    }
  ]
}

