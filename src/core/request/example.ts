/**
 * 网络请求管理功能使用示例
 */

import {
  // 核心请求管理器
  createRequestManager,

  // 便捷请求方法
  get,
  post,
  put,
  request,

  // 工具函数
  setAuthToken,
  clearAuthToken,
  clearCache,
  getRequestStats,
} from "./index";
import type { RequestConfig } from "./types";

/**
 * 示例1: 基本使用 - 使用便捷方法
 */
export async function exampleBasicUsage() {
  try {
    // GET请求示例
    const userResponse = await get<{ id: number; name: string }>(
      "/api/users/1",
      {
        include: "profile",
      }
    );

    console.log("用户数据:", userResponse.data);

    // POST请求示例
    const createResponse = await post<{ id: number }>("/api/users", {
      name: "张三",
      email: "zhangsan@example.com",
    });

    console.log("创建用户结果:", createResponse.data);

    // PUT请求示例
    const updateResponse = await put<{ success: boolean }>("/api/users/1", {
      name: "李四",
    });

    console.log("更新用户结果:", updateResponse.data);
  } catch (error) {
    console.error("请求失败:", error);
  }
}

/**
 * 示例2: 自定义配置请求
 */
export async function exampleCustomConfig() {
  const config: RequestConfig = {
    url: "/api/data",
    method: "GET",
    params: { page: 1, size: 10 },

    // 启用缓存，缓存10分钟
    cache: true,
    cacheTime: 10 * 60 * 1000,

    // 启用重试，最大重试3次
    retry: true,
    maxRetries: 3,

    // 自定义超时时间
    timeout: 15000,

    // 自定义请求头
    headers: {
      "X-Custom-Header": "custom-value",
    },
  };

  try {
    const response = await request(config);
    console.log("自定义配置请求结果:", response.data);
  } catch (error) {
    console.error("自定义配置请求失败:", error);
  }
}

/**
 * 示例3: 创建自定义请求管理器实例
 */
export function exampleCustomManager() {
  // 创建自定义配置的请求管理器
  const customManager = createRequestManager({
    baseURL: "https://api.example.com",
    timeout: 20000,
    maxConcurrent: 3, // 最大并发数设为3
    headers: {
      "Content-Type": "application/json",
      "X-App-Version": "1.0.0",
    },
    enableLog: true, // 启用请求日志
  });

  // 设置认证token
  customManager.setAuthToken("your-auth-token-here");

  return customManager;
}

/**
 * 示例4: 认证相关操作
 */
export function exampleAuthOperations() {
  // 设置全局认证token
  setAuthToken("global-auth-token");

  // 执行一些需要认证的请求...

  // 清除认证token
  clearAuthToken();
}

/**
 * 示例5: 请求取消和缓存管理
 */
export async function exampleCancelAndCache() {
  const requestId = "unique-request-id";

  try {
    // 发送一个可取消的请求
    const response = await request({
      url: "/api/long-running",
      requestId: requestId,
      timeout: 30000,
    });

    console.log("长请求结果:", response.data);
  } catch (error) {
    if ((error as any).message === "请求被取消") {
      console.log("请求被主动取消");
    } else {
      console.error("请求失败:", error);
    }
  }

  // 在需要的时候取消请求
  // cancelRequest(requestId)

  // 清除特定URL的缓存
  clearCache("/api/data");

  // 清除所有缓存
  clearCache();
}

/**
 * 示例6: 获取请求统计信息
 */
export function exampleRequestStats() {
  const stats = getRequestStats();
  console.log("请求统计信息:", stats);

  // 输出示例:
  // {
  //   activeRequests: 2,
  //   queuedRequests: 0,
  //   currentConcurrent: 2,
  //   maxConcurrent: 5,
  //   cacheSize: 15
  // }
}

/**
 * 示例7: 并发请求控制演示
 */
export async function exampleConcurrentControl() {
  // 创建多个并发请求
  const requests = Array.from({ length: 10 }, (_, i) =>
    get(`/api/items/${i}`, undefined, {
      requestId: `item-${i}`,
    })
  );

  try {
    // 使用Promise.all发送并发请求（会自动受到并发控制）
    const results = await Promise.all(requests);
    console.log(`成功完成 ${results.length} 个并发请求`);
  } catch (error) {
    console.error("并发请求失败:", error);
  }
}

/**
 * 示例8: 错误处理和重试机制
 */
export async function exampleErrorHandling() {
  try {
    // 这个请求会失败并自动重试
    const response = await get("/api/unstable-endpoint", undefined, {
      retry: true,
      maxRetries: 3,
      retryDelay: 1000, // 自定义重试延迟
    });

    console.log("最终请求成功:", response.data);
  } catch (error) {
    console.error("请求最终失败，已重试3次:", error);
  }
}

/**
 * 示例9: 在Vue组件中使用
 */
export const exampleVueComponent = {
  data() {
    return {
      users: [],
      loading: false,
      error: null,
    };
  },

  methods: {
    async loadUsers() {
      (this as any).loading = true;
      (this as any).error = null;

      try {
        const response = await get<Array<{ id: number; name: string }>>(
          "/api/users",
          {
            page: 1,
            size: 10,
          },
          {
            loading: true, // 显示加载状态
            cache: true, // 启用缓存
          }
        );

        (this as any).users = response.data;
      } catch (error) {
        (this as any).error = (error as any).message;
      } finally {
        (this as any).loading = false;
      }
    },

    async createUser(userData: { name: string; email: string }) {
      try {
        const response = await post("/api/users", userData);

        // 创建成功后清除用户列表缓存
        clearCache("/api/users");

        return response.data;
      } catch (error) {
        console.error("创建用户失败:", error);
        throw error;
      }
    },
  },

  mounted() {
    (this as any).loadUsers();
  },
};

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log("=== 网络请求管理功能示例 ===");

  await exampleBasicUsage();
  await exampleCustomConfig();
  await exampleConcurrentControl();
  await exampleErrorHandling();

  exampleAuthOperations();
  exampleRequestStats();

  console.log("=== 示例运行完成 ===");
}

// 导出所有示例
export default {
  exampleBasicUsage,
  exampleCustomConfig,
  exampleCustomManager,
  exampleAuthOperations,
  exampleCancelAndCache,
  exampleRequestStats,
  exampleConcurrentControl,
  exampleErrorHandling,
  exampleVueComponent,
  runAllExamples,
};
