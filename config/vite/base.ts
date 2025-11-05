import { type UserConfig } from "vite";
import { resolve } from "path";

// 获取当前环境
export const isProduction = process.env.NODE_ENV === "production";

/**
 * 基础配置
 */
export const createBaseConfig = (): Partial<UserConfig> => {
  return {
    resolve: {
      alias: {
        "@": resolve(__dirname, "../../src"),
      },
    },
    esbuild: {
      target: "es2020", // 针对移动端优化的目标
      // 压缩相关配置
      drop: isProduction ? ["console", "debugger"] : [],
    },
  };
};
