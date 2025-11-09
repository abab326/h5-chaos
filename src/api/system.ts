import { request, type RequestOptions } from "@/services";

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

export default systemApi;
