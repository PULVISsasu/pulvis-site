import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      react,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // inutile avec React 17+
      "react/prop-types": "off", // pas besoin si tu n'utilises pas PropTypes
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettier, // désactive les règles qui clashent avec Prettier
  {
    ignores: ["node_modules", "dist"], // bloc séparé
  },
];
