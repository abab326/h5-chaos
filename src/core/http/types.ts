/**
 * HTTP 客户端类型定义
 */

import type { InternalAxiosRequestConfig, AxiosRequestConfig } from "axios";

export interface CommonConfig {
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
  // 是否跳过重复请求检查
  skipDuplicateCheck?: boolean;
  // 是否跳过并发控制
  skipConcurrencyControl?: boolean;
}
/**
 * 请求配置扩展
 */
export type RequestConfig = InternalAxiosRequestConfig & CommonConfig;

export type ApiRequestConfig = AxiosRequestConfig & CommonConfig;
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
 * 请求管理类接口，约定要实现的功能
 *
 */
export interface AxiosRequestManager {
  /**
   * 生成请求键
   * @param config 请求配置
   * @returns 请求键
   */
  generateKey(config: RequestConfig): string;
  /**
   * 缓存请求数据
   * @param config 请求配置
   * @param item 缓存项
   */
  setCacheData(config: RequestConfig, item: CacheItem): void;
  /**
   * 获取缓存请求数据
   * @param config 请求配置
   * @returns 缓存项
   */
  getCacheData(config: RequestConfig): CacheItem | null;
  /**
   * 检查请求是否已缓存
   * @param config 请求配置
   * @returns 是否已缓存
   */
  hasCacheData(config: RequestConfig): boolean;
  /**
   * 清除过期缓存请求
   */
  clearExpiredCache(): void;
  /**
   * 清除所有缓存请求
   */
  clearAllCache(): void;
  /**
   * 取消请求
   * @param config 请求配置
   */
  cancelRequest(config: RequestConfig): void;
  // 并发控制执行请求
  executeRequest<T = any>(config: RequestConfig): Promise<T>;
  /**
   * 取消所有请求
   *
   */
  cancelAllRequests(): void;
}

/**
 * HTTP 客户端接口
 */
export interface HttpClient {
  // 请求方法
  request<T = any>(config: ApiRequestConfig): Promise<[error: any, T | null]>;
  get<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]>;
  post<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]>;
  put<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]>;
  delete<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]>;

  // 请求取消
  cancelRequest(requestKey: string | number): void;
  cancelAllRequests(): void;
}
