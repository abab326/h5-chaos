import { type UserConfig } from "vite";

/**
 * 开发服务器配置
 */
export const createServerConfig = (): Partial<UserConfig> => {
  return {
    server: {
      // 热重载配置
      hmr: {
        overlay: true, // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖
        timeout: 3000, // 热重载超时时间
      },
      // 自动打开浏览器
      open: false,
      // 端口号
      port: 5173,
      // 代理配置
      proxy: {
        // 示例：将 /api 代理到后端服务
        "/api": {
          target: "http://localhost:3000", // 后端服务地址
          changeOrigin: true, // 改变源
          rewrite: (path) => path.replace(/^\/api/, ""), // 重写路径
        },
      },
    },
  };
};
