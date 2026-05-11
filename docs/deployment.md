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
NEXT_PUBLIC_API_URL=https://backend-production-xxx.up.railway.app
```

**注意**：
- 使用 Backend 的**外部域名**（Public Domain）
- 因为 Frontend 在浏览器中运行，无法访问 Railway 内部网络
- 域名格式：`https://{service-name}-{random-string}.up.railway.app`

#### 3. 配置 Backend 环境变量

在 Backend 服务的环境变量中添加：

```
FRONTEND_URL=https://frontend-production-yyy.up.railway.app
```

用于 CORS 配置：
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### API 请求示例

#### Frontend 代码

```typescript
// 使用环境变量构建 API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchData() {
  const response = await fetch(`${API_BASE}/api/data`);
  return response.json();
}
```

#### 环境变量配置 (.env.local 开发环境)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Railway 环境变量 (生产环境)

```
NEXT_PUBLIC_API_URL=https://backend-production-xxx.up.railway.app
```

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
| Frontend → Backend | 外部域名 | `https://backend-xxx.up.railway.app` |
| Backend → Database | 内部域名/连接字符串 | `postgresql://...` (自动注入) |
| Backend → Backend | 内部域名 | `http://other-service.railway.internal:4000` |

---

## 环境变量配置

### 必需的环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `PORT` | Railway 自动分配 | 3000, 4000 |
| `DATABASE_URL` | PostgreSQL 连接字符串 | 自动配置 |
| `NODE_ENV` | 运行环境 | production |
| `NEXT_PUBLIC_API_URL` | Backend API 地址 | `https://backend-xxx.up.railway.app` |
| `FRONTEND_URL` | Frontend 地址（CORS） | `https://frontend-yyy.up.railway.app` |

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
