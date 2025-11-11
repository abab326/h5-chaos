import request from "@/services";
import type {
  UploadOptions,
  UploadImageResponse,
  UploadFileResponse,
  BatchUploadResponse,
} from "./types";
import type { RequestOptions, ApiResponse } from "@/types/http";

/**
 * 文件上传相关 API
 */
const uploadApi = {
  /**
   * 上传图片
   * @param file 图片文件
   * @param options 上传选项
   */
  uploadImage: (
    file: File,
    options?: UploadOptions
  ): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return request.upload("/upload/image", formData, options);
  },

  /**
   * 上传文件
   * @param file 文件对象
   * @param options 上传选项
   */
  uploadFile: (
    file: File,
    options?: UploadOptions
  ): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return request.upload("/upload/file", formData, options);
  },

  /**
   * 批量上传文件
   * @param files 文件数组
   * @param options 上传选项
   */
  batchUpload: (
    files: File[],
    options?: UploadOptions
  ): Promise<BatchUploadResponse> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return request.upload("/upload/batch", formData, options);
  },

  /**
   * 删除上传的文件
   * @param fileId 文件 ID
   * @param options 请求选项
   */
  deleteFile: (
    fileId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<null>> => {
    return request.delete(`/upload/delete/${fileId}`, undefined, options);
  },
};

export default uploadApi;
