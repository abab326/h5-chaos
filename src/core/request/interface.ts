/**
 * 网络请求接口定义
 */

import type { RequestConfig, ResponseData, RequestError } from "./types";

/**
 * 请求管理器接口
 */
export interface IRequestManager {
  /**
   * 发送GET请求
   * @param url 请求URL
   * @param params 请求参数
   * @param config 请求配置
   */
  get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "url" | "method" | "params">
  ): Promise<ResponseData<T>>;

  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>>;

  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>>;

  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   */
  delete<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ResponseData<T>>;

  /**
   * 发送PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>>;

  /**
   * 发送自定义请求
   * @param config 请求配置
   */
  request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;

  /**
   * 设置认证token
   * @param token 认证token
   */
  setAuthToken(token: string): void;

  /**
   * 清除认证token
   */
  clearAuthToken(): void;

  /**
   * 取消指定请求
   * @param requestId 请求标识
   */
  cancelRequest(requestId: string): void;

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void;

  /**
   * 清除缓存
   * @param url 指定URL的缓存，不传则清除所有缓存
   */
  clearCache(url?: string): void;

  /**
   * 获取当前活跃请求数量
   */
  getActiveRequestCount(): number;

  /**
   * 获取当前队列中的请求数量
   */
  getQueuedRequestCount(): number;
}

/**
 * 缓存管理器接口
 */
export interface ICacheManager {
  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param expireTime 过期时间（毫秒）
   */
  set<T = any>(key: string, data: T, expireTime?: number): void;

  /**
   * 获取缓存
   * @param key 缓存键
   */
  get<T = any>(key: string): T | null;

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void;

  /**
   * 清除所有缓存
   */
  clear(): void;

  /**
   * 检查缓存是否存在且未过期
   * @param key 缓存键
   */
  has(key: string): boolean;

  /**
   * 获取缓存大小
   */
  size(): number;
}

/**
 * 请求队列接口
 */
export interface IRequestQueue {
  /**
   * 添加请求到队列
   * @param config 请求配置
   * @param resolve 请求成功回调
   * @param reject 请求失败回调
   */
  add(
    config: RequestConfig,
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ): void;

  /**
   * 从队列中移除请求
   */
  remove(): void;

  /**
   * 获取队列长度
   */
  size(): number;

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean;

  /**
   * 清空队列
   */
  clear(): void;
}

/**
 * 重试策略接口
 */
export interface IRetryStrategy {
  /**
   * 检查是否需要重试
   * @param error 错误信息
   * @param retryCount 当前重试次数
   * @param maxRetries 最大重试次数
   */
  shouldRetry(
    error: RequestError,
    retryCount: number,
    maxRetries: number
  ): boolean;

  /**
   * 获取重试延迟时间
   * @param retryCount 当前重试次数
   */
  getRetryDelay(retryCount: number): number;
}

/**
 * 拦截器管理器接口
 */
export interface IInterceptorManager {
  /**
   * 添加请求拦截器
   * @param onFulfilled 成功回调
   * @param onRejected 失败回调
   */
  useRequestInterceptor(
    onFulfilled?: (
      config: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>,
    onRejected?: (error: any) => any
  ): number;

  /**
   * 添加响应拦截器
   * @param onFulfilled 成功回调
   * @param onRejected 失败回调
   */
  useResponseInterceptor(
    onFulfilled?: (
      response: ResponseData
    ) => ResponseData | Promise<ResponseData>,
    onRejected?: (error: RequestError) => any
  ): number;

  /**
   * 移除拦截器
   * @param id 拦截器ID
   */
  ejectInterceptor(id: number): void;

  /**
   * 清空所有拦截器
   */
  clearInterceptors(): void;
}
