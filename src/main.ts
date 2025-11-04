import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./assets/styles/tailwind.css";
import "./assets/styles/global.less";

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

app.mount("#app");
