import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./styles/tailwind.css";
import "./styles/global.less";
import adaptation from "./core/adaptation";
import http from "./core/http";

// 导入路由配置
import routes from "./router";

// 创建应用实例
const app = createApp(App);

// 使用pinia
const pinia = createPinia();
app.use(pinia);

// 使用路由
const router = createRouter({
  history: createWebHistory(),
  routes,
});
app.use(router);

// 初始化适配系统
adaptation.initAdaptation();

// 初始化HTTP客户端
http.init({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 30000,
  maxConcurrentRequests: 5,
  defaultCacheTime: 5 * 60 * 1000, // 5分钟
});

app.mount("#app");
