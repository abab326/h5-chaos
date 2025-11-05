import type { PluginOption, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcssPlugin from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * 构建插件配置
 */
export const buildPlugins = ({
  command,
}: {
  command: "build" | "serve";
  mode: string;
}): UserConfig => {
  const plugins: PluginOption[] = [vue(), tailwindcssPlugin()];

  // 生产环境构建时添加可视化插件
  if (command === "build") {
    plugins.push(
      visualizer({
        open: true, // 自动打开报告
        gzipSize: true, // 启用 gzip 压缩大小统计
        brotliSize: true, // 启用 brotli 压缩大小统计
        filename: "report.html", // 生成的报告文件名
      })
    );
  }

  return {
    plugins,
  };
};
