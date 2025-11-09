import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "首页",
    },
  },
  {
    path: "/example-request",
    name: "ExampleRequest",
    component: () => import("@/views/ExampleRequest.vue"),
    meta: {
      title: "请求示例",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "页面未找到",
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
