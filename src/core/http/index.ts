/**
 * HTTP 客户端主入口
 * 整合所有HTTP请求相关功能
 */

import httpClient from "./request";
import ErrorHandler, { Retryable } from "./errorHandler";
import cancelManager from "./cancelManager";
import cacheManager from "./cacheManager";

// 重新导出所有模块
export { httpClient, ErrorHandler, Retryable, cancelManager, cacheManager };

// 导出默认值
export default {
  // HTTP 客户端实例
  client: httpClient,
  // 错误处理器
  errorHandler: ErrorHandler,
  // 请求取消管理器
  cancelManager,
  // 缓存管理器
  cacheManager,
  // 重试装饰器
  Retryable,

  /**
   * 初始化HTTP客户端
   * @param options 初始化选项
   */
  init(options?: {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    maxConcurrentRequests?: number;
    defaultCacheTime?: number;
  }) {
    // 设置基础配置
    if (options?.baseURL) {
      httpClient.setBaseURL(options.baseURL);
    }

    // 设置默认请求头
    if (options?.headers) {
      httpClient.setDefaultHeaders(options.headers);
    }

    // 设置最大并发请求数
    if (options?.maxConcurrentRequests) {
      cancelManager.setMaxConcurrentRequests(options.maxConcurrentRequests);
    }

    // 设置默认缓存时间
    if (options?.defaultCacheTime) {
      cacheManager.setDefaultExpireTime(options.defaultCacheTime);
    }

    console.log("HTTP Client initialized");
  },

  /**
   * 设置认证令牌
   */
  setAuthToken(token: string | null) {
    httpClient.setAuthToken(token);
  },

  /**
   * 取消所有请求
   */
  cancelAllRequests() {
    cancelManager.cancelAllRequests();
  },

  /**
   * 清空缓存
   */
  clearCache() {
    cacheManager.clear();
  },
};
