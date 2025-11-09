import { request } from "./request";
import type { RequestOptions, ResponseData } from "./types";

// 用户相关 API
export const userApi = {
  // 登录
  login: (
    data: { username: string; password: string },
    options?: RequestOptions
  ) =>
    request.post<{ token: string; userInfo: any }>(
      "/auth/login",
      data,
      options
    ),

  // 注册
  register: (
    data: { username: string; password: string; email: string },
    options?: RequestOptions
  ) => request.post("/auth/register", data, options),

  // 获取用户信息
  getUserInfo: (options?: RequestOptions) =>
    request.get<{
      id: number;
      username: string;
      email: string;
      avatar: string;
    }>("/user/info", options),

  // 更新用户信息
  updateUserInfo: (
    data: { username?: string; email?: string; avatar?: string },
    options?: RequestOptions
  ) => request.put("/user/info", data, options),

  // 修改密码
  changePassword: (
    data: { oldPassword: string; newPassword: string },
    options?: RequestOptions
  ) => request.post("/user/change-password", data, options),
};

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

// 通用 CRUD API
export const createCrudApi = <T = any>(resource: string) => ({
  // 获取列表
  getList: (
    params?: { page?: number; size?: number; [key: string]: any },
    options?: RequestOptions
  ) =>
    request.get<{ list: T[]; total: number; page: number; size: number }>(
      `/${resource}`,
      params,
      options
    ),

  // 获取详情
  getDetail: (id: string | number, options?: RequestOptions) =>
    request.get<T>(`/${resource}/${id}`, options),

  // 创建
  create: (data: Partial<T>, options?: RequestOptions) =>
    request.post<T>(`/${resource}`, data, options),

  // 更新
  update: (id: string | number, data: Partial<T>, options?: RequestOptions) =>
    request.put<T>(`/${resource}/${id}`, data, options),

  // 删除
  delete: (id: string | number, options?: RequestOptions) =>
    request.delete(`/${resource}/${id}`, options),

  // 批量删除
  batchDelete: (ids: (string | number)[], options?: RequestOptions) =>
    request.post(`/${resource}/batch-delete`, { ids }, options),
});

// 示例：文章 API
export const articleApi = createCrudApi<{
  id: number;
  title: string;
  content: string;
  author: string;
  createTime: string;
  updateTime: string;
}>("articles");

// 示例：产品 API
export const productApi = createCrudApi<{
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}>("products");

// 系统相关 API
export const systemApi = {
  // 获取系统配置
  getConfig: (options?: RequestOptions) =>
    request.get<{ [key: string]: any }>("/system/config", options),

  // 获取菜单
  getMenu: (options?: RequestOptions) =>
    request.get<
      {
        id: number;
        name: string;
        path: string;
        icon: string;
        children?: any[];
      }[]
    >("/system/menu", options),

  // 获取权限
  getPermissions: (options?: RequestOptions) =>
    request.get<string[]>("/system/permissions", options),
};

// 工具函数
export const apiUtils = {
  // 处理响应数据
  handleResponse: <T>(response: ResponseData<T>): T => {
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // 处理列表响应
  handleListResponse: <T>(
    response: ResponseData<{
      list: T[];
      total: number;
      page: number;
      size: number;
    }>
  ) => ({
    list: response.data.list,
    total: response.data.total,
    page: response.data.page,
    size: response.data.size,
  }),

  // 创建分页参数
  createPagination: (page: number = 1, size: number = 10) => ({
    page,
    size,
  }),
};

export default {
  user: userApi,
  upload: uploadApi,
  article: articleApi,
  product: productApi,
  system: systemApi,
  utils: apiUtils,
};
