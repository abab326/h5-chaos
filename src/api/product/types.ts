import type { ApiResponse, PaginatedResponse } from "@/types/http";

// 产品信息类型
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

// 创建产品参数
export type CreateProductParams = Omit<Product, "id">;

// 更新产品参数
export type UpdateProductParams = Partial<Product>;

// 产品列表查询参数
export interface ProductListParams {
  page?: number;
  size?: number;
  category?: string;
  keyword?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

// 产品API响应类型
export type ProductListResponse = ApiResponse<PaginatedResponse<Product>>;
export type ProductDetailResponse = ApiResponse<Product>;
export type CreateProductResponse = ApiResponse<Product>;
export type UpdateProductResponse = ApiResponse<Product>;
export type DeleteProductResponse = ApiResponse<void>;
export type BatchDeleteProductResponse = ApiResponse<void>;
