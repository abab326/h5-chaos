import { createCrudApi } from "./crud";

// 产品相关 API
export const productApi = createCrudApi<{
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}>("products");

export default productApi;
