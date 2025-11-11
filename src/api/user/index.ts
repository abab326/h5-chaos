import { request } from "@/services";
import type { RequestOptions } from "@/types/http";
import type {
  LoginParams,
  LoginApiResponse,
  RegisterParams,
  RegisterApiResponse,
  UserInfoResponse,
  UpdateUserInfoParams,
  UpdateUserInfoResponse,
  ChangePasswordParams,
  ChangePasswordResponse,
} from "./types";

// 用户相关 API
export const userApi = {
  // 登录
  login: (
    data: LoginParams,
    options?: RequestOptions
  ): Promise<LoginApiResponse> => request.post("/auth/login", data, options),

  // 注册
  register: (
    data: RegisterParams,
    options?: RequestOptions
  ): Promise<RegisterApiResponse> =>
    request.post("/auth/register", data, options),

  // 获取用户信息
  getUserInfo: (options?: RequestOptions): Promise<UserInfoResponse> =>
    request.get("/user/info", undefined, options),

  // 更新用户信息
  updateUserInfo: (
    data: UpdateUserInfoParams,
    options?: RequestOptions
  ): Promise<UpdateUserInfoResponse> =>
    request.put("/user/info", data, options),

  // 修改密码
  changePassword: (
    data: ChangePasswordParams,
    options?: RequestOptions
  ): Promise<ChangePasswordResponse> =>
    request.post("/user/change-password", data, options),
};

export default userApi;
