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

---

## Prisma 数据库迁移指南

### 常用命令

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npx prisma generate` | 根据 schema 生成 Prisma Client | schema 变更后、安装依赖后 |
| `npx prisma migrate dev --name <名称>` | 创建并应用迁移（开发环境） | 本地开发时修改 schema 后 |
| `npx prisma migrate deploy` | 应用已有迁移（生产环境） | CI/CD 部署、生产环境启动 |
| `npx prisma migrate status` | 查看迁移状态 | 检查当前数据库与迁移文件的差异 |
| `npx prisma studio` | 打开可视化数据管理界面 | 本地调试、查看/编辑数据 |
| `npx prisma db seed` | 执行 seed 脚本填充初始数据 | 初始化环境数据 |

### 开发环境迁移流程

```bash
# 1. 修改 prisma/schema.prisma

# 2. 创建并应用迁移（自动生成 SQL 迁移文件）
npx prisma migrate dev --name add_user_profile

# 3. 重新生成 Prisma Client（migrate dev 会自动触发）
npx prisma generate

# 4. 可选：填充测试数据
npx prisma db seed
```

### 生产环境迁移流程

```bash
# 1. 确保迁移文件已提交到版本控制

# 2. 只应用迁移，不生成新文件
npx prisma migrate deploy

# 3. 启动应用
npm start
```

### 项目脚本配置

[backend/package.json](file:///Users/li.pc/workload/kiro-projs/DataMind/backend/package.json) 中已配置：

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

- `postinstall`：每次 `npm install` 后**自动**生成 Prisma Client
- `db:migrate`：开发环境创建并应用迁移
- `db:migrate:prod`：生产环境只应用已有迁移

### 重要注意事项

#### 1. 必须先生成 Prisma Client

Prisma Client 是根据 `schema.prisma` **自动生成的类型安全数据库客户端**，存储在 `node_modules/@prisma/client` 中。

**以下情况必须重新生成**：
- 修改了 `schema.prisma`（新增/修改/删除模型、字段、枚举）
- 新克隆项目或删除 `node_modules` 后
- 切换分支后 schema 有变更

**以下情况不需要重新生成**：
- 只修改业务代码，不动 schema
- 修改迁移文件（`migration.sql`）但不改 schema

#### 2. 开发 vs 生产迁移命令的区别

| | `migrate dev` | `migrate deploy` |
|--|---------------|------------------|
| **环境** | 本地开发 | 生产 / CI |
| **生成迁移文件** | ✅ 会提示创建 | ❌ 不会创建 |
| **交互式** | ✅ 会提示确认 | ❌ 非交互 |
| **自动应用** | ✅ 自动应用到数据库 | ✅ 自动应用 |
| **生成 Client** | ✅ 自动触发 | ❌ 需手动运行 `generate` |

> ⚠️ **生产环境严禁使用 `migrate dev`**，因为它会尝试创建新迁移文件并可能提示交互式输入，导致部署失败。

#### 3. 迁移文件必须纳入版本控制

`prisma/migrations/` 目录下的所有文件（包括 `migration.sql` 和 `migration_lock.toml`）**必须提交到 Git**。这是生产环境 `migrate deploy` 的依据。

```bash
git add prisma/migrations/
git commit -m "feat: add user profile migration"
```

#### 4. 环境变量配置

Prisma 通过 `DATABASE_URL` 环境变量连接数据库：

```bash
# 本地开发（连接 Docker 中的 PostgreSQL）
DATABASE_URL=postgresql://datamind:datamind123@localhost:5432/datamind

# Docker Compose 内部（容器间通信）
DATABASE_URL=postgresql://datamind:datamind123@postgres:5432/datamind
```

#### 5. Docker / Alpine Linux 特殊处理

部署到 Alpine Linux 容器时，Prisma 需要 OpenSSL 库：

```dockerfile
# 必须在 Dockerfile 中安装 openssl
RUN apk add --no-cache openssl
```

详见上文 [Prisma + Alpine Linux 问题](#prisma--alpine-linux-问题) 章节。

#### 6. 数据丢失风险

`migrate dev` 在以下情况会提示重置数据库（**开发环境数据会丢失**）：
- 迁移文件被手动修改导致不一致
- 数据库状态与迁移历史不匹配

**建议**：开发环境重置前，先备份重要数据或使用 `prisma db seed` 恢复。

---

## Railway 部署时的 Prisma 迁移

### 核心方案：启动时自动执行迁移

在 Railway 上，数据库迁移应在**应用启动前**自动执行，而不是手动操作。这是通过修改 `startCommand` 实现的。

### 配置方式

#### 方式一：使用 `railway.json`（推荐）

修改 [backend/railway.json](file:///Users/li.pc/workload/kiro-projs/DataMind/backend/railway.json) 的 `deploy.startCommand`：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**关键点**：`npx prisma migrate deploy && node dist/index.js`
- 每次部署启动时，先执行 `migrate deploy` 应用待执行的迁移
- 迁移成功后，再启动 Node.js 应用
- `&&` 确保迁移失败时应用不会启动

#### 方式二：使用 `package.json` 脚本

如果没有 `railway.json`，可以在 `package.json` 中配置：

```json
{
  "scripts": {
    "start": "npx prisma migrate deploy && node dist/index.js"
  }
}
```

### Railway 部署流程

```
代码推送 → Railway 构建 → 启动容器 → migrate deploy → 启动应用
```

| 阶段 | 执行内容 | 说明 |
|------|----------|------|
| **Build** | `npm install && npm run build` | 安装依赖、编译 TypeScript |
| **Deploy** | `npx prisma migrate deploy && node dist/index.js` | 应用迁移、启动服务 |

### 环境变量配置

Railway 会自动为同一项目内的 PostgreSQL 服务注入 `DATABASE_URL`，无需手动设置。如果需要自定义，在 Railway Dashboard → Backend 服务 → Variables 中添加：

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

> `Postgres` 是你的 PostgreSQL 服务名称，Railway 会自动解析为实际连接字符串。

### 重要注意事项

#### 1. 迁移文件必须先提交到 Git

Railway 部署时读取的是仓库中的迁移文件，**本地生成的迁移必须 push 后才能生效**：

```bash
# 本地开发：修改 schema 后创建迁移
npx prisma migrate dev --name add_new_feature

# 必须提交到 Git
git add prisma/migrations/
git commit -m "feat: add new feature migration"
git push origin main
```

#### 2. 使用 `migrate deploy` 而非 `migrate dev`

| | `migrate dev` | `migrate deploy` |
|--|---------------|------------------|
| Railway 适用性 | ❌ 不适用 | ✅ 适用 |
| 交互式提示 | 有（会卡住） | 无 |
| 生成新迁移文件 | 会 | 不会 |
| 行为 | 开发工具 | 纯执行 |

> `migrate dev` 设计用于开发环境，会尝试创建新迁移并提示交互式确认，在 Railway 无头环境中会**卡住导致部署失败**。

#### 3. 首次部署（空数据库）

`migrate deploy` 会自动按顺序执行 `prisma/migrations/` 下的所有迁移，从零创建完整的数据库结构，无需额外操作。

#### 4. 迁移失败处理

如果迁移失败（如 SQL 语法错误）：
1. 查看 Railway 部署日志定位错误
2. 修复本地迁移文件或 schema
3. 重新创建迁移（开发环境）
4. 提交并推送
5. Railway 自动重新部署

#### 5. Seed 数据

如果需要首次部署时填充初始数据，可以在 `startCommand` 中加入 seed：

```json
{
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"
  }
}
```

> ⚠️ 注意：`db seed` 默认会重复执行，建议只在首次部署时运行，或在 seed 脚本中添加幂等性检查（如 `upsert` 而非 `create`）。
