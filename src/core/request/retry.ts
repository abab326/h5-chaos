/**
 * 重试策略管理器
 */

import type { IRetryStrategy } from "./interface";
import type { RequestError } from "./types";

/**
 * 重试策略配置
 */
export interface RetryStrategyConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 基础重试延迟时间（毫秒） */
  baseDelay: number;
  /** 是否启用指数退避 */
  exponentialBackoff: boolean;
  /** 最大延迟时间（毫秒） */
  maxDelay: number;
}

/**
 * 重试策略实现类
 */
export class RetryStrategy implements IRetryStrategy {
  private config: RetryStrategyConfig;

  constructor(config?: Partial<RetryStrategyConfig>) {
    this.config = {
      maxRetries: config?.maxRetries ?? 3,
      baseDelay: config?.baseDelay ?? 1000,
      exponentialBackoff: config?.exponentialBackoff ?? true,
      maxDelay: config?.maxDelay ?? 10000,
    };
  }

  /**
   * 检查是否需要重试
   */
  shouldRetry(
    error: RequestError,
    retryCount: number,
    maxRetries: number
  ): boolean {
    // 如果已经达到最大重试次数，不再重试
    if (retryCount >= maxRetries) {
      return false;
    }

    // 网络错误、超时错误、5xx服务器错误应该重试
    const retryableCodes = [
      // 网络错误
      "ECONNABORTED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      // HTTP状态码
      408,
      429,
      500,
      502,
      503,
      504,
    ];

    // 检查错误码是否在可重试范围内
    if (retryableCodes.includes(error.code)) {
      return true;
    }

    // 检查错误消息中是否包含可重试的关键字
    const retryableMessages = [
      "timeout",
      "network",
      "server",
      "gateway",
      "service unavailable",
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableMessages.some((keyword) => errorMessage.includes(keyword));
  }

  /**
   * 获取重试延迟时间
   */
  getRetryDelay(retryCount: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.baseDelay;
    }

    // 指数退避算法：delay = baseDelay * 2^retryCount
    const delay = this.config.baseDelay * Math.pow(2, retryCount);

    // 限制最大延迟时间
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * 创建重试延迟的Promise
   */
  createRetryDelay(retryCount: number): Promise<void> {
    const delay = this.getRetryDelay(retryCount);

    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  /**
   * 执行重试逻辑
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries?: number,
    onRetry?: (retryCount: number, error: RequestError) => void
  ): Promise<T> {
    const maxRetriesToUse = maxRetries ?? this.config.maxRetries;
    let lastError: RequestError;

    for (let retryCount = 0; retryCount <= maxRetriesToUse; retryCount++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = this.normalizeError(error);

        // 检查是否需要重试
        if (
          retryCount < maxRetriesToUse &&
          this.shouldRetry(lastError, retryCount, maxRetriesToUse)
        ) {
          // 调用重试回调
          if (onRetry) {
            onRetry(retryCount + 1, lastError);
          }

          // 等待重试延迟
          await this.createRetryDelay(retryCount);
          continue;
        }

        // 不再重试，抛出错误
        throw lastError;
      }
    }

    // 理论上不会执行到这里
    throw lastError!;
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: any): RequestError {
    if (this.isRequestError(error)) {
      return error;
    }

    // 处理axios错误
    if (error?.isAxiosError) {
      return {
        code: error.code || error.response?.status || 500,
        message: error.message || "请求失败",
        originalError: error,
      };
    }

    // 处理其他类型的错误
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
   * 获取配置信息
   */
  getConfig(): RetryStrategyConfig {
    return { ...this.config };
  }
}

/**
 * 创建重试策略实例
 */
export const createRetryStrategy = (
  config?: Partial<RetryStrategyConfig>
): RetryStrategy => {
  return new RetryStrategy(config);
};

/**
 * 默认重试策略
 */
export const defaultRetryStrategy = createRetryStrategy();
