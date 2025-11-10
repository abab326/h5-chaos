# Services 文件夹说明

## 功能概述

Services 文件夹提供了项目的网络请求服务层，封装了 HTTP 请求的核心功能，为应用程序提供统一的 API 调用接口。

## 文件结构

- **index.ts**: 导出文件，统一导出所有模块
- **request.ts**: 核心请求模块，实现了 HTTP 请求的封装和功能扩展
- **types.ts**: 类型定义文件，提供了所有相关的 TypeScript 接口

## 核心功能

### 1. HTTP 请求封装

`request.ts` 中的 `Request` 类封装了以下功能：

- **基础请求方法**：提供 get、post、put、delete、patch 等 HTTP 方法的封装
- **请求配置**：支持自定义 baseURL、timeout、headers 等配置
- **拦截器**：请求拦截器自动添加 token 和时间戳，响应拦截器统一处理响应和错误
- **错误处理**：区分业务错误和网络错误，提供友好的错误提示
- **重试机制**：支持请求失败后的自动重试功能，可配置重试次数和延迟时间
- **Loading 管理**：提供全局 loading 状态的显示和隐藏

### 2. 文件处理功能

- **文件上传**：支持文件上传，并提供上传进度回调
- **文件下载**：支持文件下载，自动处理文件名和下载流程

### 3. 类型系统

`types.ts` 定义了完整的类型接口：

- `RequestConfig`：请求配置接口
- `ResponseData`：响应数据格式接口
- `RequestError`：请求错误接口
- `RequestOptions`：请求选项接口
- `UploadFileOptions` 和 `DownloadFileOptions`：文件处理相关选项

## 使用方式

### 基本使用

```typescript
import request from '@/services';

// GET 请求
const result = await request.get('/api/user', { id: 1 });

// POST 请求
const result = await request.post('/api/user', { name: 'John' }, {
  showLoading: true,
  retryCount: 2
});
```

### 创建自定义实例

```typescript
import { createRequest } from '@/services';

const customRequest = createRequest({
  baseURL: '/custom-api',
  timeout: 5000
});
```

### 文件上传

```typescript
const formData = new FormData();
formData.append('file', file);

const result = await request.upload('/api/upload', formData, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`);
  }
});
```

## 错误处理

请求失败时会返回统一的错误格式：

```typescript
interface RequestError {
  code: number;  // 错误码
  message: string;  // 错误消息
  data?: any;  // 错误数据
}
```

系统会自动处理 401 等特殊错误，例如自动跳转到登录页面。

## 重试策略

可通过 `retryCount` 和 `retryDelay` 配置重试策略，系统会对以下情况进行重试：

- 网络错误
- 请求超时
- 服务器错误（5xx）