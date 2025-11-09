import { request, type RequestOptions } from "@/services";

// 文件上传相关 API
export const uploadApi = {
  // 上传图片
  uploadImage: (
    file: File,
    options?: RequestOptions & { onProgress?: (progress: number) => void }
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.upload<{ url: string }>("/upload/image", formData, options);
  },

  // 上传文件
  uploadFile: (
    file: File,
    options?: RequestOptions & { onProgress?: (progress: number) => void }
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.upload<{ url: string; filename: string }>(
      "/upload/file",
      formData,
      options
    );
  },

  // 批量上传
  uploadMultiple: (
    files: File[],
    options?: RequestOptions & { onProgress?: (progress: number) => void }
  ) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    return request.upload<{ urls: string[] }>(
      "/upload/multiple",
      formData,
      options
    );
  },
};

export default uploadApi;
