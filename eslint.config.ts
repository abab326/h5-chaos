import { defineConfig } from "eslint/config";
import vue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  // 忽略文件
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "public/**",
      ".eslintrc.*",
      "prettier.config.*",
    ],
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
      // 禁用可能与prettier冲突的规则
      "vue/html-indent": "off",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
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
      // 禁用可能与prettier冲突的规则
      "@typescript-eslint/indent": "off",
    },
  },

  // 先应用eslint-config-prettier来禁用所有可能与prettier冲突的ESLint规则
  eslintConfigPrettier,

  // 然后应用prettier插件作为最后一个扩展
  {
    ...prettierRecommended,
    rules: {
      ...prettierRecommended.rules,
      "prettier/prettier": [
        "error",
        {
          // 确保与prettier.config.mjs保持一致
          usePrettierrc: true,
        },
      ],
    },
  },
]);
