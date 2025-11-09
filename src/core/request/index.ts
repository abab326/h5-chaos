/**
 * 网络请求管理模块统一导出
 */

// 导出类型定义
export type {
  RequestConfig,
  ResponseData,
  RequestError,
  RequestMethod,
  InterceptorConfig,
  RequestManagerConfig,
  CacheItem,
  RequestQueueItem,
} from "./types";

// 导出接口定义
export type {
  IRequestManager,
  ICacheManager,
  IRequestQueue,
  IRetryStrategy,
  IInterceptorManager,
} from "./interface";

// 导出核心实现类
export { RequestManager, createRequestManager } from "./manager";

// 导出缓存管理器
export { CacheManager, createCacheManager } from "./cache";

// 导出请求队列
export { RequestQueue, createRequestQueue } from "./queue";

// 导出重试策略
export {
  RetryStrategy,
  createRetryStrategy,
  defaultRetryStrategy,
} from "./retry";

// 导出拦截器管理器
export { InterceptorManager, createInterceptorManager } from "./interceptor";

// 导入默认请求管理器
import { defaultRequestManager } from "./manager";
import type { RequestConfig, ResponseData } from "./types";

/**
 * 便捷请求方法 - 使用默认请求管理器
 */

/**
 * 发送GET请求
 */
export const get = async <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Omit<RequestConfig, "url" | "method" | "params">
): Promise<ResponseData<T>> => {
  return defaultRequestManager.get<T>(url, params, config);
};

/**
 * 发送POST请求
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: Omit<RequestConfig, "url" | "method" | "data">
): Promise<ResponseData<T>> => {
  return defaultRequestManager.post<T>(url, data, config);
};

/**
 * 发送PUT请求
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: Omit<RequestConfig, "url" | "method" | "data">
): Promise<ResponseData<T>> => {
  return defaultRequestManager.put<T>(url, data, config);
};

/**
 * 发送DELETE请求
 */
export const del = async <T = any>(
  url: string,
  config?: Omit<RequestConfig, "url" | "method">
): Promise<ResponseData<T>> => {
  return defaultRequestManager.delete<T>(url, config);
};

/**
 * 发送PATCH请求
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: Omit<RequestConfig, "url" | "method" | "data">
): Promise<ResponseData<T>> => {
  return defaultRequestManager.patch<T>(url, data, config);
};

/**
 * 发送自定义请求
 */
export const request = async <T = any>(
  config: RequestConfig
): Promise<ResponseData<T>> => {
  return defaultRequestManager.request<T>(config);
};

/**
 * 设置认证token
 */
export const setAuthToken = (token: string): void => {
  defaultRequestManager.setAuthToken(token);
};

/**
 * 清除认证token
 */
export const clearAuthToken = (): void => {
  defaultRequestManager.clearAuthToken();
};

/**
 * 取消指定请求
 */
export const cancelRequest = (requestId: string): void => {
  defaultRequestManager.cancelRequest(requestId);
};

/**
 * 取消所有请求
 */
export const cancelAllRequests = (): void => {
  defaultRequestManager.cancelAllRequests();
};

/**
 * 清除缓存
 */
export const clearCache = (url?: string): void => {
  defaultRequestManager.clearCache(url);
};

/**
 * 获取请求统计信息
 */
export const getRequestStats = () => {
  return defaultRequestManager.getStats();
};

/**
 * 默认导出 - 默认请求管理器
 */
export default defaultRequestManager;
