<script setup lang="ts">
  import { watch } from "vue";
  import { useRoute } from "vue-router";
  const route = useRoute();
  // 监听路由变化，更新页面标题
  watch(
    () => route.meta.title,
    (newTitle) => {
      if (newTitle) {
        document.title = newTitle as string;
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <router-view />
  </div>
</template>

<style scoped></style>
