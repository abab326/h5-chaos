<template>
  <div class="p-6 max-w-full mx-auto">
    <h1 class="text-2xl font-bold mb-6">请求服务示例</h1>

    <!-- 用户信息区域 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">用户信息</h2>
      <div class="flex gap-4 mb-4">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="loading"
          @click="getUserInfo"
        >
          获取用户信息
        </button>
        <button
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="loading"
          @click="updateUserInfo"
        >
          更新用户信息
        </button>
      </div>
      <div v-if="userInfo" class="p-4 bg-gray-100 rounded">
        <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
      </div>
    </div>

    <!-- 文章管理区域 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">文章管理</h2>
      <div class="flex gap-4 mb-4">
        <button
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          :disabled="loading"
          @click="getArticleList"
        >
          获取文章列表
        </button>
        <button
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          :disabled="loading"
          @click="createArticle"
        >
          创建文章
        </button>
      </div>
      <div v-if="articles.length > 0" class="p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">文章列表 (共 {{ total }} 条)</h3>
        <div
          v-for="article in articles"
          :key="article.id"
          class="mb-2 p-2 bg-white rounded"
        >
          <div class="font-medium">{{ article.title }}</div>
          <div class="text-sm text-gray-600">
            {{ article.author }} - {{ article.createTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">文件上传</h2>
      <div class="mb-4">
        <input
          type="file"
          accept="image/*"
          class="mb-2"
          @change="onFileChange"
        />
        <button
          class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          :disabled="!selectedFile || loading"
          @click="uploadFile"
        >
          上传文件
        </button>
      </div>
      <div v-if="uploadProgress > 0" class="mb-2">
        <div class="text-sm text-gray-600">上传进度: {{ uploadProgress }}%</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-teal-500 h-2 rounded-full transition-all"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
      <div v-if="uploadResult" class="p-4 bg-gray-100 rounded">
        <pre>{{ JSON.stringify(uploadResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- 错误处理区域 -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">错误处理</h2>
      <div class="flex gap-4">
        <button
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          :disabled="loading"
          @click="testError"
        >
          测试错误请求
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          :disabled="loading"
          @click="testTimeout"
        >
          测试超时请求
        </button>
      </div>
      <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 text-red-700 rounded">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Loading 状态 -->
    <div
      v-if="loading"
      class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"
        ></div>
        <div class="mt-2 text-center">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { userApi, articleApi, uploadApi, apiUtils } from "@/api";

  // 响应式数据
  const loading = ref(false);
  const userInfo = ref<any>(null);
  const articles = ref<any[]>([]);
  const total = ref(0);
  const selectedFile = ref<File | null>(null);
  const uploadProgress = ref(0);
  const uploadResult = ref<any>(null);
  const errorMessage = ref("");

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      const response = await userApi.getUserInfo({
        showLoading: false, // 手动控制 loading
      });
      userInfo.value = apiUtils.handleResponse(response);
    } catch (error: any) {
      errorMessage.value = `获取用户信息失败: ${error.message}`;
      console.error("获取用户信息错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 更新用户信息
  const updateUserInfo = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      await userApi.updateUserInfo({
        username: "更新后的用户名",
        email: "updated@example.com",
      });
      // 更新成功后重新获取用户信息
      await getUserInfo();
    } catch (error: any) {
      errorMessage.value = `更新用户信息失败: ${error.message}`;
      console.error("更新用户信息错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 获取文章列表
  const getArticleList = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      const response = await articleApi.getList({
        page: 1,
        size: 10,
      });
      const { list, total: totalCount } = apiUtils.handleListResponse(
        response.data
      );
      articles.value = list;
      total.value = totalCount;
    } catch (error: any) {
      errorMessage.value = `获取文章列表失败: ${error.message}`;
      console.error("获取文章列表错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 创建文章
  const createArticle = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      await articleApi.create({
        title: "新文章标题",
        content: "这是文章内容",
        author: "示例作者",
        category: "技术",
        tags: ["Vue", "TypeScript"],
      });
      // 创建成功后重新获取文章列表
      await getArticleList();
    } catch (error: any) {
      errorMessage.value = `创建文章失败: ${error.message}`;
      console.error("创建文章错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 文件选择
  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      selectedFile.value = target.files[0]!;
      uploadProgress.value = 0;
      uploadResult.value = null;
    }
  };

  // 上传文件
  const uploadFile = async () => {
    if (!selectedFile.value) return;

    try {
      loading.value = true;
      errorMessage.value = "";
      const response = await uploadApi.uploadImage(selectedFile.value, {
        showLoading: false,
        onProgress: (progress: number) => {
          uploadProgress.value = progress;
        },
      });
      uploadResult.value = apiUtils.handleResponse(response);
    } catch (error: any) {
      errorMessage.value = `文件上传失败: ${error.message}`;
      console.error("文件上传错误:", error);
    } finally {
      loading.value = false;
    }
  };

  // 测试错误请求
  const testError = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      // 模拟一个不存在的接口
      await userApi.getUserInfo({
        showError: false, // 不显示默认错误提示
      });
    } catch (error: any) {
      errorMessage.value = `测试错误: ${error.message}`;
      console.error("测试错误详情:", error);
    } finally {
      loading.value = false;
    }
  };

  // 测试超时请求
  const testTimeout = async () => {
    try {
      loading.value = true;
      errorMessage.value = "";
      // 模拟一个超时请求
      await userApi.getUserInfo({
        showError: false,
        // 这里可以设置一个很短的超时时间来测试
      });
    } catch (error: any) {
      if (error.code === "ECONNABORTED") {
        errorMessage.value = "请求超时，请检查网络连接";
      } else {
        errorMessage.value = `请求失败: ${error.message}`;
      }
      console.error("超时测试错误:", error);
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  /* 可以添加一些自定义样式 */
</style>
