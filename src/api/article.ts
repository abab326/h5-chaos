import { createCrudApi } from "./crud";

// 文章相关 API
export const articleApi = createCrudApi<{
  id: number;
  title: string;
  content: string;
  author: string;
  createTime: string;
  updateTime: string;
}>("articles");

export default articleApi;
