# 网络请求管理功能

## 功能概述

本项目提供了一个功能完整的网络请求管理模块，基于axios封装，具备以下特性：

- ✅ **统一接口**: 提供get、post、put、delete、patch等便捷方法
- ✅ **并发控制**: 最大同时请求数量限制（默认5个）
- ✅ **重试机制**: 支持请求失败自动重试（默认最大3次）
- ✅ **请求缓存**: 支持响应数据缓存（默认5分钟）
- ✅ **拦截器**: 支持请求/响应拦截器，统一处理token认证
- ✅ **类型安全**: 完整的TypeScript类型定义
- ✅ **错误处理**: 统一的错误处理机制
- ✅ **请求取消**: 支持取消单个或所有请求

## 快速开始

### 基本使用

```typescript
import { get, post, setAuthToken } from "@/core/request";

// 设置认证token
setAuthToken("your-jwt-token");

// GET请求示例
const users = await get<User[]>("/api/users", { page: 1, size: 10 });

// POST请求示例
const result = await post<{ id: number }>("/api/users", {
  name: "张三",
  email: "zhangsan@example.com",
});
```

### 完整功能示例

```typescript
import { request, cancelRequest, clearCache } from "@/core/request";

// 自定义配置请求
const response = await request({
  url: "/api/data",
  method: "GET",
  params: { search: "keyword" },

  // 启用缓存（10分钟）
  cache: true,
  cacheTime: 10 * 60 * 1000,

  // 启用重试（最大3次）
  retry: true,
  maxRetries: 3,

  // 自定义请求ID（用于取消）
  requestId: "search-request",
});

// 取消指定请求
cancelRequest("search-request");

// 清除缓存
clearCache("/api/data");
```

## API文档

### 便捷方法

| 方法                            | 说明       | 示例                             |
| ------------------------------- | ---------- | -------------------------------- |
| `get<T>(url, params?, config?)` | GET请求    | `get<User[]>('/api/users')`      |
| `post<T>(url, data?, config?)`  | POST请求   | `post('/api/users', userData)`   |
| `put<T>(url, data?, config?)`   | PUT请求    | `put('/api/users/1', userData)`  |
| `del<T>(url, config?)`          | DELETE请求 | `del('/api/users/1')`            |
| `patch<T>(url, data?, config?)` | PATCH请求  | `patch('/api/users/1', updates)` |
| `request<T>(config)`            | 自定义请求 | 见下方配置说明                   |

### 配置参数（RequestConfig）

```typescript
interface RequestConfig {
  url: string; // 请求URL
  method?: RequestMethod; // 请求方法，默认GET
  params?: Record<string, any>; // URL参数
  data?: any; // 请求体数据
  headers?: Record<string, string>; // 请求头
  timeout?: number; // 超时时间（毫秒）

  // 重试配置
  retry?: boolean; // 是否启用重试
  maxRetries?: number; // 最大重试次数（默认3）
  retryDelay?: number; // 重试延迟时间

  // 缓存配置
  cache?: boolean; // 是否启用缓存
  cacheTime?: number; // 缓存时间（毫秒，默认5分钟）

  // 其他配置
  loading?: boolean; // 是否显示加载状态
  requestId?: string; // 请求标识（用于取消）
}
```

### 工具函数

| 函数                       | 说明                          |
| -------------------------- | ----------------------------- |
| `setAuthToken(token)`      | 设置全局认证token             |
| `clearAuthToken()`         | 清除认证token                 |
| `cancelRequest(requestId)` | 取消指定请求                  |
| `cancelAllRequests()`      | 取消所有请求                  |
| `clearCache(url?)`         | 清除缓存（不传url则清除所有） |
| `getRequestStats()`        | 获取请求统计信息              |

### 创建自定义管理器

```typescript
import { createRequestManager } from "@/core/request";

const customManager = createRequestManager({
  baseURL: "https://api.example.com",
  timeout: 20000,
  maxConcurrent: 3, // 最大并发数
  headers: {
    "X-App-Version": "1.0.0",
  },
});

// 使用自定义管理器
const users = await customManager.get<User[]>("/users");
```

## 高级功能

### 拦截器

```typescript
import { defaultRequestManager } from "@/core/request";

// 添加请求拦截器
const interceptorId =
  defaultRequestManager.interceptorManager.useRequestInterceptor(
    (config) => {
      // 在请求发送前处理配置
      config.headers["X-Request-ID"] = generateRequestId();
      return config;
    },
    (error) => {
      // 请求错误处理
      console.error("请求拦截器错误:", error);
      return Promise.reject(error);
    }
  );

// 移除拦截器
defaultRequestManager.interceptorManager.ejectInterceptor(interceptorId);
```

### 并发控制

模块自动控制并发请求数量（默认最大5个），超出限制的请求会自动进入队列等待。

```typescript
// 获取当前统计信息
const stats = getRequestStats();
console.log("活跃请求:", stats.activeRequests);
console.log("队列中请求:", stats.queuedRequests);
console.log("当前并发数:", stats.currentConcurrent);
```

### 缓存管理

```typescript
import { defaultRequestManager } from "@/core/request";

// 获取缓存管理器
const cacheManager = defaultRequestManager.cacheManager;

// 手动管理缓存
cacheManager.set("custom-key", data, 60000); // 缓存1分钟
const cached = cacheManager.get("custom-key");
cacheManager.delete("custom-key");
```

## Vue组件中使用示例

```vue
<template>
  <div>
    <button @click="loadUsers" :disabled="loading">
      {{ loading ? "加载中..." : "加载用户" }}
    </button>

    <div v-if="error" class="error">{{ error }}</div>

    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { get, clearCache } from "@/core/request";

  interface User {
    id: number;
    name: string;
    email: string;
  }

  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await get<User[]>(
        "/api/users",
        {
          page: 1,
          size: 10,
        },
        {
          cache: true, // 启用缓存
          loading: true, // 可用于控制加载状态
        }
      );

      users.value = response.data;
    } catch (err: any) {
      error.value = err.message || "加载失败";
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: Omit<User, "id">) => {
    try {
      const response = await post<User>("/api/users", userData);

      // 创建成功后清除用户列表缓存
      clearCache("/api/users");

      return response.data;
    } catch (err: any) {
      throw new Error(err.message || "创建用户失败");
    }
  };
</script>
```

## 错误处理

所有请求方法都会抛出统一的错误对象：

```typescript
interface RequestError {
  code: number; // 错误码
  message: string; // 错误消息
  originalError?: any; // 原始错误对象
}

// 错误处理示例
try {
  await get("/api/data");
} catch (error: any) {
  if (error.code === 401) {
    // 认证失败，跳转到登录页
    router.push("/login");
  } else if (error.code === 404) {
    // 资源不存在
    showToast("请求的资源不存在");
  } else {
    // 其他错误
    console.error("请求失败:", error);
  }
}
```

## 性能优化建议

1. **合理使用缓存**: 对于不经常变化的数据启用缓存
2. **控制并发数**: 根据服务器能力调整最大并发数
3. **设置合理超时**: 避免请求长时间挂起
4. **启用重试机制**: 提高请求成功率
5. **及时取消不需要的请求**: 避免资源浪费

## 文件结构

```
src/core/request/
├── index.ts          # 统一导出入口
├── types.ts          # 类型定义
├── interface.ts      # 接口定义
├── manager.ts        # 核心请求管理器
├── cache.ts          # 缓存管理
├── queue.ts          # 请求队列
├── retry.ts          # 重试策略
├── interceptor.ts    # 拦截器管理
├── example.ts        # 使用示例
└── README.md         # 说明文档
```

## 注意事项

1. 模块基于axios，确保项目已安装axios依赖
2. 默认并发限制为5个请求，可根据需要调整
3. 缓存功能基于内存，页面刷新后缓存会丢失
4. 重试机制仅对网络错误和服务器错误生效
5. 建议在生产环境中配置合适的baseURL和超时时间
