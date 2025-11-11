import type { ApiResponse, PaginatedResponse } from "@/types/http";

/**
 * API 工具函数集合
 */
const apiUtils = {
  /**
   * 处理 API 响应数据
   * @param response API 响应对象
   * @returns 响应数据
   */
  handleResponse: <T>(response: ApiResponse<T>): T => {
    if (!response || response.code !== 0) {
      throw new Error(response?.message || "请求失败");
    }
    return response.data;
  },

  /**
   * 处理分页响应数据
   * @param response 分页响应对象
   * @returns 包含列表数据和总数的对象
   */
  handleListResponse: <T>(
    response: PaginatedResponse<T>
  ): { list: T[]; total: number } => {
    return {
      list: response.list || [],
      total: response.total || 0,
    };
  },

  /**
   * 构建查询参数字符串
   * @param params 查询参数对象
   * @returns 查询参数字符串
   */
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  /**
   * 格式化请求错误
   * @param error 错误对象
   * @returns 格式化后的错误消息
   */
  formatError: (error: any): string => {
    if (typeof error === "string") {
      return error;
    }
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return error.message || "网络请求错误";
  },

  /**
   * 检查是否为有效响应
   * @param response 响应对象
   * @returns 是否有效
   */
  isValidResponse: (response: any): boolean => {
    return response && typeof response === "object";
  },

  /**
   * 合并请求选项
   * @param options1 第一个选项对象
   * @param options2 第二个选项对象
   * @returns 合并后的选项
   */
  mergeOptions: <T extends Record<string, any>>(
    options1?: T,
    options2?: T
  ): T => {
    return {
      ...options1,
      ...options2,
    } as T;
  },
};

export default apiUtils;
