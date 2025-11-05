import { type UserConfig, type ConfigEnv } from "vite";

const devProxy = {
  // 示例：将 /api 代理到后端服务
  "/api": {
    target: "http://localhost:3000", // 后端服务地址
    changeOrigin: true, // 改变源
    rewrite: (path: string) => path.replace(/^\/api/, ""), // 重写路径
  },
};
/**
 * 开发服务器配置
 */
export const createServerConfig = ({
  command,
}: ConfigEnv): Partial<UserConfig> => {
  return {
    server: {
      // 自动打开浏览器
      open: true,
      // 端口号
      port: 5173,
      // 代理配置
      proxy: command === "serve" ? devProxy : {},
    },
  };
};
