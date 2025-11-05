/**
 * 请求取消管理器
 * 处理请求的取消操作和并发控制
 */

import axios from "axios";
import type { CancelTokenSource } from "axios";
import type { RequestConfig } from "./types";

/**
 * 请求记录接口
 */
export interface RequestRecord {
  key: string | number;
  source: CancelTokenSource;
  timestamp: number;
  config: RequestConfig;
}

/**
 * 请求取消管理器类
 */
export class CancelManager {
  private requestMap: Map<string | number, RequestRecord>;
  private maxConcurrentRequests: number;
  private currentRequests: number;
  private requestQueue: Array<() => Promise<any>>;

  constructor(maxConcurrentRequests: number = 5) {
    this.requestMap = new Map();
    this.maxConcurrentRequests = maxConcurrentRequests;
    this.currentRequests = 0;
    this.requestQueue = [];
  }

  /**
   * 生成请求唯一键
   */
  generateRequestKey(config: RequestConfig): string {
    const { method = "get", url = "", params = {}, data = {} } = config;

    // 对于复杂数据，使用JSON.stringify
    const stringify = (obj: any): string => {
      try {
        return JSON.stringify(obj);
      } catch {
        return String(obj);
      }
    };

    return `${method}-${url}-${stringify(params)}-${stringify(data)}`;
  }

  /**
   * 创建取消令牌
   */
  createCancelToken(config: RequestConfig): {
    cancelToken: any;
    requestKey: string | number;
  } {
    const source = axios.CancelToken.source();
    const requestKey = this.generateRequestKey(config);

    // 取消之前相同的请求
    this.cancelRequest(requestKey);

    // 记录请求
    this.requestMap.set(requestKey, {
      key: requestKey,
      source,
      timestamp: Date.now(),
      config,
    });

    return {
      cancelToken: source.token,
      requestKey,
    };
  }

  /**
   * 取消指定请求
   */
  cancelRequest(requestKey: string | number, reason?: string): boolean {
    if (this.requestMap.has(requestKey)) {
      const record = this.requestMap.get(requestKey)!;
      record.source.cancel(reason || "请求被取消");
      this.requestMap.delete(requestKey);
      return true;
    }
    return false;
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(reason?: string): void {
    this.requestMap.forEach((record) => {
      record.source.cancel(reason || "所有请求被取消");
    });
    this.requestMap.clear();
  }

  /**
   * 取消指定URL的所有请求
   */
  cancelRequestsByUrl(url: string, reason?: string): void {
    this.requestMap.forEach((record, key) => {
      if (record.config.url === url) {
        record.source.cancel(reason || `URL为${url}的请求被取消`);
        this.requestMap.delete(key);
      }
    });
  }

  /**
   * 清理过期请求
   * @param timeout 过期时间（毫秒）
   */
  cleanupExpiredRequests(timeout: number = 60000): void {
    const now = Date.now();

    this.requestMap.forEach((record, key) => {
      if (now - record.timestamp > timeout) {
        this.requestMap.delete(key);
      }
    });
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.requestMap.size;
  }

  /**
   * 检查请求是否存在
   */
  hasRequest(requestKey: string | number): boolean {
    return this.requestMap.has(requestKey);
  }

  /**
   * 移除请求记录（不取消）
   */
  removeRequest(requestKey: string | number): void {
    this.requestMap.delete(requestKey);
  }

  /**
   * 执行带并发控制的请求
   */
  async executeWithConcurrency<T>(fn: () => Promise<T>): Promise<T> {
    // 如果当前请求数超过限制，加入队列
    if (this.currentRequests >= this.maxConcurrentRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    // 增加当前请求计数
    this.currentRequests++;

    try {
      // 执行请求
      return await fn();
    } finally {
      // 减少当前请求计数
      this.currentRequests--;

      // 处理队列中的下一个请求
      this.processNextRequest();
    }
  }

  /**
   * 处理队列中的下一个请求
   */
  private processNextRequest(): void {
    if (
      this.requestQueue.length > 0 &&
      this.currentRequests < this.maxConcurrentRequests
    ) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  /**
   * 设置最大并发请求数
   */
  setMaxConcurrentRequests(max: number): void {
    this.maxConcurrentRequests = max;

    // 当增加限制后，尝试处理队列中的请求
    while (
      this.requestQueue.length > 0 &&
      this.currentRequests < this.maxConcurrentRequests
    ) {
      this.processNextRequest();
    }
  }

  /**
   * 获取队列中的请求数
   */
  getQueuedRequestCount(): number {
    return this.requestQueue.length;
  }

  /**
   * 清空请求队列
   */
  clearRequestQueue(): void {
    this.requestQueue = [];
  }

  /**
   * 获取所有活跃请求的信息
   */
  getActiveRequestsInfo(): Array<{
    key: string | number;
    url: string;
    method: string;
    timestamp: number;
  }> {
    const info: Array<{
      key: string | number;
      url: string;
      method: string;
      timestamp: number;
    }> = [];

    this.requestMap.forEach((record) => {
      info.push({
        key: record.key,
        url: record.config.url || "",
        method: record.config.method || "GET",
        timestamp: record.timestamp,
      });
    });

    return info;
  }
}

// 导出单例
export const cancelManager = new CancelManager();
export default cancelManager;
