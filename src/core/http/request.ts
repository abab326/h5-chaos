import axios from "axios";

import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { concurrencyHandler } from "./interceptors/concurrency";
import type { ApiRequestConfig, HttpClient, RequestConfig } from "./types";
import type { RequestStatus } from "./interceptors/concurrency";

// 响应数据类型
export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

class RequestManager implements HttpClient {
  // axios 实例
  private instance: AxiosInstance;

  constructor() {
    // 创建 axios 实例
    this.instance = axios.create({
      baseURL: import.meta.env.VUE_APP_BASE_API || "/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    });

    // 请求拦截器 - 使用并发处理器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return concurrencyHandler.requestInterceptor(config);
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return this.responseInterceptor(response);
      },
      (error: AxiosError) => {
        return this.responseInterceptor(error);
      }
    );
  }
  request<T = any>(config: ApiRequestConfig): Promise<[error: any, T | null]> {
    return new Promise<[error: any, T | null]>((resolve, reject) => {
      this.instance
        .request<T>(config)
        .then((response) => {
          resolve([null, response.data]);
        })
        .catch((error) => {
          resolve([error, null]);
        });
    });
  }
  get<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]> {
    return this.request<T>({
      url,
      method: "get",
      ...config,
    });
  }
  post<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]> {
    return this.request<T>({
      url,
      method: "post",
      data,
      ...config,
    });
  }
  put<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]> {
    return this.request<T>({
      url,
      method: "put",
      data,
      ...config,
    });
  }
  delete<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]> {
    return this.request<T>({
      url,
      method: "delete",
      ...config,
    });
  }
  patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<[error: any, T | null]> {
    return this.request<T>({
      url,
      method: "patch",
      data,
      ...config,
    });
  }
  cancelRequest(requestKey: string): void {
    concurrencyHandler.cancelRequest(requestKey);
  }

  /**
   * 响应拦截器
   */
  private responseInterceptor(
    response: AxiosResponse | AxiosError
  ): AxiosResponse | Promise<AxiosResponse> {
    if ("config" in response) {
      // 成功响应
      return response as AxiosResponse<ResponseData>;
    } else {
      // 错误响应
      return Promise.reject(response);
    }
  }

  /**
   * 获取当前请求状态
   */
  public getRequestStatus(): RequestStatus {
    return concurrencyHandler.getRequestStatus();
  }

  /**
   * 取消所有请求
   */
  public cancelAllRequests(): void {
    concurrencyHandler.cancelAllRequests();
  }

  /**
   * 设置最大并发数
   */
  public setMaxConcurrent(max: number): void {
    concurrencyHandler.setMaxConcurrent(max);
  }

  /**
   * 获取当前并发数
   */
  public getMaxConcurrent(): number {
    return concurrencyHandler.getMaxConcurrent();
  }

  /**
   * 获取等待队列长度
   */
  public getWaitingCount(): number {
    return concurrencyHandler.getWaitingCount();
  }

  /**
   * 获取执行中请求数量
   */
  public getExecutingCount(): number {
    return concurrencyHandler.getExecutingCount();
  }

  /**
   * 获取等待中的请求数量
   */
  public getPendingCount(): number {
    return concurrencyHandler.getPendingCount();
  }

  /**
   * 清除所有等待中的请求
   */
  public clearPendingRequests(): void {
    concurrencyHandler.clearPendingRequests();
  }
}

// 创建单例实例
const requestManager = new RequestManager();

export default requestManager;
