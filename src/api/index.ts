// API 模块统一导出入口

// 用户相关 API
export { default as userApi } from "./user";

// 文件上传相关 API
export { default as uploadApi } from "./upload";

// 通用 CRUD API 创建函数
export { default as createCrudApi } from "./crud";

// 文章相关 API
export { default as articleApi } from "./article";

// 产品相关 API
export { default as productApi } from "./product";

// 系统相关 API
export { default as systemApi } from "./system";

// API 工具函数
export { default as apiUtils } from "./utils";

// 默认导出所有 API 的集合对象
import userApi from "./user";
import uploadApi from "./upload";
import articleApi from "./article";
import productApi from "./product";
import systemApi from "./system";
import apiUtils from "./utils";
import createCrudApi from "./crud";

const api = {
  user: userApi,
  upload: uploadApi,
  article: articleApi,
  product: productApi,
  system: systemApi,
  utils: apiUtils,
  createCrudApi: createCrudApi,
};

export default api;
