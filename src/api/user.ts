import { request, type RequestOptions } from "@/services";

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

export default userApi;
