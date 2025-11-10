import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  RequestConfig,
  RequestOptions,
  ResponseData,
  RequestError,
} from "./types";

import { isEmpty, isNull, isUndefined } from "lodash-es";
// 默认配置
const DEFAULT_CONFIG: RequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  withCredentials: true,
};

// 默认请求选项
const DEFAULT_OPTIONS: RequestOptions = {
  showLoading: true,
  showError: true,
  retryCount: 0,
  retryDelay: 1000,
};

class Request {
  private instance: AxiosInstance;
  private loadingCount = 0;

  constructor(config: RequestConfig = {}) {
    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    this.setupInterceptors();
  }

  // 设置拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加认证 token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加时间戳防止缓存
        if (config.method?.toLowerCase() === "get") {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ResponseData>) => {
        const { data } = response;

        // 业务成功
        if (data.success) {
          return response;
        }

        // 业务失败
        const error: RequestError = {
          code: data.code,
          message: data.message,
          data: data.data,
        };

        this.handleBusinessError(error);
        return Promise.reject(error);
      },
      (error) => {
        // 网络错误或服务器错误
        const requestError: RequestError = {
          code: error.response?.status || -1,
          message: this.getErrorMessage(error),
          data: error.response?.data,
        };

        this.handleNetworkError(requestError);
        return Promise.reject(requestError);
      }
    );
  }

  // 获取 token
  private getToken(): string | null {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    // 使用 lodash 方法检查 token 是否有效
    return !isEmpty(token) && !isNull(token) ? token : null;
  }

  // 获取错误消息
  private getErrorMessage(error: any): string {
    if (error.code === "ECONNABORTED") {
      return "请求超时，请检查网络连接";
    }

    // 使用 lodash 检查 response 是否存在
    if (isUndefined(error.response)) {
      return "网络错误，请检查网络连接";
    }

    const status = error.response.status;
    switch (status) {
      case 400:
        return "请求参数错误";
      case 401:
        return "未授权，请重新登录";
      case 403:
        return "拒绝访问";
      case 404:
        return "请求的资源不存在";
      case 500:
        return "服务器内部错误";
      case 502:
        return "网关错误";
      case 503:
        return "服务不可用";
      case 504:
        return "网关超时";
      default:
        // 使用 lodash 检查 message 是否存在
        const message = error.response.data?.message;
        return !isEmpty(message) && !isNull(message)
          ? message
          : `请求失败 (${status})`;
    }
  }

  // 处理业务错误
  private handleBusinessError(error: RequestError) {
    console.error("业务错误:", error);

    // 401 错误跳转到登录页
    if (error.code === 401) {
      this.redirectToLogin();
    }

    // 可以在这里添加错误上报等逻辑
  }

  // 处理网络错误
  private handleNetworkError(error: RequestError) {
    console.error("网络错误:", error);

    // 可以在这里添加错误上报等逻辑
  }

  // 跳转到登录页
  private redirectToLogin() {
    // 清除 token
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // 跳转到登录页
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // 显示 loading
  private showLoading() {
    if (this.loadingCount === 0) {
      // 可以在这里实现全局 loading
      console.log("显示 loading");
    }
    this.loadingCount++;
  }

  // 隐藏 loading
  private hideLoading() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      // 可以在这里隐藏全局 loading
      console.log("隐藏 loading");
    }
  }

  // 核心请求方法
  private async request<T = any>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<ResponseData<T>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // 显示 loading
    if (mergedOptions.showLoading) {
      this.showLoading();
    }

    let lastError: any = null;

    try {
      // 实现重试逻辑
      for (let attempt = 0; attempt <= mergedOptions.retryCount!; attempt++) {
        try {
          const response = await this.instance.request<ResponseData<T>>(config);
          return response.data;
        } catch (error: any) {
          lastError = error;

          // 如果是最后一次尝试，直接抛出错误
          if (attempt === mergedOptions.retryCount) {
            break;
          }

          // 如果不是网络错误或超时错误，不重试
          if (!this.shouldRetry(error)) {
            break;
          }

          // 等待重试延迟
          if (mergedOptions.retryDelay && mergedOptions.retryDelay > 0) {
            await this.delay(mergedOptions.retryDelay);
          }

          console.warn(`请求失败，第 ${attempt + 1} 次重试...`, error);
        }
      }

      // 所有重试都失败，抛出最后一个错误
      throw lastError;
    } finally {
      // 隐藏 loading
      if (mergedOptions.showLoading) {
        this.hideLoading();
      }
    }
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    // 网络错误或超时错误才重试
    return (
      isUndefined(error.response) || // 网络错误（使用 lodash 检查）
      error.code === "ECONNABORTED" || // 请求超时
      (!isUndefined(error.response) && error.response.status >= 500) // 服务器错误
    );
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // GET 请求
  async get<T = any>(
    url: string,
    params?: any,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "GET",
        params,
      },
      options
    );
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "POST",
        data,
      },
      options
    );
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "PUT",
        data,
      },
      options
    );
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    params?: any,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "DELETE",
        params,
      },
      options
    );
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "PATCH",
        data,
      },
      options
    );
  }

  // 上传文件
  async upload<T = any>(
    url: string,
    formData: FormData,
    options?: RequestOptions & {
      onProgress?: (progress: number) => void;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>(
      {
        url,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (options?.onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            options.onProgress(progress);
          }
        },
      },
      options
    );
  }

  // 下载文件
  async download(
    url: string,
    options?: RequestOptions & {
      filename?: string;
      onProgress?: (progress: number) => void;
    }
  ): Promise<Blob> {
    const response = await this.instance({
      url,
      method: "GET",
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        // 使用 lodash 检查回调函数和 total 是否存在
        if (
          !isUndefined(options?.onProgress) &&
          !isEmpty(progressEvent.total)
        ) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          options.onProgress!(progress);
        }
      },
    });

    // 获取返回的文件名
    const contentDisposition = response.headers["content-disposition"];
    const filename = !isEmpty(contentDisposition)
      ? contentDisposition.match(/filename="(.+)"/)?.[1]
      : undefined;

    // 处理文件下载
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const finalFilename = filename || options?.filename || "download";

    link.download = finalFilename!;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return blob;
  }
}

// 创建默认实例
export const request = new Request();

// 导出实例创建方法
export const createRequest = (config: RequestConfig) => new Request(config);

export default request;
