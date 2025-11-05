/**
 * HTTP 客户端类型定义
 */

import type { AxiosRequestConfig } from "axios";

/**
 * 请求配置扩展
 */
export interface RequestConfig extends AxiosRequestConfig {
  // 是否需要认证令牌
  requiresAuth?: boolean;
  // 是否显示加载状态
  showLoading?: boolean;
  // 错误处理方式
  errorHandler?: "auto" | "custom" | "none";
  // 重试次数
  retryCount?: number;
  // 当前重试次数
  currentRetry?: number;
  // 缓存配置
  cache?: {
    // 是否启用缓存
    enabled: boolean;
    // 缓存过期时间（毫秒）
    expireTime?: number;
  };
}

/**
 * 响应数据结构
 */
export interface ApiResponse<T = any> {
  // 状态码
  code: number;
  // 消息
  message: string;
  // 数据
  data: T;
  // 是否成功
  success: boolean;
}

/**
 * 错误响应数据结构
 */
export interface ErrorResponse {
  // 错误码
  errorCode?: string | number;
  // 错误消息
  errorMessage: string;
  // 原始错误
  originalError?: any;
}
/**
 * 请求记录接口
 */
export interface RequestRecord {
  key: string | number;
  cancel: () => void;
  timestamp: number;
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expireTime: number;
}

/**
 * HTTP 客户端接口
 */
export interface HttpClient {
  // 请求方法
  request<T = any>(config: RequestConfig): Promise<T>;
  get<T = any>(url: string, config?: RequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;

  // 请求取消相关
  cancelRequest(requestKey: string | number): void;
  cancelAllRequests(): void;
}
