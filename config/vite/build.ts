import { type UserConfig, type ConfigEnv } from "vite";

/**
 * 构建配置
 */
export const createBuildConfig = ({
  command,
}: ConfigEnv): Partial<UserConfig> => {
  return {
    build: {
      cssCodeSplit: true,
      cssTarget: ["chrome61", "safari14", "edge88", "firefox78"],
      // 优化构建输出
      target: "es2020",
      chunkSizeWarningLimit: 1000, // 2MB 警告阈值
      // Chunk 分包策略
      rollupOptions: {
        output: {
          // 代码分割
          manualChunks: {
            "vue-vendor": ["vue", "vue-router", "pinia"],
            "ui-library": ["tdesign-mobile-vue"],
            "vueuse-vendor": ["@vueuse/core"],
            "utils-vendor": ["axios", "dayjs", "lodash-es"],
          },
          // 输出格式配置
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
      // 资源压缩配置
      minify: true, // 使用默认的esbuild压缩
      // 根据环境启用源映射
      sourcemap: command !== "build",
      // 资源哈希 - 用于缓存控制
      manifest: true,
      // 清理输出目录
      emptyOutDir: true,
      // 输出目录
      outDir: "dist",
    },
  };
};
