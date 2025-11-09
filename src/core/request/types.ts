/**
 * 网络请求类型定义
 */

/**
 * 请求方法类型
 */
export type RequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * 请求配置接口
 */
export interface RequestConfig<T = any> {
  /** 请求URL */
  url: string;
  /** 请求方法，默认为GET */
  method?: RequestMethod;
  /** 请求参数 */
  params?: Record<string, any>;
  /** 请求体数据 */
  data?: T;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否启用重试 */
  retry?: boolean;
  /** 最大重试次数，默认为3 */
  maxRetries?: number;
  /** 重试延迟时间（毫秒） */
  retryDelay?: number;
  /** 是否启用缓存 */
  cache?: boolean;
  /** 缓存时间（毫秒），默认为5分钟 */
  cacheTime?: number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 自定义请求标识，用于取消请求 */
  requestId?: string;
}

/**
 * 响应数据结构
 */
export interface ResponseData<T = any> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * 请求错误类型
 */
export interface RequestError {
  /** 错误码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 原始错误对象 */
  originalError?: any;
  /** 请求配置 */
  config?: RequestConfig;
}

/**
 * 拦截器配置
 */
export interface InterceptorConfig {
  /** 请求拦截器 */
  request?: {
    /** 请求成功拦截器 */
    onFulfilled?: (
      config: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>;
    /** 请求失败拦截器 */
    onRejected?: (error: any) => any;
  };
  /** 响应拦截器 */
  response?: {
    /** 响应成功拦截器 */
    onFulfilled?: (
      response: ResponseData
    ) => ResponseData | Promise<ResponseData>;
    /** 响应失败拦截器 */
    onRejected?: (error: RequestError) => any;
  };
}

/**
 * 请求管理器配置
 */
export interface RequestManagerConfig {
  /** 基础URL */
  baseURL?: string;
  /** 默认超时时间（毫秒） */
  timeout?: number;
  /** 最大并发请求数，默认为5 */
  maxConcurrent?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 拦截器配置 */
  interceptors?: InterceptorConfig;
  /** 是否启用请求日志 */
  enableLog?: boolean;
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存数据 */
  data: T;
  /** 缓存时间戳 */
  timestamp: number;
  /** 过期时间 */
  expires: number;
}

/**
 * 请求队列项接口
 */
export interface RequestQueueItem {
  /** 请求配置 */
  config: RequestConfig;
  /** 请求解析函数 */
  resolve: (value: any) => void;
  /** 请求拒绝函数 */
  reject: (reason?: any) => void;
  /** 请求开始时间 */
  startTime: number;
}
