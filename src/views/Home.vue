<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">欢迎使用 Vue3 + TypeScript + Vite 项目</h1>
    <div class="flex flex-col items-center space-y-6">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">技术栈</h2>
        <ul class="space-y-2">
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Vue 3.5
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            TypeScript 5
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            Vite 7
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
            Pinia
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            Vue Router
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
            TDesign Mobile Vue
          </li>
          <li class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-pink-500 mr-2"></span>
            TailwindCSS + Less
          </li>
        </ul>
      </div>
      <Button @click="handleClick" theme="primary">点击测试</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import { Button } from 'tdesign-mobile-vue'

const counterStore = useCounterStore()

const handleClick = () => {
  counterStore.increment()
  console.log('Count:', counterStore.count)
}
</script>

<style scoped lang="less">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>