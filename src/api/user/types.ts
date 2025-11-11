import type { ApiResponse } from "@/types/http";

// 用户信息类型
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 注册参数
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
}

// 更新用户信息参数
export interface UpdateUserInfoParams {
  username?: string;
  email?: string;
  avatar?: string;
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// 用户API响应类型
export type UserInfoResponse = ApiResponse<UserInfo>;
export type LoginApiResponse = ApiResponse<LoginResponse>;
export type RegisterApiResponse = ApiResponse<void>;
export type UpdateUserInfoResponse = ApiResponse<void>;
export type ChangePasswordResponse = ApiResponse<void>;
