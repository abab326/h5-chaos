import { createApp } from "vue";
import "./styles/tailwind.css";
import "./styles/global.less";
import adaptation from "./core/adaptation";
import router from "./router";
import appStore from "./stores";

import App from "./App.vue";

// 创建应用实例
const app = createApp(App);
app.use(router);
app.use(appStore);
// 初始化适配系统
adaptation.initAdaptation();

app.mount("#app");
