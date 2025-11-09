/**
 * 网络请求管理器
 */

import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";
import type {
  RequestConfig,
  ResponseData,
  RequestError,
  RequestManagerConfig,
} from "./types";
import type { IRequestManager } from "./interface";
import { CacheManager } from "./cache";
import { RequestQueue } from "./queue";
import { RetryStrategy } from "./retry";
import { InterceptorManager } from "./interceptor";

/**
 * 请求管理器实现类
 */
export class RequestManager implements IRequestManager {
  private axiosInstance: AxiosInstance;
  private cacheManager: CacheManager;
  private requestQueue: RequestQueue;
  private retryStrategy: RetryStrategy;
  private interceptorManager: InterceptorManager;
  private config: RequestManagerConfig;

  private activeRequests: Map<string, CancelTokenSource>;
  private authToken: string | null;
  private maxConcurrent: number;
  private currentConcurrent: number;

  constructor(config: RequestManagerConfig = {}) {
    this.config = {
      baseURL: config.baseURL || "",
      timeout: config.timeout || 10000,
      maxConcurrent: config.maxConcurrent || 5,
      headers: config.headers || {},
      interceptors: config.interceptors,
      enableLog: config.enableLog || false,
    };

    // 初始化组件
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    this.cacheManager = new CacheManager(5 * 60 * 1000); // 默认5分钟缓存
    this.requestQueue = new RequestQueue();
    this.retryStrategy = new RetryStrategy();
    this.interceptorManager = new InterceptorManager();

    // 初始化状态
    this.activeRequests = new Map();
    this.authToken = null;
    this.maxConcurrent = this.config.maxConcurrent || 5;
    this.currentConcurrent = 0;

    // 设置默认拦截器
    this.setupDefaultInterceptors();

    // 设置自定义拦截器
    if (this.config.interceptors) {
      this.setupCustomInterceptors();
    }
  }

  /**
   * 发送GET请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, "url" | "method" | "params">
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: "GET",
      params,
      ...config,
    });
  }

  /**
   * 发送POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: "POST",
      data,
      ...config,
    });
  }

  /**
   * 发送PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: "PUT",
      data,
      ...config,
    });
  }

  /**
   * 发送DELETE请求
   */
  async delete<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...config,
    });
  }

  /**
   * 发送PATCH请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      url,
      method: "PATCH",
      data,
      ...config,
    });
  }

  /**
   * 发送自定义请求
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    // 生成请求ID
    const requestId = config.requestId || this.generateRequestId(config);

    // 检查缓存
    if (config.cache !== false) {
      const cacheKey = this.generateCacheKey(config);
      const cachedData = this.cacheManager.get<ResponseData<T>>(cacheKey);

      if (cachedData) {
        return cachedData;
      }
    }

    // 检查并发限制
    if (this.currentConcurrent >= this.maxConcurrent) {
      return new Promise<ResponseData<T>>((resolve, reject) => {
        this.requestQueue.add(config, resolve, reject);
      });
    }

    // 执行请求
    this.currentConcurrent++;

    try {
      const response = await this.executeRequest<T>(config, requestId);

      // 缓存响应数据
      if (config.cache !== false) {
        const cacheKey = this.generateCacheKey(config);
        const cacheTime = config.cacheTime || 5 * 60 * 1000; // 默认5分钟
        this.cacheManager.set(cacheKey, response, cacheTime);
      }

      return response;
    } finally {
      this.currentConcurrent--;
      this.processQueue();
    }
  }

  /**
   * 执行实际请求
   */
  private async executeRequest<T = any>(
    config: RequestConfig,
    requestId: string
  ): Promise<ResponseData<T>> {
    // 创建取消令牌
    const cancelTokenSource = axios.CancelToken.source();
    this.activeRequests.set(requestId, cancelTokenSource);

    try {
      // 转换配置格式
      const axiosConfig: AxiosRequestConfig = this.convertToAxiosConfig(config);
      axiosConfig.cancelToken = cancelTokenSource.token;

      // 执行请求（支持重试）
      const response = await this.retryStrategy.executeWithRetry<AxiosResponse>(
        () => this.axiosInstance.request(axiosConfig),
        config.maxRetries,
        (retryCount, error) => {
          if (this.config.enableLog) {
            console.log(
              `[Retry] ${config.url} 第${retryCount}次重试，错误:`,
              error.message
            );
          }
        }
      );

      // 转换响应格式
      return this.convertToResponseData<T>(response);
    } catch (error) {
      // 规范化错误对象
      throw this.normalizeError(error);
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * 处理请求队列
   */
  private processQueue(): void {
    while (
      this.currentConcurrent < this.maxConcurrent &&
      !this.requestQueue.isEmpty()
    ) {
      const queueItem = this.requestQueue.remove();

      if (queueItem) {
        this.currentConcurrent++;

        this.request(queueItem.config)
          .then(queueItem.resolve)
          .catch(queueItem.reject)
          .finally(() => {
            this.currentConcurrent--;
            this.processQueue();
          });
      }
    }
  }

  /**
   * 设置认证token
   */
  setAuthToken(token: string): void {
    this.authToken = token;

    // 重新创建axios实例以清除所有拦截器
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
    this.setupDefaultInterceptors();
    this.setupCustomInterceptors();
  }

  /**
   * 清除认证token
   */
  clearAuthToken(): void {
    this.authToken = null;

    // 重新创建axios实例以清除所有拦截器
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
    this.setupDefaultInterceptors();
    this.setupCustomInterceptors();
  }

  /**
   * 取消指定请求
   */
  cancelRequest(requestId: string): void {
    // 取消活跃请求
    const cancelTokenSource = this.activeRequests.get(requestId);
    if (cancelTokenSource) {
      cancelTokenSource.cancel("请求被取消");
      this.activeRequests.delete(requestId);
    }

    // 取消队列中的请求
    this.requestQueue.removeItemByRequestId(requestId);
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    // 取消所有活跃请求
    this.activeRequests.forEach((cancelTokenSource) => {
      cancelTokenSource.cancel("所有请求被取消");
    });
    this.activeRequests.clear();

    // 清空请求队列
    this.requestQueue.clear();

    this.currentConcurrent = 0;
  }

  /**
   * 清除缓存
   */
  clearCache(url?: string): void {
    if (url) {
      const cacheKey = this.generateCacheKey({ url } as RequestConfig);
      this.cacheManager.delete(cacheKey);
    } else {
      this.cacheManager.clear();
    }
  }

  /**
   * 获取当前活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  /**
   * 获取当前队列中的请求数量
   */
  getQueuedRequestCount(): number {
    return this.requestQueue.size();
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors(): void {
    this.interceptorManager.addDefaultRequestInterceptors(
      this.axiosInstance,
      this.authToken || undefined
    );
    this.interceptorManager.addDefaultResponseInterceptors(this.axiosInstance);
  }

  /**
   * 设置自定义拦截器
   */
  private setupCustomInterceptors(): void {
    if (this.config.interceptors?.request) {
      // 适配自定义请求拦截器到axios拦截器
      this.axiosInstance.interceptors.request.use((axiosConfig: any) => {
        if (this.config.interceptors?.request?.onFulfilled) {
          // 将axios配置转换为RequestConfig格式
          const requestConfig: RequestConfig = {
            url: axiosConfig.url || "",
            method: axiosConfig.method?.toUpperCase(),
            params: axiosConfig.params,
            data: axiosConfig.data,
            headers: axiosConfig.headers,
            timeout: axiosConfig.timeout,
          };

          const result =
            this.config.interceptors.request.onFulfilled(requestConfig);

          // 如果返回的是Promise，等待它完成
          if (result instanceof Promise) {
            return result.then((updatedConfig) => {
              // 将更新后的RequestConfig转换回axios配置
              return {
                ...axiosConfig,
                url: updatedConfig.url,
                method: updatedConfig.method?.toLowerCase(),
                params: updatedConfig.params,
                data: updatedConfig.data,
                headers: updatedConfig.headers,
                timeout: updatedConfig.timeout,
              };
            });
          } else {
            // 将更新后的RequestConfig转换回axios配置
            return {
              ...axiosConfig,
              url: result.url,
              method: result.method?.toLowerCase(),
              params: result.params,
              data: result.data,
              headers: result.headers,
              timeout: result.timeout,
            };
          }
        }
        return axiosConfig;
      }, this.config.interceptors.request.onRejected);
    }

    if (this.config.interceptors?.response) {
      // 适配自定义响应拦截器到axios拦截器
      this.axiosInstance.interceptors.response.use(
        (axiosResponse: any) => {
          if (this.config.interceptors?.response?.onFulfilled) {
            // 将axios响应转换为ResponseData格式
            const responseData: ResponseData = {
              code: axiosResponse.status,
              message: axiosResponse.statusText,
              data: axiosResponse.data,
              timestamp: Date.now(),
            };

            const result =
              this.config.interceptors.response.onFulfilled(responseData);

            // 如果返回的是Promise，等待它完成
            if (result instanceof Promise) {
              return result.then((updatedResponse) => {
                // 将更新后的ResponseData转换回axios响应
                return {
                  ...axiosResponse,
                  status: updatedResponse.code,
                  statusText: updatedResponse.message,
                  data: updatedResponse.data,
                };
              });
            } else {
              // 将更新后的ResponseData转换回axios响应
              return {
                ...axiosResponse,
                status: result.code,
                statusText: result.message,
                data: result.data,
              };
            }
          }
          return axiosResponse;
        },
        (error: any) => {
          if (this.config.interceptors?.response?.onRejected) {
            // 将axios错误转换为RequestError格式
            const requestError: RequestError = {
              code: error.response?.status || 500,
              message: error.message,
              originalError: error,
            };

            return this.config.interceptors.response.onRejected(requestError);
          }
          throw error;
        }
      );
    }
  }

  /**
   * 转换配置格式
   */
  private convertToAxiosConfig(config: RequestConfig): AxiosRequestConfig {
    return {
      url: config.url,
      method: config.method?.toLowerCase(),
      params: config.params,
      data: config.data,
      headers: config.headers,
      timeout: config.timeout,
    };
  }

  /**
   * 转换响应格式
   */
  private convertToResponseData<T>(response: AxiosResponse): ResponseData<T> {
    return {
      code: response.status,
      message: response.statusText,
      data: response.data,
      timestamp: Date.now(),
    };
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: any): RequestError {
    if (error?.isAxiosError) {
      return {
        code: error.code || error.response?.status || 500,
        message: error.message || "请求失败",
        originalError: error,
      };
    }

    return {
      code: 500,
      message: error?.message || "未知错误",
      originalError: error,
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(config: RequestConfig): string {
    return `${config.method}_${config.url}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(config: RequestConfig): string {
    const keyParts = [
      config.method,
      config.url,
      JSON.stringify(config.params || {}),
      JSON.stringify(config.data || {}),
    ];

    return btoa(keyParts.join("|"));
  }

  /**
   * 获取管理器统计信息
   */
  getStats(): {
    activeRequests: number;
    queuedRequests: number;
    currentConcurrent: number;
    maxConcurrent: number;
    cacheSize: number;
  } {
    return {
      activeRequests: this.getActiveRequestCount(),
      queuedRequests: this.getQueuedRequestCount(),
      currentConcurrent: this.currentConcurrent,
      maxConcurrent: this.maxConcurrent,
      cacheSize: this.cacheManager.size(),
    };
  }
}

/**
 * 创建请求管理器实例
 */
export const createRequestManager = (
  config?: RequestManagerConfig
): RequestManager => {
  return new RequestManager(config);
};

/**
 * 默认请求管理器实例
 */
export const defaultRequestManager = createRequestManager();
