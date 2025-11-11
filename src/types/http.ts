// 公共请求响应类型定义

// HTTP 方法类型
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

// API 响应通用结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页响应结构
export interface PaginatedResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 请求配置选项
export interface RequestOptions {
  showLoading?: boolean;
  showError?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

// 请求错误类型
export interface RequestError {
  code: number;
  message: string;
  data?: any;
}
