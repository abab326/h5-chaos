/**
 * 缓存管理器
 */

import type { ICacheManager } from "./interface";
import type { CacheItem } from "./types";

/**
 * 缓存管理器实现类
 */
export class CacheManager implements ICacheManager {
  private cache: Map<string, CacheItem>;
  private defaultExpireTime: number;

  constructor(defaultExpireTime: number = 5 * 60 * 1000) {
    // 默认5分钟
    this.cache = new Map();
    this.defaultExpireTime = defaultExpireTime;
  }

  /**
   * 设置缓存
   */
  set<T = any>(key: string, data: T, expireTime?: number): void {
    const now = Date.now();
    const expires = now + (expireTime || this.defaultExpireTime);

    this.cache.set(key, {
      data,
      timestamp: now,
      expires,
    });

    // 清理过期缓存
    this.cleanup();
  }

  /**
   * 获取缓存
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.size(),
      keys: this.getKeys(),
    };
  }
}

/**
 * 创建缓存管理器实例
 */
export const createCacheManager = (
  defaultExpireTime?: number
): CacheManager => {
  return new CacheManager(defaultExpireTime);
};
