import type { ApiResponse, PaginatedResponse } from "@/types/http";
import type { IdType, PaginationParams } from "@/types/common";

// 文章信息类型
export interface Article {
  id: IdType;
  title: string;
  content: string;
  author: string;
  createTime: string;
  updateTime: string;
  status: "published" | "draft" | "deleted";
  category: string;
  tags: string[];
}

// 文章列表查询参数
export interface ArticleListParams extends PaginationParams {
  keyword?: string;
  category?: string;
  status?: string;
  author?: string;
  startTime?: string;
  endTime?: string;
}

// 文章列表响应
export type ArticleListResponse = ApiResponse<PaginatedResponse<Article>>;

// 文章详情响应
export type ArticleDetailResponse = ApiResponse<Article>;

// 创建文章参数
export interface CreateArticleParams {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status?: "published" | "draft";
}

// 创建文章响应
export type CreateArticleResponse = ApiResponse<Article>;

// 更新文章参数
export interface UpdateArticleParams {
  id: IdType;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: "published" | "draft" | "deleted";
}

// 更新文章响应
export type UpdateArticleResponse = ApiResponse<Article>;

// 删除文章响应
export type DeleteArticleResponse = ApiResponse<null>;

// 批量删除文章响应
export type BatchDeleteArticleResponse = ApiResponse<null>;
