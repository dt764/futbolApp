import js from "@eslint/js";
import globals from "globals";
import pluginSecurity from "eslint-plugin-security";
import pluginNode from "eslint-plugin-n";

export default [
  js.configs.recommended,
  pluginSecurity.configs.recommended,
  pluginNode.configs["flat/recommended"],
  
  {
    settings: {
      n: {
        version: ">=22.0.0",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",
      "n/no-process-exit": "error",
      "n/handle-callback-err": "error",
    },
  },

  {
    files: ["eslint.config.js"],
    rules: {
      "n/no-unpublished-import": "off",
    },
  },

  {
    files: ["**/*.test.js", "**/*.spec.js", "**/tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "n/no-unpublished-import": "off",
      "n/no-unpublished-require": "off",
    },
  },

  {
    files: ["**/__mocks__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];