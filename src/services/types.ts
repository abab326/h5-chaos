// 请求配置类型
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

// 响应数据类型
export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 请求错误类型
export interface RequestError {
  code: number;
  message: string;
  data?: any;
}

// 请求选项类型
export interface RequestOptions {
  showLoading?: boolean;
  showError?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

// 上传文件类型
export interface UploadFileOptions {
  file: File;
  onProgress?: (progress: number) => void;
  fieldName?: string;
}

// 下载文件类型
export interface DownloadFileOptions {
  filename?: string;
  onProgress?: (progress: number) => void;
}
