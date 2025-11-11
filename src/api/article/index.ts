import request from "@/services";
import type {
  ArticleListParams,
  ArticleListResponse,
  ArticleDetailResponse,
  CreateArticleParams,
  CreateArticleResponse,
  UpdateArticleParams,
  UpdateArticleResponse,
  DeleteArticleResponse,
  BatchDeleteArticleResponse,
} from "./types";
import type { RequestOptions } from "@/types/http";
import type { IdType } from "@/types/common";

/**
 * 文章相关 API
 */
const articleApi = {
  /**
   * 获取文章列表
   * @param params 查询参数
   * @param options 请求选项
   */
  getList: (
    params: ArticleListParams,
    options?: RequestOptions
  ): Promise<ArticleListResponse> => {
    return request.get("/articles", params, options);
  },

  /**
   * 获取文章详情
   * @param id 文章 ID
   * @param options 请求选项
   */
  getDetail: (
    id: IdType,
    options?: RequestOptions
  ): Promise<ArticleDetailResponse> => {
    return request.get(`/articles/${id}`, undefined, options);
  },

  /**
   * 创建文章
   * @param data 创建文章数据
   * @param options 请求选项
   */
  create: (
    data: CreateArticleParams,
    options?: RequestOptions
  ): Promise<CreateArticleResponse> => {
    return request.post("/articles", data, options);
  },

  /**
   * 更新文章
   * @param data 更新文章数据
   * @param options 请求选项
   */
  update: (
    data: UpdateArticleParams,
    options?: RequestOptions
  ): Promise<UpdateArticleResponse> => {
    const { id, ...updateData } = data;
    return request.put(`/articles/${id}`, updateData, options);
  },

  /**
   * 删除文章
   * @param id 文章 ID
   * @param options 请求选项
   */
  delete: (
    id: IdType,
    options?: RequestOptions
  ): Promise<DeleteArticleResponse> => {
    return request.delete(`/articles/${id}`, undefined, options);
  },

  /**
   * 批量删除文章
   * @param ids 文章 ID 列表
   * @param options 请求选项
   */
  batchDelete: (
    ids: IdType[],
    options?: RequestOptions
  ): Promise<BatchDeleteArticleResponse> => {
    return request.post("/articles/batch-delete", { ids }, options);
  },
};

export default articleApi;
