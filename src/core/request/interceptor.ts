/**
 * 拦截器管理器
 */

import type { IInterceptorManager } from "./interface";
import type { RequestConfig, ResponseData, RequestError } from "./types";

/**
 * 拦截器项接口
 */
interface InterceptorItem<T> {
  id: number;
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

/**
 * 拦截器管理器实现类
 */
export class InterceptorManager implements IInterceptorManager {
  private requestInterceptors: InterceptorItem<RequestConfig>[];
  private responseInterceptors: InterceptorItem<ResponseData>[];
  private nextId: number;

  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.nextId = 0;
  }

  /**
   * 添加请求拦截器
   */
  useRequestInterceptor(
    onFulfilled?: (
      config: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    const id = this.nextId++;
    this.requestInterceptors.push({ id, onFulfilled, onRejected });
    return id;
  }

  /**
   * 添加响应拦截器
   */
  useResponseInterceptor(
    onFulfilled?: (
      response: ResponseData
    ) => ResponseData | Promise<ResponseData>,
    onRejected?: (error: RequestError) => any
  ): number {
    const id = this.nextId++;
    this.responseInterceptors.push({ id, onFulfilled, onRejected });
    return id;
  }

  /**
   * 移除拦截器
   */
  ejectInterceptor(id: number): void {
    this.requestInterceptors = this.requestInterceptors.filter(
      (interceptor) => interceptor.id !== id
    );
    this.responseInterceptors = this.responseInterceptors.filter(
      (interceptor) => interceptor.id !== id
    );
  }

  /**
   * 清空所有拦截器
   */
  clearInterceptors(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * 执行请求拦截器链
   */
  async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          currentConfig = await interceptor.onFulfilled(currentConfig);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          interceptor.onRejected(error);
        }
        throw error;
      }
    }

    return currentConfig;
  }

  /**
   * 执行响应拦截器链
   */
  async runResponseInterceptors(response: ResponseData): Promise<ResponseData> {
    let currentResponse = { ...response };

    for (const interceptor of this.responseInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          currentResponse = await interceptor.onFulfilled(currentResponse);
        }
      } catch (error) {
        if (interceptor.onRejected) {
          interceptor.onRejected(error);
        }
        throw error;
      }
    }

    return currentResponse;
  }

  /**
   * 执行响应错误拦截器链
   */
  async runResponseErrorInterceptors(
    error: RequestError
  ): Promise<RequestError> {
    let currentError = { ...error };

    for (const interceptor of this.responseInterceptors) {
      try {
        if (interceptor.onRejected) {
          const result = await interceptor.onRejected(currentError);
          if (result) {
            return result;
          }
        }
      } catch (newError) {
        currentError = this.normalizeError(newError);
      }
    }

    return currentError;
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: any): RequestError {
    if (this.isRequestError(error)) {
      return error;
    }

    return {
      code: 500,
      message: error?.message || "未知错误",
      originalError: error,
    };
  }

  /**
   * 检查是否为RequestError类型
   */
  private isRequestError(error: any): error is RequestError {
    return (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error
    );
  }

  /**
   * 获取拦截器统计信息
   */
  getStats(): { requestCount: number; responseCount: number } {
    return {
      requestCount: this.requestInterceptors.length,
      responseCount: this.responseInterceptors.length,
    };
  }

  /**
   * 添加默认的请求拦截器（token处理）
   */
  addDefaultRequestInterceptors(axiosInstance: any, authToken?: string): void {
    // Token拦截器
    axiosInstance.interceptors.request.use((config: any) => {
      if (authToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${authToken}`,
        };
      }
      return config;
    });

    // 请求日志拦截器
    axiosInstance.interceptors.request.use((config: any) => {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
      return config;
    });

    // 时间戳拦截器
    axiosInstance.interceptors.request.use((config: any) => {
      config.headers = {
        ...config.headers,
        "X-Timestamp": Date.now().toString(),
      };
      return config;
    });
  }

  /**
   * 添加默认的响应拦截器
   */
  addDefaultResponseInterceptors(axiosInstance: any): void {
    // 响应日志拦截器
    axiosInstance.interceptors.response.use(
      (response: any) => {
        console.log(`[Response] ${response.status}`, {
          data: response.data,
          headers: response.headers,
        });
        return response;
      },
      (error: any) => {
        console.error(
          `[Response Error] ${error.code || error.response?.status}: ${error.message}`
        );

        // 处理常见的HTTP错误码
        const statusCode = error.response?.status;
        switch (statusCode) {
          case 401:
            console.error("认证失败，请重新登录");
            // 这里可以触发登出逻辑
            break;
          case 403:
            console.error("权限不足");
            break;
          case 404:
            console.error("请求的资源不存在");
            break;
          case 500:
            console.error("服务器内部错误");
            break;
          default:
            console.error("请求失败");
        }

        throw error;
      }
    );
  }
}

/**
 * 创建拦截器管理器实例
 */
export const createInterceptorManager = (): InterceptorManager => {
  return new InterceptorManager();
};

/**
 * 默认拦截器管理器
 */
export const defaultInterceptorManager = createInterceptorManager();
