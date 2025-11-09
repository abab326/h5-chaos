# 请求服务使用文档

本项目基于 axios 封装了统一的请求服务，提供了类型安全、拦截器管理、错误处理等功能。

## 目录结构

```
src/services/
├── index.ts      # 入口文件
├── request.ts    # 请求封装核心
├── types.ts      # 类型定义
├── api.ts        # API 接口管理
└── README.md     # 使用文档
```

## 基础使用

### 1. 导入请求实例

```typescript
import { request } from '@/services'
import api from '@/services/api'
```

### 2. 基础请求方法

#### GET 请求
```typescript
// 简单 GET 请求
const result = await request.get('/api/users')

// 带参数的 GET 请求
const result = await request.get('/api/users', { 
  page: 1, 
  size: 10 
})

// 带选项的 GET 请求
const result = await request.get('/api/users', { page: 1 }, {
  showLoading: true,    // 显示 loading
  showError: true,      // 显示错误提示
  retryCount: 3,        // 重试次数
})
```

#### POST 请求
```typescript
// 创建用户
const result = await request.post('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})

// 带选项的 POST 请求
const result = await request.post('/api/users', userData, {
  showLoading: false,    // 不显示 loading
  showError: false,     // 不显示错误提示
})
```

#### PUT、DELETE、PATCH 请求
```typescript
// 更新用户
const result = await request.put('/api/users/1', userData)

// 删除用户
const result = await request.delete('/api/users/1')

// 部分更新
const result = await request.patch('/api/users/1', { name: '李四' })
```

### 3. 文件上传

```typescript
import { uploadApi } from '@/services'

// 上传单个文件
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

const result = await uploadApi.uploadImage(file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
  }
})

// 批量上传
const files = Array.from(fileInput.files)
const result = await uploadApi.uploadMultiple(files, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
  }
})
```

### 4. 文件下载

```typescript
// 下载文件
await request.download('/api/files/1', {
  filename: 'document.pdf',
  onProgress: (progress) => {
    console.log(`下载进度: ${progress}%`)
  }
})
```

## API 接口管理

### 1. 用户相关 API

```typescript
import { userApi } from '@/services'

// 登录
const loginResult = await userApi.login({
  username: 'admin',
  password: '123456'
})

// 获取用户信息
const userInfo = await userApi.getUserInfo()

// 更新用户信息
await userApi.updateUserInfo({
  username: '新用户名',
  email: 'new@example.com'
})
```

### 2. 通用 CRUD API

```typescript
import { createCrudApi } from '@/services'

// 创建文章 API
const articleApi = createCrudApi<Article>('articles')

// 使用文章 API
const articles = await articleApi.getList({ page: 1, size: 10 })
const article = await articleApi.getDetail(1)
const newArticle = await articleApi.create({
  title: '新文章',
  content: '文章内容'
})
await articleApi.update(1, { title: '更新后的标题' })
await articleApi.delete(1)
```

### 3. 预定义的 API

项目中已经预定义了一些常用的 API：

- `userApi`: 用户相关接口
- `uploadApi`: 文件上传接口
- `articleApi`: 文章管理接口
- `productApi`: 产品管理接口
- `systemApi`: 系统相关接口

## 请求配置

### 1. 创建自定义实例

```typescript
import { createRequest } from '@/services'

// 创建自定义配置的请求实例
const customRequest = createRequest({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'X-Custom-Header': 'value'
  }
})

// 使用自定义实例
const result = await customRequest.get('/users')
```

### 2. 请求选项

每个请求方法都支持以下选项：

```typescript
interface RequestOptions {
  showLoading?: boolean    // 是否显示 loading（默认 true）
  showError?: boolean      // 是否显示错误提示（默认 true）
  retryCount?: number      // 重试次数（默认 0）
  retryDelay?: number      // 重试延迟（默认 1000ms）
}
```

#### 重试功能说明

重试功能会在以下情况下自动重试：
- 网络错误（无响应）
- 请求超时（ECONNABORTED）
- 服务器错误（5xx 状态码）

不会重试的情况：
- 客户端错误（4xx 状态码）
- 业务逻辑错误

#### 重试使用示例

```typescript
// 重试 3 次，每次间隔 1 秒
const result = await request.get('/api/users', { page: 1 }, {
  retryCount: 3,
  retryDelay: 1000
})

// 重试 5 次，每次间隔 2 秒
const result = await request.post('/api/users', userData, {
  retryCount: 5,
  retryDelay: 2000
})
```

## 错误处理

### 1. 业务错误

业务错误会返回统一的错误格式：

```typescript
try {
  const result = await request.get('/api/users')
} catch (error) {
  // error 类型为 RequestError
  console.error('错误码:', error.code)
  console.error('错误消息:', error.message)
  console.error('错误数据:', error.data)
  
  // 根据错误码处理不同情况
  if (error.code === 401) {
    // 未授权，跳转到登录页
    router.push('/login')
  } else if (error.code === 403) {
    // 权限不足
    showPermissionError()
  }
}
```

### 2. 网络错误

网络错误会自动处理并转换为统一的错误格式：

- 请求超时
- 网络连接错误
- 服务器错误（500、502、503 等）

## 拦截器功能

### 1. 请求拦截器

自动添加的功能：

- 添加认证 token
- 添加时间戳防止缓存
- 设置请求头

### 2. 响应拦截器

自动处理的功能：

- 统一响应格式处理
- 业务错误处理
- 网络错误处理
- 401 错误自动跳转登录页

## 类型安全

所有 API 都支持 TypeScript 类型检查：

```typescript
// 获取用户信息，返回类型为 ResponseData<{ id: number; username: string; ... }>
const result = await userApi.getUserInfo()

// TypeScript 会自动推断类型
const userId: number = result.data.id
const username: string = result.data.username

// 创建用户，需要传入正确的参数类型
await userApi.create({
  username: 'test',      // ✅ 正确
  password: '123456',    // ✅ 正确
  email: 'test@example.com' // ✅ 正确
  // invalidField: 'value' // ❌ TypeScript 会报错
})
```

## 环境配置

请求服务会自动读取环境变量：

```env
# .env
VITE_API_BASE_URL=https://api.example.com
```

如果没有设置环境变量，默认使用 `/api` 作为基础路径。

## 最佳实践

### 1. 使用 API 管理

推荐使用预定义的 API 接口，而不是直接使用 `request` 实例：

```typescript
// ✅ 推荐
import { userApi } from '@/services'
const result = await userApi.getUserInfo()

// ❌ 不推荐
import { request } from '@/services'
const result = await request.get('/api/user/info')
```

### 2. 错误处理

始终使用 try-catch 处理异步请求：

```typescript
try {
  const result = await userApi.getUserInfo()
  // 处理成功结果
} catch (error) {
  // 统一错误处理
  console.error('请求失败:', error)
  // 可以在这里显示错误提示
}
```

### 3. 类型定义

为每个 API 接口定义完整的类型：

```typescript
// types/user.ts
export interface User {
  id: number
  username: string
  email: string
  avatar: string
  createTime: string
}

// services/api.ts
export const userApi = {
  getUserInfo: () => request.get<User>('/api/user/info'),
  updateUserInfo: (data: Partial<User>) => request.put('/api/user/info', data),
}
```

## 扩展功能

### 1. 添加自定义拦截器

如果需要添加自定义拦截器，可以扩展 `Request` 类：

```typescript
class CustomRequest extends Request {
  constructor(config: RequestConfig = {}) {
    super(config)
    this.setupCustomInterceptors()
  }

  private setupCustomInterceptors() {
    // 添加自定义请求拦截器
    this.instance.interceptors.request.use((config) => {
      // 自定义逻辑
      return config
    })

    // 添加自定义响应拦截器
    this.instance.interceptors.response.use((response) => {
      // 自定义逻辑
      return response
    })
  }
}
```

### 2. 添加缓存功能

可以实现请求缓存功能：

```typescript
const cache = new Map()

// 带缓存的 GET 请求
async function getWithCache<T>(url: string, params?: any, cacheTime = 300000) {
  const cacheKey = JSON.stringify({ url, params })
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)
    if (Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }
  }

  const result = await request.get<T>(url, params)
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  })
  
  return result
}
```