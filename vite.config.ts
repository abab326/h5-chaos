import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import postcsspxtoviewport from "postcss-px-to-viewport-8-plugin";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          viewportWidth: 375, // 设计稿宽度
          unitToConvert: "px", // 需要转换的单位
          viewportUnit: "vw", // 转换后的单位
          fontViewportUnit: "vw", // 字体转换后的单位
          unitPrecision: 5, // 转换精度
          propList: ["*"], // 需要转换的属性列表，* 表示所有
          selectorBlackList: [".ignore", ".hairlines"], // 不转换的选择器
          minPixelValue: 1, // 最小转换值
          mediaQuery: false, // 媒体查询中的 px 是否转换
          replace: true, // 是否直接替换值
          exclude: [/node_modules/], // 排除的文件
          include: undefined, // 包含的文件
          landscape: false, // 是否处理横屏
          landscapeUnit: "vw", // 横屏单位
          landscapeWidth: 375, // 横屏宽度
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
