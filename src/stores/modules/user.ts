import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  // 当前用户信息
  const currentUserInfo = ref(null);

  return { currentUserInfo };
});
