// 全局通用类型定义

// 分页参数
export interface PaginationParams {
  page?: number;
  size?: number;
}

// 通用 ID 参数
export type IdType = string | number;

// 批量操作参数
export interface BatchParams {
  ids: IdType[];
}

// 排序参数
export interface SortParams {
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

// 分页查询参数
export interface PageQueryParams extends PaginationParams, SortParams {
  [key: string]: any;
}
