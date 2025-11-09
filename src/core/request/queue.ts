/**
 * 请求队列管理器
 */

import type { IRequestQueue } from "./interface";
import type { RequestConfig, RequestQueueItem } from "./types";

/**
 * 请求队列实现类
 */
export class RequestQueue implements IRequestQueue {
  private queue: RequestQueueItem[];

  constructor() {
    this.queue = [];
  }

  /**
   * 添加请求到队列
   */
  add(
    config: RequestConfig,
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ): void {
    const queueItem: RequestQueueItem = {
      config,
      resolve,
      reject,
      startTime: Date.now(),
    };

    this.queue.push(queueItem);
  }

  /**
   * 从队列中移除请求（先进先出）
   */
  remove(): RequestQueueItem | null {
    if (this.queue.length === 0) {
      return null;
    }

    return this.queue.shift() || null;
  }

  /**
   * 获取队列长度
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * 检查队列是否为空
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * 清空队列
   */
  clear(): void {
    // 拒绝所有队列中的请求
    this.queue.forEach((item) => {
      item.reject(new Error("请求队列被清空"));
    });

    this.queue = [];
  }

  /**
   * 获取队列中等待时间最长的请求的等待时间
   */
  getMaxWaitTime(): number {
    if (this.queue.length === 0) {
      return 0;
    }

    const now = Date.now();
    return Math.max(...this.queue.map((item) => now - item.startTime));
  }

  /**
   * 获取队列统计信息
   */
  getStats(): {
    size: number;
    maxWaitTime: number;
    queueItems: Array<{ requestId?: string; waitTime: number }>;
  } {
    const now = Date.now();

    return {
      size: this.size(),
      maxWaitTime: this.getMaxWaitTime(),
      queueItems: this.queue.map((item) => ({
        requestId: item.config.requestId,
        waitTime: now - item.startTime,
      })),
    };
  }

  /**
   * 根据请求ID查找队列项
   */
  findItemByRequestId(requestId: string): RequestQueueItem | null {
    return (
      this.queue.find((item) => item.config.requestId === requestId) || null
    );
  }

  /**
   * 根据请求ID移除队列项
   */
  removeItemByRequestId(requestId: string): boolean {
    const index = this.queue.findIndex(
      (item) => item.config.requestId === requestId
    );

    if (index !== -1) {
      const item = this.queue[index];
      item!.reject(new Error("请求被取消"));
      this.queue.splice(index, 1);
      return true;
    }

    return false;
  }
}

/**
 * 创建请求队列实例
 */
export const createRequestQueue = (): RequestQueue => {
  return new RequestQueue();
};
