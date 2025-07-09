const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    ignores: ["public/assets/**"],
  },
  {
    languageOptions: {
      globals: globals.node
    }
  },
  pluginJs.configs.recommended,
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      // Add your custom rules here
    }
  }
];