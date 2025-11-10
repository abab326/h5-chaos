import type { ResponseData } from "@/services/types";

// API 工具函数
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

export default apiUtils;
