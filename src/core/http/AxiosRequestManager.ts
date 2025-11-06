import type { AxiosInstance } from "axios";
import type { AxiosRequestManager, CacheItem, RequestConfig } from "./types";
import type { CacheManager } from "./cacheManager";

export class AxiosRequestManagerImpl implements AxiosRequestManager {
  private readonly instance: AxiosInstance;
  private readonly cacheManager: CacheManager;

  constructor(instance: AxiosInstance, cacheManager: CacheManager) {
    this.instance = instance;
    this.cacheManager = cacheManager;
  }

  generateKey(config: RequestConfig): string {
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
  setCacheData(config: RequestConfig, item: CacheItem): void {
    const key = this.generateKey(config);
    const expireTime = config?.cache?.expireTime;
    this.cacheManager.set(key, item, expireTime);
  }
  getCacheData(config: RequestConfig): CacheItem | null {
    const key = this.generateKey(config);
    return this.cacheManager.get(key);
  }
  hasCacheData(config: RequestConfig): boolean {
    const key = this.generateKey(config);
    return this.cacheManager.has(key);
  }
  clearExpiredCache(): void {
    this.cacheManager.cleanupExpired();
  }
  clearAllCache(): void {
    this.cacheManager.clear();
  }
  cancelRequest(config: RequestConfig): void {
    throw new Error("Method not implemented.");
  }
  executeRequest<T = any>(config: RequestConfig): Promise<T> {
    throw new Error("Method not implemented.");
  }
  cancelAllRequests(): void {
    throw new Error("Method not implemented.");
  }
}
