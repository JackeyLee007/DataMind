# DataMind AI - 部署指南

## Railway 部署配置说明

### package.json vs railway.json

根据 [Railway 官方文档](https://docs.railway.app/guides/nextjs)，Railway 会按照以下优先级选择配置：

**优先级：`railway.json` > `package.json` > 自动检测**

- 如果存在 `railway.json`，它会**覆盖** dashboard 和 `package.json` 的设置
- 如果没有 `railway.json`，Railway 会使用 `package.json` 中的 `start` 脚本
- 如果都没有，Railway 会尝试自动检测

### 为什么需要 railway.json

| 功能 | `package.json` | `railway.json` |
|------|---------------|----------------|
| 基本启动命令 | ✅ `npm start` | ✅ `startCommand` |
| 自定义构建命令 | ❌ | ✅ `buildCommand` |
| 健康检查路径 | ❌ | ✅ `healthcheckPath` |
| 健康检查超时 | ❌ | ✅ `healthcheckTimeout` |
| 重启策略 | ❌ | ✅ `restartPolicyType` |
| 部署前命令 | ❌ | ✅ `preDeployCommand` |
| 多阶段构建 | ❌ | ✅ 完整控制 |

### 简化方案

如果不需要特殊构建步骤，可以**只用 `package.json`**：

```json
{
  "scripts": {
    "start": "next start -p $PORT"
  }
}
```

但对于 Next.js standalone 部署，保留 `railway.json` 是必要的，因为需要在构建后执行额外的文件复制操作。

---

## Frontend 部署配置

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && cp .next/standalone/frontend/server.js ./server.js"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "lint": "eslint"
  }
}
```

### 关键说明

1. **server.js 位置问题**：Next.js standalone 构建后，`server.js` 位于 `.next/standalone/frontend/server.js`
2. **Railway 要求**：`server.js` 必须在配置的根目录下
3. **解决方案**：在 `buildCommand` 中复制 `server.js` 到根目录

---

## Backend 部署配置

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Prisma + Alpine Linux 问题

部署 backend 时可能遇到错误：
```
Error loading shared library libssl.so.1.1: No such file or directory
```

**原因**：Prisma 需要 OpenSSL 库，但 Alpine Linux 默认不包含

**解决方案**：在 Dockerfile 中安装 openssl

```dockerfile
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache openssl  # <-- 添加这一行
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production

# 构建阶段
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache openssl  # <-- 添加这一行
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl  # <-- 添加这一行

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

---

## Frontend 与 Backend 连接配置

当 Frontend 和 Backend 分别部署为独立服务时，需要配置它们之间的通信。

### 架构：Next.js API Routes 代理

```
浏览器 → Next.js API Route (/api/*) → Railway 内部网络 → Backend (backend.railway.internal:4000)
```

**为什么需要代理层**：
- 浏览器无法访问 Railway 内部网络（`*.railway.internal`）
- 前端代码调相对路径 `/api/*`（同域请求，无 CORS 问题）
- Next.js 服务端 API Route 通过 Railway 内部网络转发到 Backend
- `BACKEND_INTERNAL_URL` 是服务端环境变量，不暴露给浏览器

### Railway 内部网络

Railway 为同一项目内的所有服务提供了内部网络通信能力：

- **内部域名**：`{service-name}.railway.internal`
- **端口**：使用服务内部端口（不是外部域名端口）

### 配置步骤

#### 1. 获取 Backend 内部域名

在 Railway Dashboard 中：
1. 点击 Backend 服务
2. 进入 **Settings** 页面
3. 查看 **Service Name**（例如：`backend`）
4. 内部域名格式：`backend.railway.internal`

#### 2. 配置 Frontend 环境变量

在 Frontend 服务的环境变量中添加：

```
BACKEND_INTERNAL_URL=http://backend.railway.internal:4000
```

**注意**：
- 使用 Backend 的**内部域名**（不是外部 Public Domain）
- 因为请求从 Next.js 服务端发出，可以访问 Railway 内部网络
- **不要**加 `NEXT_PUBLIC_` 前缀，此变量仅在服务端使用
- 端口使用 Backend 的内部端口（默认 4000）

#### 3. 配置 Backend 环境变量

Backend 的 CORS 不需要限制来源，因为前端不再直接调 Backend，而是通过 Next.js 代理。

### API 请求流程

#### 前端代码

```typescript
// 前端调相对路径，由 Next.js API Route 代理
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
```

#### Next.js API Route 代理

```typescript
// src/app/api/[...path]/route.ts
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
// 转发到 http://backend.railway.internal:4000/api/auth/login
```

#### 环境变量配置

| 环境 | `BACKEND_INTERNAL_URL` |
|------|----------------------|
| 本地开发 | `http://localhost:4000` |
| Railway 部署 | `http://backend.railway.internal:4000` |

### 服务间直接通信（Backend → Backend/Database）

如果 Backend 需要连接 Database 或其他服务：

```javascript
// 使用 Railway 提供的内部网络
const DATABASE_URL = process.env.DATABASE_URL;
// Railway 会自动注入 Database 的连接字符串
```

### 总结

| 通信方向 | 使用地址 | 示例 |
|----------|----------|------|
| 浏览器 → Next.js | 相对路径 | `/api/auth/login` |
| Next.js → Backend | Railway 内部域名 | `http://backend.railway.internal:4000` |
| Backend → Database | 内部域名/连接字符串 | `postgresql://...` (自动注入) |

---

## 环境变量配置

### 必需的环境变量

| 变量 | 服务 | 说明 | 示例 |
|------|------|------|------|
| `PORT` | Frontend/Backend | Railway 自动分配 | 3000, 4000 |
| `DATABASE_URL` | Backend | PostgreSQL 连接字符串 | 自动配置 |
| `NODE_ENV` | Frontend/Backend | 运行环境 | production |
| `BACKEND_INTERNAL_URL` | Frontend | Backend 内部地址（服务端） | `http://backend.railway.internal:4000` |

### 端口监听代码示例

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 部署步骤

1. **创建 Railway 项目**
   - 登录 Railway Dashboard
   - 创建新项目

2. **添加服务**
   - Frontend：选择 GitHub 仓库，设置根目录为 `frontend`
   - Backend：选择 GitHub 仓库，设置根目录为 `backend`
   - Database：添加 PostgreSQL 服务

3. **配置环境变量**
   - 在 Railway Dashboard 中设置所需的环境变量

4. **部署**
   - 推送代码到 GitHub 自动触发部署
   - 或在 Dashboard 中手动部署

---

## 故障排查

### 502 错误

**原因**：应用未正确启动或端口监听失败

**检查**：
1. `startCommand` 是否正确指向入口文件
2. 应用是否监听 `PORT` 环境变量
3. 健康检查路径是否可访问

### 静态资源 404

**原因**：standalone 构建未包含静态资源

**解决**：在 `buildCommand` 中复制静态资源
```json
"buildCommand": "npm install && npm run build && cp -r .next/static .next/standalone/frontend/.next/"
```

### Prisma 连接失败

**原因**：数据库连接字符串未配置或网络问题

**检查**：
1. `DATABASE_URL` 环境变量是否正确设置
2. Railway PostgreSQL 服务是否正常运行
