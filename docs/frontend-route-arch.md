# Frontend 路由代理架构

## 1. 架构概述

在 DataMind 项目中，Frontend 到 Backend 的通信采用 **Next.js API Route 代理层** 方案。该方案解决了部署在 Railway 等容器平台上的前后端服务间内部网络通信问题。

```
用户浏览器
  │
  ├── Next.js 前端页面（Client-side，在浏览器中运行）
  │     └── React Components
  │
  └── Next.js 服务端（Server-side，在 Railway 容器中运行）
        ├── API Routes (/api/*)  ← 代理层
        │     └── 转发请求到 Backend
        └── Backend (Express API)
              └── 业务逻辑处理
```

## 2. 双运行时特性

Next.js 应用具有独特的**双运行时**架构：

| 运行时 | 执行位置 | 职责 | 网络能力 |
|--------|---------|------|---------|
| **前端页面** | 用户浏览器 | UI 渲染、用户交互、状态管理 | 只能访问公网地址 |
| **Next.js 服务端** | Railway 容器 | SSR、API Routes、Server Components | 可访问 Railway 内部网络 |

### 2.1 为什么需要代理层

在 Railway 部署环境中：
- Backend 服务分配有**内部域名**（如 `backend.railway.internal`）
- 内部域名仅在 Railway 内部网络可解析
- 浏览器端代码无法访问内部网络地址
- Next.js 服务端与 Backend 处于同一内部网络，可直接通信

因此，Frontend 页面代码将请求发送到同域的 `/api/*` 路由，由 Next.js 服务端代理转发到 Backend 内部地址。

## 3. 代理层实现

### 3.1 API Route 文件

文件路径：`frontend/src/app/api/[...path]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  const backendPath = pathSegments.join("/");
  const url = `${BACKEND_URL}/api/${backendPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "DELETE") {
    body = await request.text();
  }

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "后端服务不可用" },
      { status: 502 }
    );
  }
}
```

### 3.2 动态路由段设计 `[...path]`

API Route 文件位于 `frontend/src/app/api/[...path]/route.ts`，其中 `[...path]` 是 Next.js 的 **catch-all 动态路由段**，其设计意图如下：

| 特性 | 说明 |
|------|------|
| **多段匹配** | 可匹配任意层级的路径，如 `/api/auth/login`、`/api/datasets/123/analysis` |
| **数组参数** | `params.path` 是字符串数组，包含所有匹配的路径段 |
| **必须至少有一段** | 与 `[[...path]]`（optional catch-all）不同，`[...path]` 要求至少有一个路径段 |

**路径匹配示例**：

| 请求路径 | `params.path` 值 | 后端转发地址 |
|---------|-----------------|-------------|
| `/api/auth/login` | `['auth', 'login']` | `/api/auth/login` |
| `/api/datasets` | `['datasets']` | `/api/datasets` |
| `/api/datasets/123/analysis` | `['datasets', '123', 'analysis']` | `/api/datasets/123/analysis` |

**为什么采用 catch-all 设计**：

- **一个文件处理所有 API 请求**：无需为每个后端路由创建单独的 `route.ts`
- **避免代码重复**：四种 HTTP 方法（GET/POST/PUT/DELETE）共享同一个路径匹配和代理逻辑
- **统一处理**：认证透传、错误处理、日志记录等逻辑只需写一次

**对比其他方案**：

| 方案 | 文件结构 | 缺点 |
|------|---------|------|
| **Catch-all（当前）** | `api/[...path]/route.ts` | 一个文件处理所有请求，简洁 |
| 单独路由 | `api/auth/login/route.ts`、`api/datasets/route.ts`... | 文件数量爆炸，每个都要写重复代理逻辑 |
| 中间件 | `middleware.ts` 拦截 | 不适合复杂请求体处理 |

代码中通过 `pathSegments.join("/")` 将数组拼接为完整路径：

```typescript
const backendPath = pathSegments.join("/");  // ['auth', 'login'] → "auth/login"
const url = `${BACKEND_URL}/api/${backendPath}`;
```

### 3.3 代理层职责

1. **请求转发**：接收所有 `/api/*` 请求，转发到 Backend 对应路径
2. **Header 透传**：保留 `Authorization` 等关键请求头
3. **响应透传**：将 Backend 响应原样返回给前端
4. **错误处理**：Backend 不可用时返回 502 错误

## 4. 前端 API 客户端

文件路径：`frontend/src/lib/api.ts`

```typescript
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // 仅在浏览器环境读取 token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("datamind_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || `请求失败 (${res.status})` };
    }

    return { data };
  } catch {
    return { error: "网络错误，请检查后端服务是否启动" };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
```

### 4.1 客户端特点

- **相对路径请求**：使用 `/api/auth/login` 而非完整 URL，确保请求发到同域 API Route
- **自动 Token 注入**：从 `localStorage` 读取 JWT token，自动附加到请求头
- **统一错误处理**：网络错误和 HTTP 错误统一封装为 `error` 字段

## 5. 环境变量配置

文件路径：`frontend/.env.local`

```
BACKEND_INTERNAL_URL=http://localhost:4000
```

### 5.1 环境变量说明

| 变量名 | 说明 | 本地开发 | Railway 部署 |
|--------|------|---------|-------------|
| `BACKEND_INTERNAL_URL` | Backend 内部地址 | `http://localhost:4000` | `http://backend.railway.internal:4000` |

注意：`BACKEND_INTERNAL_URL` 不需要 `NEXT_PUBLIC_` 前缀，因为它只在服务端（API Route）中使用，不会暴露到浏览器端。

## 6. 请求流程示例

以登录请求为例，完整流程如下：

```
1. 用户在浏览器点击登录按钮
   ↓
2. 前端页面代码调用 api.post('/api/auth/login', credentials)
   ↓
3. 浏览器发送 POST 请求到 https://frontend.railway.app/api/auth/login
   ↓
4. Next.js 服务端接收到请求（API Route 执行）
   ↓
5. 代理层转发到 http://backend.railway.internal:4000/api/auth/login
   ↓
6. Backend 处理登录逻辑，返回 JWT token
   ↓
7. 代理层将响应返回给浏览器
   ↓
8. 前端页面存储 token，更新用户状态
```

## 7. 与其他方案的对比

| 方案 | 实现方式 | 优点 | 缺点 |
|------|---------|------|------|
| **API Route 代理**（当前采用） | Next.js 服务端转发 | 安全、支持内部网络、统一入口 | 增加一层转发延迟 |
| 直接请求公网地址 | 前端直接调 Backend 公网域名 | 简单直接 | 暴露后端地址、需处理 CORS |
| API Gateway | 独立网关服务 | 统一认证、限流 | 增加基础设施复杂度 |

## 8. 注意事项

1. **内部域名安全**：Backend 内部地址不暴露给公网，提升安全性
2. **CORS 简化**：前端请求同域，无需处理跨域问题
3. **Serverless 限制**：API Route 执行受 Vercel/Railway 函数超时限制，长连接需特殊处理
4. **调试方法**：本地开发时 `BACKEND_INTERNAL_URL` 指向 localhost，部署时切换为内部域名
