<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="text-sm font-bold text-primary">这是首页</div>
    <div class="bg-red-500 w-[100vw] h-100"></div>
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

<style scoped></style>
