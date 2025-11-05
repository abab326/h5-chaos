/**
 * HTTP 请求核心实现
 * 封装 Axios 实例和拦截器系统
 */

import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { RequestConfig, ApiResponse, HttpClient } from "./types";
import { cancelManager } from "./cancelManager";
import { cacheManager } from "./cacheManager";

/**
 * 生成请求唯一键
 */
const generateRequestKey = (config: RequestConfig): string => {
  const { method = "get", url = "", params = {}, data = {} } = config;
  return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
};

/**
 * HTTP 客户端实现
 */
class HttpClientImpl implements HttpClient {
  instance: AxiosInstance;
  private authToken: string | null = null;
  // 复用 cancelManager 中的并发控制

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const customConfig = config as RequestConfig;

        // 添加认证令牌
        if (customConfig.requiresAuth && this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // 处理请求参数
        if (config.params) {
          // 移除undefined或null的参数
          config.params = Object.fromEntries(
            Object.entries(config.params).filter(
              ([_, value]) => value !== undefined && value !== null
            )
          );
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 从请求记录中移除
        const requestKey = generateRequestKey(response.config as RequestConfig);
        cancelManager.removeRequest(requestKey);

        // 处理响应数据
        const data = response.data as ApiResponse;

        if (data.code !== 0 && data.code !== 200 && data.code !== 20000) {
          return Promise.reject({
            errorCode: data.code,
            errorMessage: data.message || "请求失败",
            originalError: response,
          });
        }

        return Promise.resolve(data.data);
      },
      (error: AxiosError) => {
        // 从请求记录中移除
        if (error.config) {
          const requestKey = generateRequestKey(error.config as RequestConfig);
          cancelManager.removeRequest(requestKey);
        }

        // 处理错误
        const customConfig = error.config as RequestConfig;
        const errorHandler = customConfig?.errorHandler || "auto";

        if (errorHandler === "none") {
          return Promise.reject(error);
        }

        // 网络错误处理
        if (!error.response) {
          // 处理请求取消
          if (axios.isCancel(error)) {
            return Promise.reject({
              errorMessage: error.message || "请求已取消",
            });
          }
          return Promise.reject({
            errorMessage: "网络错误，请检查您的网络连接",
          });
        }

        // 服务器错误处理
        const status = error.response.status;
        let errorMessage = "请求失败";

        switch (status) {
          case 401:
            errorMessage = "登录已过期，请重新登录";
            // 可以在这里处理登出逻辑
            break;
          case 403:
            errorMessage = "没有权限访问该资源";
            break;
          case 404:
            errorMessage = "请求的资源不存在";
            break;
          case 500:
            errorMessage = "服务器内部错误";
            break;
          default:
            errorMessage =
              (error.response?.data as any)?.message || errorMessage;
        }

        return Promise.reject({
          errorCode: status,
          errorMessage,
          originalError: error,
        });
      }
    );
  }

  /**
   * 处理请求重试
   */
  private async handleRetry<T>(
    config: RequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const maxRetryCount = config.retryCount || 0;
    let retryCount = 0;
    let lastError: any;

    while (retryCount <= maxRetryCount) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // 只对网络错误和服务器错误进行重试
        const shouldRetry =
          !error.config || error.response?.status >= 500 || !error.response; // 网络错误

        if (!shouldRetry || retryCount >= maxRetryCount) {
          throw error;
        }

        retryCount++;

        // 指数退避策略
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * 处理并发控制 - 使用 cancelManager
   */
  private async handleConcurrency<T>(fn: () => Promise<T>): Promise<T> {
    return cancelManager.executeWithConcurrency(fn);
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    // 检查缓存
    const cachedData = cacheManager.get<T>(config);
    if (cachedData) {
      return cachedData;
    }

    // 添加取消令牌
    const { cancelToken } = cancelManager.createCancelToken(config);
    const requestConfig = { ...config, cancelToken };

    // 执行请求（带重试和并发控制）
    const result = await this.handleConcurrency(() =>
      this.handleRetry<T>(requestConfig, () =>
        this.instance
          .request<ApiResponse<T>>(requestConfig)
          .then((res) => res as unknown as T)
      )
    );

    // 设置缓存
    cacheManager.set<T>(config, result);

    return result;
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
    cancelManager.cancelRequest(requestKey);
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    cancelManager.cancelAllRequests();
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

  /**
   * 设置认证令牌
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
}

// 导出单例
export const httpClient = new HttpClientImpl();
export default httpClient;
