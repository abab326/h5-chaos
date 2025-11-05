import defaultHttpClient, { AxiosHttpClient } from "./request";
import type { HttpClient } from "./types";
export * from "./types";
export { AxiosHttpClient };
export default defaultHttpClient as HttpClient;
