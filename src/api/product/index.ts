import { request } from "@/services";
import type { RequestOptions } from "@/types/http";
import type { IdType } from "@/types/common";
import type {
  ProductListParams,
  ProductListResponse,
  ProductDetailResponse,
  CreateProductParams,
  CreateProductResponse,
  UpdateProductParams,
  UpdateProductResponse,
  DeleteProductResponse,
  BatchDeleteProductResponse,
} from "./types";

// 产品相关 API
export const productApi = {
  // 获取产品列表
  getList: (
    params?: ProductListParams,
    options?: RequestOptions
  ): Promise<ProductListResponse> => request.get("/products", params, options),

  // 获取产品详情
  getDetail: (
    id: IdType,
    options?: RequestOptions
  ): Promise<ProductDetailResponse> =>
    request.get(`/products/${id}`, undefined, options),

  // 创建产品
  create: (
    data: CreateProductParams,
    options?: RequestOptions
  ): Promise<CreateProductResponse> => request.post("/products", data, options),

  // 更新产品
  update: (
    id: IdType,
    data: UpdateProductParams,
    options?: RequestOptions
  ): Promise<UpdateProductResponse> =>
    request.put(`/products/${id}`, data, options),

  // 删除产品
  delete: (
    id: IdType,
    options?: RequestOptions
  ): Promise<DeleteProductResponse> =>
    request.delete(`/products/${id}`, undefined, options),

  // 批量删除产品
  batchDelete: (
    ids: IdType[],
    options?: RequestOptions
  ): Promise<BatchDeleteProductResponse> =>
    request.post("/products/batch-delete", { ids }, options),
};

export default productApi;
