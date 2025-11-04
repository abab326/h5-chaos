import { type RouteRecordRaw } from "vue-router";

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
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "页面未找到",
    },
  },
];

export default routes;
