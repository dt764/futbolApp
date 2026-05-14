import js from "@eslint/js";
import globals from "globals";
import pluginSecurity from "eslint-plugin-security";
import pluginNode from "eslint-plugin-n";

export default [
  js.configs.recommended,
  pluginSecurity.configs.recommended,
  pluginNode.configs["flat/recommended"],
  
  {
    // Configuramos el plugin de Node para que sea menos estricto con los imports de desarrollo
    settings: {
      n: {
        allowModules: ["@eslint/js", "globals", "eslint-plugin-security", "eslint-plugin-n"]
      }
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
      // Esta regla es la que está causando el ruido; le decimos que ignore los devDependencies
      "n/no-unpublished-import": "off" 
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
      "security/detect-non-literal-fs-filename": "off",
      "n/no-unpublished-import": "off"
    }
  },
];