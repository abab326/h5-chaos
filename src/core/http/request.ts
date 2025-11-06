/**
 * HTTP 请求核心实现
 * 封装 Axios 实例和拦截器系统
 */

import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type { RequestConfig, ApiResponse, HttpClient } from "./types";
import { CancelManager } from "./cancelManager";
import { CacheManager } from "./cacheManager";
import { ErrorHandler } from "./errorHandler";

export interface HttpClientOptions {
  cancelManager?: CancelManager;
  cacheManager?: CacheManager;
  errorHandler?: ErrorHandler;
  baseURL?: string;
  timeout?: number;
  headers?: AxiosRequestHeaders;
}

/**
 * HTTP 客户端实现
 */
export class AxiosHttpClient implements HttpClient {
  instance: AxiosInstance;
  private readonly cancelManager: CancelManager;
  private readonly cacheManager: CacheManager;
  private readonly errorHandler: ErrorHandler;

  constructor(options?: HttpClientOptions) {
    this.cancelManager = options?.cancelManager || new CancelManager();
    this.cacheManager = options?.cacheManager || new CacheManager();
    this.errorHandler = options?.errorHandler || new ErrorHandler();
    // 配置 axios 实例
    this.instance = axios.create({
      baseURL: options?.baseURL || import.meta.env.VITE_API_BASE_URL || "",
      timeout: options?.timeout || 1000 * 30,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    // 请求拦截器
    this.setupRequestInterceptor();
    // 响应拦截器
    this.setupResponseInterceptor();
  }

  /**
   * 设置响应拦截器
   */
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { config, status, data } = response;
        // 如查返回的是错误响应，使用错误处理器处理
        if (status !== 200) {
          const errorResponse = this.errorHandler.handleError(response.data);
          return Promise.reject(errorResponse);
        }
        const requestConfig = config as RequestConfig;
        // 如果请求的是缓存请求，将响应数据缓存起来
        if (requestConfig.cache?.enabled) {
          this.cacheManager.set(requestConfig, data);
        }
        return Promise.resolve(data);
      },
      (error: any): Promise<any> => {
        // 错误处理
        const errorResponse = this.errorHandler.handleError(error);
        return Promise.reject(errorResponse);
      }
    );
  }
  // 配置请求拦截器
  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        //
        return config;
      },
      (error: AxiosError) => {
        // 错误处理
        const errorResponse = this.errorHandler.handleError(error);
        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * 处理并发控制
   */
  private async handleConcurrency<T>(fn: () => Promise<T>): Promise<T> {
    return this.cancelManager.executeWithConcurrency(fn);
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    // 检查缓存
    if (config.cache?.enabled) {
      const cachedData = this.cacheManager.get(config);
      if (cachedData) {
        // 直接返回缓存数据
        return Promise.resolve(cachedData as T);
      }
    }

    // 执行请求（带并发控制）
    return this.handleConcurrency(async () => {
      try {
        const response = await this.instance.request<ApiResponse<T>>(config);
        return response.data as unknown as T;
      } catch (error: any) {
        // 重新抛出错误
        throw error;
      }
    });
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "get", url });
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "post", url, data });
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "put", url, data });
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "delete", url });
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "patch", url, data });
  }

  /**
   * 取消请求
   */
  cancelRequest(requestKey: string | number): void {
    this.cancelManager.cancelRequest(requestKey);
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    this.cancelManager.cancelAllRequests();
  }

  /**
   * 设置基础 URL
   */
  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  /**
   * 设置默认请求头
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.instance.defaults.headers.common = {
      ...this.instance.defaults.headers.common,
      ...headers,
    };
  }
}

// 导出单例
export const defaultHttpClient = new AxiosHttpClient();
export default defaultHttpClient;
