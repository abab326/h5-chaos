/**
 * 缓存管理器
 * 提供请求数据的缓存功能
 */

import type { CacheItem, RequestConfig } from "./types";

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  // 是否启用缓存
  enabled: boolean;
  // 缓存过期时间（毫秒）
  expireTime?: number;
  // 缓存容量
  capacity?: number;
  // 缓存键生成器
  keyGenerator?: (config: RequestConfig) => string;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  // 缓存项数量
  size: number;
  // 命中次数
  hits: number;
  // 未命中次数
  misses: number;
  // 缓存率
  hitRate: number;
}

/**
 * 缓存管理器类，提供请求数据的缓存功能
 */
export class CacheManager {
  private cache: Map<string, CacheItem>;
  private defaultExpireTime: number;
  private capacity: number;
  private stats: CacheStats;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.defaultExpireTime = config?.expireTime || 5 * 60 * 1000; // 默认5分钟
    this.capacity = config?.capacity || 100; // 默认最多缓存100个请求
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
    };

    // 定期清理过期缓存
    this.startCleanupInterval();
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(config: RequestConfig): string {
    const { method = "get", url = "", params = {}, data = {} } = config;

    // 对于GET请求，data会被忽略
    const keyData = method.toLowerCase() === "get" ? params : data;

    return `${method.toUpperCase()}-${url}-${JSON.stringify(keyData)}`;
  }

  /**
   * 获取缓存
   */
  get<T = any>(config: RequestConfig): T | null {
    const key = this.generateCacheKey(config);
    const cacheItem = this.cache.get(key);

    if (!cacheItem) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    const expireTime = config.cache?.expireTime || this.defaultExpireTime;

    if (now - cacheItem.timestamp > expireTime) {
      // 缓存过期，移除
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 缓存命中
    this.stats.hits++;
    this.updateHitRate();
    return cacheItem.data as T;
  }

  /**
   * 设置缓存
   */
  set<T = any>(config: RequestConfig, data: T): void {
    // 如果缓存未启用，直接返回
    if (!config.cache?.enabled) {
      return;
    }

    const key = this.generateCacheKey(config);
    const expireTime = config.cache?.expireTime || this.defaultExpireTime;

    // 检查容量限制
    this.enforceCapacity();

    // 设置缓存
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expireTime,
    });

    this.stats.size = this.cache.size;
  }

  /**
   * 删除缓存
   */
  delete(config: RequestConfig): boolean {
    const key = this.generateCacheKey(config);
    const result = this.cache.delete(key);

    if (result) {
      this.stats.size = this.cache.size;
    }

    return result;
  }

  /**
   * 删除指定URL的缓存
   */
  deleteByUrl(url: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(url)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });

    this.stats.size = this.cache.size;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    // 保留统计信息，但重置命中/未命中计数
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
  }

  /**
   * 强制容量限制
   */
  private enforceCapacity(): void {
    if (this.cache.size >= this.capacity) {
      // 使用LRU策略：移除最早的缓存项
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * 获取最早的缓存键
   */
  private getOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 开始定期清理
   */
  private startCleanupInterval(): void {
    // 每5分钟清理一次过期缓存
    setInterval(
      () => {
        this.cleanupExpired();
      },
      5 * 60 * 1000
    );
  }

  /**
   * 清理过期缓存
   */
  cleanupExpired(): void {
    const now = Date.now();
    let deletedCount = 0;

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.expireTime) {
        this.cache.delete(key);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      this.stats.size = this.cache.size;
      console.log(`清理了 ${deletedCount} 个过期缓存项`);
    }
  }

  /**
   * 设置默认过期时间
   */
  setDefaultExpireTime(expireTime: number): void {
    this.defaultExpireTime = expireTime;
  }

  /**
   * 设置缓存容量
   */
  setCapacity(capacity: number): void {
    this.capacity = capacity;
    // 立即应用新的容量限制
    this.enforceCapacity();
  }

  /**
   * 检查是否存在缓存
   */
  has(config: RequestConfig): boolean {
    const key = this.generateCacheKey(config);
    return this.cache.has(key);
  }

  /**
   * 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存项的剩余有效期
   */
  getRemainingTime(config: RequestConfig): number | null {
    const key = this.generateCacheKey(config);
    const cacheItem = this.cache.get(key);

    if (!cacheItem) {
      return null;
    }

    const now = Date.now();
    const remaining = cacheItem.expireTime - (now - cacheItem.timestamp);

    return remaining > 0 ? remaining : 0;
  }
}

// 导出单例
export const cacheManager = new CacheManager();
export default cacheManager;
