import { defineConfig } from "eslint/config";
import vue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  // 忽略文件
  {
    ignores: ["node_modules/**", "dist/**", "public/**"],
  },

  // Vue配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: {
          ts: tsParser,
        },
      },
    },
    plugins: {
      vue,
    },
    extends: [vue.configs["flat/recommended"]],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },

  // TypeScript配置
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier配置
  prettierRecommended,
  {
    rules: {
      "prettier/prettier": "error",
    },
  },
]);
