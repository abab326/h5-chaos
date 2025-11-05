import type { UserConfig, ConfigEnv } from "vite";
import { resolve } from "path";

/**
 * 基础配置
 */
export const createBaseConfig = ({
  command,
}: ConfigEnv): Partial<UserConfig> => {
  return {
    resolve: {
      alias: {
        "@": resolve(__dirname, "../../src"),
      },
    },
    esbuild: {
      target: "es2020",
      drop: command === "build" ? ["console", "debugger"] : [],
    },
  };
};
