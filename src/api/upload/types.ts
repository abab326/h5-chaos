import type { ApiResponse } from "@/types/http";

// 上传进度回调函数类型
export interface UploadProgressCallback {
  (progress: number): void;
}

// 上传文件选项
export interface UploadOptions {
  showLoading?: boolean;
  onProgress?: UploadProgressCallback;
  [key: string]: any;
}

// 上传响应数据
export interface UploadResponseData {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
  fileId: string;
}

// 图片上传响应
export type UploadImageResponse = ApiResponse<UploadResponseData>;

// 文件上传响应
export type UploadFileResponse = ApiResponse<UploadResponseData>;

// 批量上传响应
export type BatchUploadResponse = ApiResponse<UploadResponseData[]>;
