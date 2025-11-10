import { request, type RequestOptions } from "@/services";

// 通用 CRUD API 创建函数
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

export default createCrudApi;
