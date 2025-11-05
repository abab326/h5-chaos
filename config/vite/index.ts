import { defineConfig, type UserConfig, mergeConfig } from "vite";
import { buildPlugins } from "./plugins";
import { createBaseConfig } from "./base";
import { createServerConfig } from "./server";
import { createBuildConfig } from "./build";
import { createCssConfig } from "./css";

/**
 * 合并配置对象
 */
const mergeConfigs = (...configs: Partial<UserConfig>[]): UserConfig => {
  return configs.reduce((merged, config) => {
    return mergeConfig(merged, config);
  }, {}) as UserConfig;
};

/**
 * 构建完整的用户配置
 */
const buildUserConfig = ({
  command,
  mode,
}: {
  command: "build" | "serve";
  mode: string;
}): UserConfig => {
  // 创建基础配置
  const baseConfig = createBaseConfig({ command, mode });
  const serverConfig = createServerConfig({ command, mode });
  const buildConfig = createBuildConfig({ command, mode });
  const cssConfig = createCssConfig({ command, mode });
  const pluginsConfig = buildPlugins({ command, mode });
  // 合并所有配置
  const mergedConfig = mergeConfigs(
    baseConfig,
    serverConfig,
    buildConfig,
    cssConfig,
    pluginsConfig
  );

  return mergedConfig;
};

/**
 * 导出 Vite 配置
 */
export default defineConfig(({ command, mode }) => {
  return buildUserConfig({ command, mode });
});
