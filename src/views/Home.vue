<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="text-sm font-bold text-primary">这是首页</div>
    <div class="bg-red-500 w-[100vw] h-100"></div>
    <Button theme="primary" @click="goHome">返回首页</Button>
    <DateTimePicker
      v-model="value"
      class="w-[100vw]"
      :title="title"
      :type="type"
      :confirm-button-text="confirmButtonText"
      :cancel-button-text="cancelButtonText"
    />
  </div>
</template>

<script setup lang="ts">
  import { Button, DateTimePicker } from "tdesign-mobile-vue";
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  const router = useRouter();
  const goHome = () => {
    router.push("/");
  };
  const value = ref("");
  const title = "选择日期时间";
  const type = "datetime";
  const confirmButtonText = "确定";
  const cancelButtonText = "取消";
</script>

<style scoped></style>
