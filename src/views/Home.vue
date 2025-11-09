<template>
  <div class="h-screen overflow-auto bg-gray-50 py-12 px-4">
    <div class="max-w-375 mx-auto">
      <!-- 头部 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">H5 Chaos 项目</h1>
        <p class="text-lg text-gray-600">
          基于 Vue 3 + TypeScript + Tailwind CSS 的移动端项目
        </p>
      </div>

      <!-- 功能卡片 -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 请求服务示例卡片 -->
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-4">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">请求服务示例</h3>
              <p class="text-gray-600">体验封装的 axios 请求服务</p>
            </div>
          </div>
          <p class="text-gray-500 mb-4">
            本项目基于 axios
            封装了统一的请求服务，包含请求拦截器、响应拦截器、错误处理、文件上传等功能。
          </p>
          <router-link
            to="/example-request"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看示例
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </router-link>
        </div>

        <!-- 项目特性卡片 -->
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-4">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">项目特性</h3>
              <p class="text-gray-600">现代化的技术栈</p>
            </div>
          </div>
          <ul class="text-gray-500 space-y-2 mb-4">
            <li class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Vue 3 + Composition API
            </li>
            <li class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              TypeScript 类型安全
            </li>
            <li class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Tailwind CSS 样式
            </li>
            <li class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Pinia 状态管理
            </li>
          </ul>
        </div>
      </div>

      <!-- 快速开始 -->
      <div class="mt-12 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">快速开始</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <pre
            class="text-sm text-gray-800 overflow-x-auto"
          ><code>// 使用封装的请求服务
import { userApi, articleApi } from '@/services'

// 获取用户信息
const userInfo = await userApi.getUserInfo()

// 获取文章列表
const articles = await articleApi.getList({ page: 1, size: 10 })</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 这里可以添加一些初始化逻辑
</script>

<style scoped>
  /* 自定义样式 */
</style>
