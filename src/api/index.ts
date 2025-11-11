// API 模块统一导出入口（重构版）

// 用户相关 API
import userApi from "./user";
export { userApi };

// 产品相关 API
import productApi from "./product";
export { productApi };

// 文件上传相关 API
import uploadApi from "./upload";
export { uploadApi };

// 文章相关 API
import articleApi from "./article";
export { articleApi };

// 系统相关 API
import systemApi from "./system";
export { systemApi };

// API 工具函数
import apiUtils from "./utils";
export { apiUtils };

// 通用 CRUD API 创建函数
import createCrudApi from "./crud";
export { createCrudApi };

// 默认导出所有 API 的集合对象
const api = {
  user: userApi,
  product: productApi,
  upload: uploadApi,
  article: articleApi,
  system: systemApi,
  utils: apiUtils,
  createCrudApi: createCrudApi,
};

export default api;

// 导出类型
export type {
  UserInfo,
  LoginParams,
  RegisterParams,
  UpdateUserInfoParams,
  ChangePasswordParams,
} from "./user/types";

export type {
  Product,
  ProductListParams,
  CreateProductParams,
  UpdateProductParams,
} from "./product/types";
