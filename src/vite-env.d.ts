/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "postcss-px-to-viewport" {
  import type { Plugin } from "postcss";
  const plugin: Plugin;
  export default plugin;
}
