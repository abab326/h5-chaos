import { createApp } from "vue";
import "./styles/tailwind.css";
import "./styles/global.less";
import router from "./router";
import appStore from "./stores";

import App from "./App.vue";

// 创建应用实例
const app = createApp(App);
app.use(router);
app.use(appStore);

app.mount("#app");
