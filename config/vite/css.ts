import { type UserConfig, type ConfigEnv } from "vite";
import postcssPxToViewport from "postcss-px-to-viewport-8-plugin";

const pxToVwPlugin = postcssPxToViewport({
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
});
/**
 * CSS配置
 */
export const createCssConfig = ({}: ConfigEnv): Partial<UserConfig> => {
  return {
    css: {
      postcss: {
        plugins: [pxToVwPlugin],
      },
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/styles/global.less";`,
        },
      },
    },
  };
};
