/**
 * 错误处理模块
 * 统一处理网络请求错误和业务错误
 */

import type { ErrorResponse } from "./types";
import { Toast } from "tdesign-mobile-vue";
/**
 * 错误类型常量
 */
export const ErrorTypeMap = {
  network: "NETWORK_ERROR",
  server: "SERVER_ERROR",
  client: "CLIENT_ERROR",
  business: "BUSINESS_ERROR",
  timeout: "TIMEOUT_ERROR",
  cancel: "CANCEL_ERROR",
  unknown: "UNKNOWN_ERROR",
} as const;
// 定义键的类型
export type ErrorTypeKey = keyof typeof ErrorTypeMap;
// 定义值的类型
export type ErrorType = (typeof ErrorTypeMap)[ErrorTypeKey];
/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  // 是否显示错误提示
  showToast?: boolean;
  // 是否重试
  retry?: boolean;
  // 重试次数
  retryCount?: number;
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private readonly options: ErrorHandlerOptions;

  defaultOptions: ErrorHandlerOptions = {
    showToast: true,
    retry: false,
    retryCount: 3,
  };
  constructor(options: ErrorHandlerOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }
  /**
   * 处理错误
   */
  handleError(error: any): ErrorResponse {
    const { showToast = true } = this.options;

    // 标准化错误响应
    const errorResponse: ErrorResponse = this.normalizeError(error);

    // 显示错误提示
    if (showToast) {
      this.showErrorToast(errorResponse.errorMessage);
    }

    // 根据错误类型执行特定处理
    this.handleSpecificError(errorResponse);

    return errorResponse;
  }

  /**
   * 标准化错误
   */
  normalizeError(error: any): ErrorResponse {
    // 如果已经是标准化的错误响应
    if (error.errorCode !== undefined && error.errorMessage !== undefined) {
      return error as ErrorResponse;
    }

    // 处理Axios错误
    if (error.isAxiosError) {
      if (!error.response) {
        // 网络错误或请求取消
        if (error.code === "ECONNABORTED") {
          return {
            errorCode: ErrorTypeMap.timeout,
            errorMessage: "请求超时，请稍后重试",
            originalError: error,
          };
        }

        if (error.message?.includes("cancel")) {
          return {
            errorCode: ErrorTypeMap.cancel,
            errorMessage: error.message || "请求已取消",
            originalError: error,
          };
        }

        return {
          errorCode: ErrorTypeMap.network,
          errorMessage: "网络错误，请检查您的网络连接",
          originalError: error,
        };
      }

      // HTTP状态码错误
      const status = error.response.status;
      let errorMessage = "请求失败";

      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        switch (status) {
          case 400:
            errorMessage = "请求参数错误";
            break;
          case 401:
            errorMessage = "登录已过期，请重新登录";
            break;
          case 403:
            errorMessage = "没有权限访问该资源";
            break;
          case 404:
            errorMessage = "请求的资源不存在";
            break;
          case 408:
            errorMessage = "请求超时";
            break;
          case 500:
            errorMessage = "服务器内部错误";
            break;
          case 502:
            errorMessage = "网关错误";
            break;
          case 503:
            errorMessage = "服务不可用";
            break;
          case 504:
            errorMessage = "网关超时";
            break;
          default:
            errorMessage = `请求失败 (${status})`;
        }
      }

      return {
        errorCode: status,
        errorMessage,
        originalError: error,
      };
    }

    // 处理业务错误（通常是后端返回的错误）
    if (error.code || error.message) {
      return {
        errorCode: error.code || ErrorTypeMap.business,
        errorMessage: error.message || "业务处理失败",
        originalError: error,
      };
    }

    // 处理其他错误
    return {
      errorCode: ErrorTypeMap.unknown,
      errorMessage: error.message || String(error) || "未知错误",
      originalError: error,
    };
  }

  /**
   * 显示错误提示
   */
  showErrorToast(message: string): void {
    // 这里可以集成具体的UI库的toast组件
    // 例如：ElMessage.error(message);
    // 暂时使用console.log作为替代
    Toast.error({ message, duration: 2000 });
  }

  /**
   * 处理特定类型的错误
   */
  handleSpecificError(error: ErrorResponse): void {
    switch (error.errorCode) {
      case 401:
      case ErrorTypeMap.client:
        // 处理登录过期，这里可以触发登出操作
        // 例如：store.dispatch('auth/logout');
        break;
      case ErrorTypeMap.timeout:
        // 处理超时错误
        break;
      default:
        // 其他错误
        break;
    }
  }

  /**
   * 获取错误类型
   */
  getErrorType(error: any): ErrorType {
    if (error.isAxiosError) {
      if (!error.response) {
        if (error.code === "ECONNABORTED") {
          return ErrorTypeMap.timeout;
        }
        if (error.message?.includes("cancel")) {
          return ErrorTypeMap.cancel;
        }
        return ErrorTypeMap.cancel;
      }
      return ErrorTypeMap.network;
    }

    const status = error.response.status;
    if (status >= 500) {
      return ErrorTypeMap.server;
    } else if (status >= 400 && status < 500) {
      return ErrorTypeMap.client;
    }

    if (error.code || error.message) {
      return ErrorTypeMap.business;
    }

    return ErrorTypeMap.unknown;
  }
  /**
   * 判断错误是否可重试
   */
  isRetryAble(errorType: ErrorType): boolean {
    const retryAbleList: ErrorType[] = [
      ErrorTypeMap.network,
      ErrorTypeMap.server,
      ErrorTypeMap.timeout,
    ];
    return retryAbleList.includes(errorType);
  }
}

export default ErrorHandler;
