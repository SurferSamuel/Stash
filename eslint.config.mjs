import stylistic from "@stylistic/eslint-plugin";
import reactLint from "eslint-plugin-react";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    files: ["**/*.{ts,tsx}"],
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: true,
    jsx: true,
    quoteProps: "as-needed",
    arrowParens: "as-needed",
    braceStyle: "1tbs",
  }),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactLint.configs.flat["jsx-runtime"],
  {
    ignores: ["node_modules/", "src-tauri/", "dist/"],
  },
  {
    rules: {
      "@stylistic/jsx-one-expression-per-line": "off",
      "@stylistic/no-multi-spaces": ["error", { ignoreEOLComments: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
