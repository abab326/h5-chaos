import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcssPlugin from "@tailwindcss/vite";
import postcsspxtoviewport from "postcss-px-to-viewport-8-plugin";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcssPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          viewportWidth: 375,
          unitToConvert: "px",
          viewportUnit: "vw",
          fontViewportUnit: "vw",
          unitPrecision: 5,
          propList: ["*"],
          selectorBlackList: [],
          minPixelValue: 1,
          mediaQuery: false,
          replace: true,
          exclude: [/node_modules\/\.vite/, /src/], // 排除src目录，只转换node_modules中的第三方组件库
          landscape: false,
        }),
      ],
    },
    preprocessorOptions: {
      less: {
        math: "always",
        globalVars: {
          // 可以在这里定义全局less变量
        },
      },
    },
  },
});
