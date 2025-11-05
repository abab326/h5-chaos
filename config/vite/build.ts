import { type UserConfig } from "vite";
import { isProduction } from "./base";

/**
 * 构建配置
 */
export const createBuildConfig = (): Partial<UserConfig> => {
  return {
    build: {
      cssCodeSplit: true, // 启用 CSS 代码分割
      cssTarget: ["chrome61"], // 针对移动端浏览器优化
      // 优化构建输出
      target: "es2020",
      // Chunk 分包策略
      rollupOptions: {
        output: {
          // 代码分割
          manualChunks: {
            // 把 vue 相关的库打包成一个 chunk
            vue: ["vue", "vue-router"],
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
      sourcemap: !isProduction,
      // 资源哈希 - 用于缓存控制
      manifest: true,
      // 清理输出目录
      emptyOutDir: true,
      // 输出目录
      outDir: "dist",
    },
  };
};
