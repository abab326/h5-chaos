<template>
  <div
    class="flex flex-col justify-center items-center min-h-screen bg-gray-100"
  >
    <h1 class="mb-4 text-6xl font-bold text-gray-800">404</h1>
    <p class="mb-8 text-xl text-gray-600">页面未找到</p>
    <Button theme="primary" @click="goHome">返回首页</Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from "tdesign-mobile-vue";
  import { useRouter } from "vue-router";

  const router = useRouter();

  const goHome = () => {
    router.push("/");
  };
</script>
