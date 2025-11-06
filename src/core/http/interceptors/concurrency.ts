/**
 * 并发和重复请求拦截器
 * 提供请求并发控制和重复请求合并功能
 */

import axios from "axios";

import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import type { RequestConfig } from "../types";

// 请求回调类型
interface RequestCallbacks<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

// 请求记录类型
interface RequestRecord {
  config: AxiosRequestConfig;
  callbacks: RequestCallbacks[];
  promise: Promise<AxiosResponse> | null;
}

// 请求状态类型
export interface RequestStatus {
  executing: number;
  waiting: number;
  pending: number;
}

/**
 * 并发和重复请求处理器
 */
export class ConcurrencyHandler {
  // 请求队列
  private pendingRequests: Map<string, RequestRecord>;
  // 执行中的请求
  private executingRequests: Set<string>;
  // 最大并发数
  private maxConcurrent: number;
  // 等待队列
  private waitingQueue: Array<() => void>;

  constructor(maxConcurrent: number = 5) {
    this.pendingRequests = new Map();
    this.executingRequests = new Set();
    this.maxConcurrent = maxConcurrent;
    this.waitingQueue = [];
  }

  /**
   * 生成请求唯一标识
   */
  private generateRequestKey(config: AxiosRequestConfig): string {
    const { url, method = "get", params, data } = config;

    // 对参数进行排序，确保相同参数不同顺序也能识别为相同请求
    const sortObject = (obj: any): string => {
      if (!obj || typeof obj !== "object") return JSON.stringify(obj);
      if (Array.isArray(obj)) return JSON.stringify(obj);

      const sortedKeys = Object.keys(obj).sort();
      const sortedObj: any = {};
      sortedKeys.forEach((key) => {
        sortedObj[key] = obj[key];
      });
      return JSON.stringify(sortedObj);
    };

    const sortedParams = params ? sortObject(params) : "";
    const requestData = data ? sortObject(data) : "";

    return `${url}_${method?.toLowerCase()}_${sortedParams}_${requestData}`;
  }

  /**
   * 请求拦截器 - 并发和重复请求控制
   */
  public async requestInterceptor(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    const requestConfig = config as RequestConfig;

    // 跳过控制的请求正常处理
    if (
      requestConfig.skipDuplicateCheck &&
      requestConfig.skipConcurrencyControl
    ) {
      return config;
    }

    // 只跳过重复检查，但仍需并发控制
    if (requestConfig.skipDuplicateCheck) {
      await this.waitForExecution();
      return config;
    }

    const requestKey = this.generateRequestKey(config);

    // 重复请求处理：重写adapter返回已有Promise
    if (this.pendingRequests.has(requestKey)) {
      const existingRecord = this.pendingRequests.get(requestKey)!;

      // 如果跳过并发控制，直接返回已有Promise
      if (requestConfig.skipConcurrencyControl) {
        config.adapter = () => existingRecord.promise!;
        return config;
      }

      // 需要并发控制，等待执行权后返回已有Promise
      return this.handleDuplicateRequestWithConcurrency(
        config,
        requestKey,
        existingRecord
      );
    }

    // 新请求处理
    return this.handleNewRequest(config, requestKey);
  }

  /**
   * 处理重复请求（带并发控制）
   */
  private async handleDuplicateRequestWithConcurrency(
    config: InternalAxiosRequestConfig,
    requestKey: string,
    existingRecord: RequestRecord
  ): Promise<InternalAxiosRequestConfig> {
    // 等待执行权
    await this.waitForExecution();
    this.executingRequests.add(requestKey);

    // 重写adapter返回已有Promise
    config.adapter = () => {
      // 执行完成后清理
      this.executingRequests.delete(requestKey);
      this.processWaitingQueue();
      return existingRecord.promise!;
    };

    return config;
  }

  /**
   * 处理新请求
   */
  private async handleNewRequest(
    config: InternalAxiosRequestConfig,
    requestKey: string
  ): Promise<InternalAxiosRequestConfig> {
    const requestConfig = config as RequestConfig;

    // 创建新的请求记录
    const requestRecord: RequestRecord = {
      config,
      callbacks: [],
      promise: null,
    };

    // 创建受控请求Promise
    requestRecord.promise = this.createControlledRequest(
      config,
      requestKey,
      requestRecord
    );
    this.pendingRequests.set(requestKey, requestRecord);

    // 如果跳过并发控制，直接返回Promise
    if (requestConfig.skipConcurrencyControl) {
      config.adapter = () => requestRecord.promise!;
      return config;
    }

    // 需要并发控制，等待执行权
    await this.waitForExecution();
    this.executingRequests.add(requestKey);

    config.adapter = () => {
      // 执行完成后清理
      this.executingRequests.delete(requestKey);
      this.processWaitingQueue();
      return requestRecord.promise!;
    };

    return config;
  }

  /**
   * 创建受控请求
   */
  private async createControlledRequest(
    config: AxiosRequestConfig,
    requestKey: string,
    requestRecord: RequestRecord
  ): Promise<AxiosResponse> {
    try {
      // 使用原始配置执行请求（不经过拦截器）
      const response = await axios({
        ...config,
        // 跳过我们自己的拦截器，避免循环
        transformRequest: [(data) => data],
        transformResponse: [(data) => data],
      });

      // 通知所有等待相同请求的回调
      requestRecord.callbacks.forEach(({ resolve }) => {
        resolve(response);
      });

      return response;
    } catch (error) {
      // 通知所有等待相同请求的回调
      requestRecord.callbacks.forEach(({ reject }) => {
        reject(error);
      });
      throw error;
    } finally {
      // 清理请求记录
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * 等待执行（并发控制）
   */
  private async waitForExecution(): Promise<void> {
    if (this.executingRequests.size < this.maxConcurrent) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  /**
   * 处理等待队列
   */
  private processWaitingQueue(): void {
    if (
      this.waitingQueue.length > 0 &&
      this.executingRequests.size < this.maxConcurrent
    ) {
      const nextRequest = this.waitingQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  /**
   * 获取当前请求状态
   */
  public getRequestStatus(): RequestStatus {
    return {
      executing: this.executingRequests.size,
      waiting: this.waitingQueue.length,
      pending: this.pendingRequests.size,
    };
  }

  /**
   * 取消所有请求
   */
  public cancelAllRequests(): void {
    this.pendingRequests.clear();
    this.executingRequests.clear();
    this.waitingQueue = [];
  }

  /**
   * 取消请求
   */
  public cancelRequest(requestKey: string): void {
    //
    console.log("取消请求", requestKey);
  }

  /**
   * 设置最大并发数
   */
  public setMaxConcurrent(max: number): void {
    if (max > 0) {
      this.maxConcurrent = max;
      // 立即处理等待队列，因为并发数可能增加了
      while (
        this.waitingQueue.length > 0 &&
        this.executingRequests.size < this.maxConcurrent
      ) {
        this.processWaitingQueue();
      }
    }
  }

  /**
   * 获取当前并发数
   */
  public getMaxConcurrent(): number {
    return this.maxConcurrent;
  }

  /**
   * 获取等待队列长度
   */
  public getWaitingCount(): number {
    return this.waitingQueue.length;
  }

  /**
   * 获取执行中请求数量
   */
  public getExecutingCount(): number {
    return this.executingRequests.size;
  }

  /**
   * 获取等待中的请求数量
   */
  public getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * 清除所有等待中的请求
   */
  public clearPendingRequests(): void {
    this.pendingRequests.clear();
  }
}

// 导出单例
export const concurrencyHandler = new ConcurrencyHandler();
export default concurrencyHandler;
