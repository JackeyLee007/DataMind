# DataMind AI - 项目开发日报

---

# 2026-05-14

## Railway 部署 Prisma Seed 问题解决

### 问题背景
在 Railway 上部署 backend 时，`prisma migrate deploy` 成功后执行 `prisma db seed` 失败，经历多次尝试才最终解决。

### 失败原因与解决过程

#### 1. 缺少 `prisma.seed` 配置
**错误**：`Error: To configure seeding in your project you need to add a "prisma.seed" property in your package.json`

**原因**：Prisma 需要知道如何执行 seed 脚本，必须在 `package.json` 中配置 `prisma.seed` 字段。

**解决**：
```json
{
  "prisma": {
    "seed": "node --import tsx prisma/seed.ts"
  }
}
```

#### 2. `tsx` 命令找不到（ENOENT）
**错误**：`Error: Command failed with ENOENT: tsx prisma/seed.ts spawn tsx ENOENT`

**原因**：
- Dockerfile 使用多阶段构建，`runner` 阶段只复制了生产依赖的 `node_modules`
- `tsx` 是开发依赖（`devDependencies`），不在生产依赖中
- `npx prisma db seed` 执行时需要 `tsx`，但找不到

**解决**：修改 Dockerfile，从 `builder` 阶段复制完整的 `node_modules`（包含所有依赖）：
```dockerfile
# 从 builder 阶段复制完整的 node_modules（包含 devDependencies，tsx 需要）
COPY --from=builder /app/node_modules ./node_modules
```

#### 3. Seed 脚本重复执行问题
**潜在问题**：每次部署都会执行 seed，如果数据已存在会报错或创建重复数据。

**解决**：修改 `prisma/seed.ts` 为幂等操作，先检查数据是否存在：
```typescript
// 检查是否已存在管理员，避免重复创建
let user = await prisma.user.findUnique({
  where: { email: "admin@datamind.ai" },
});

if (!user) {
  user = await prisma.user.create({ ... });
} else {
  console.log("Admin user already exists, skipping...");
}
```

### 最终成功的配置

**backend/package.json**：
```json
{
  "prisma": {
    "seed": "node --import tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

**backend/Dockerfile**（关键部分）：
```dockerfile
# 运行阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

# 从 builder 阶段复制完整的 node_modules（包含 devDependencies）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# 执行数据库迁移、seed，然后启动应用
CMD sh -c "npx prisma migrate deploy && node --import tsx prisma/seed.ts && node dist/index.js"
```

### 关键经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Prisma 找不到 seed 命令 | 缺少 `prisma.seed` 配置 | 在 package.json 中添加配置 |
| tsx 命令不存在 | runner 阶段只有生产依赖 | 从 builder 阶段复制完整 node_modules |
| Seed 重复执行报错 | 数据已存在时再次插入 | 修改 seed.ts 为幂等操作 |

### 部署流程
现在 Railway 部署时自动执行：
1. `npx prisma migrate deploy` - 应用数据库迁移
2. `node --import tsx prisma/seed.ts` - 执行 seed（幂等，不会重复创建）
3. `node dist/index.js` - 启动应用

## 高优先级任务完成

### 1. 注册页面对接 Backend API

**修改文件**：`frontend/src/app/(auth)/register/page.tsx`

**变更内容**：
- 添加 `useAuth` hook 调用 `register` 方法
- 添加表单验证（姓名、邮箱、密码必填，密码至少8位）
- 添加错误提示和加载状态
- 注册成功后跳转到 `/dashboard`

### 2. bcrypt 密码加密

**修改文件**：`backend/src/index.ts`

**变更内容**：
- 安装 `bcrypt` 和 `@types/bcrypt`
- 注册时使用 `bcrypt.hash(password, SALT_ROUNDS)` 加密密码
- 登录时使用 `bcrypt.compare(password, user.password)` 验证密码

### 3. JWT 认证实现

**修改文件**：`backend/src/index.ts`

**变更内容**：
- 安装 `jsonwebtoken` 和 `@types/jsonwebtoken`
- 添加 `generateToken(userId)` 函数，生成 7 天有效期的 JWT
- 添加 `verifyToken(token)` 函数，验证 JWT 有效性
- 添加 `authenticateToken` 中间件，保护需要认证的路由
- 新增 `GET /api/auth/me` 接口，返回当前用户信息

### 4. 前端认证路由守卫

**修改文件**：
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/app/(workspace)/layout.tsx`

**变更内容**：
- `useAuth` hook 添加 `isLoading` 状态
- 页面加载时自动验证 token 有效性（调用 `/api/auth/me`）
- `WorkspaceLayout` 添加认证检查，未登录用户自动跳转到 `/login`
- 认证页面（dashboard、chat、settings）受保护

### 关键代码示例

**后端 JWT 认证中间件**：
```typescript
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "令牌无效或已过期" });
  }

  (req as any).userId = decoded.userId;
  next();
}
```

**前端路由守卫**：
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
  }
}, [isLoading, isAuthenticated, router]);
```

### 认证路由守卫详解

**什么是路由守卫？**

路由守卫是一种保护机制，用于控制用户能否访问某些页面。就像小区门口的保安：
- 业主（已登录）→ 放行进入
- 陌生人（未登录）→ 拦下，去登记（登录页）

**为什么放在 layout.tsx？**

`(workspace)` 目录下的所有页面共享这个布局：
- `/dashboard`
- `/chat`
- `/settings`

一个守卫，保护所有页面，不需要在每个页面重复写。

**工作流程：**

```
用户访问 /dashboard
        ↓
检查 isLoading（是否正在验证 token）
        ↓
检查 isAuthenticated（是否已登录）
    ├─ 是 → 显示 dashboard 页面
    └─ 否 → 自动跳转到 /login
```

**完整的认证流程：**

```
1. 用户登录
   └─ 后端返回 JWT token
   └─ 前端存储 token 到 localStorage

2. 访问受保护页面
   └─ layout.tsx 检查 isAuthenticated
   └─ useAuth 验证 token 有效性（调用 /api/auth/me）

3. token 有效
   └─ 显示页面内容

4. token 无效/过期
   └─ 清除 localStorage
   └─ 跳转到登录页
```

**守卫前 vs 守卫后对比：**

| 场景 | 守卫前 | 守卫后 |
|------|--------|--------|
| 未登录访问 /dashboard | 能看到页面（报错或空白） | 自动跳转到 /login |
| 未登录访问 /chat | 能看到页面 | 自动跳转到 /login |
| 已登录访问 /dashboard | 正常显示 | 正常显示 |

---

# 2026-05-13

## 今日开发目标

1. **用 docker-compose 搭建 PostgreSQL 和 Redis**，用于本地开发测试
2. **生成数据库迁移文件**（`prisma migrate dev --name init`）
3. **保证 login、register 流程成功**（bcrypt 密码哈希 + 真实密码验证）

---

# 2026-05-12

## Railway 部署问题排查

### 1. Prisma 迁移文件缺失

**问题**：Railway 部署 backend 时报错 `No migration found in prisma/migrations`。

**原因**：`prisma/migrations/` 目录不存在，项目从未执行过 `prisma migrate dev`，因此没有生成迁移文件。`prisma migrate deploy`（生产环境迁移命令）要求该目录下有迁移文件才能执行。

**解决方案**：需要在本地执行 `prisma migrate dev --name init` 生成初始迁移文件，然后提交到仓库。本地执行需要可连接的 PostgreSQL 数据库：

```bash
# 方式1：使用 Docker 临时启动 PostgreSQL
docker run --name temp-postgres \
  -e POSTGRES_USER=datamind \
  -e POSTGRES_PASSWORD=datamind123 \
  -e POSTGRES_DB=datamind \
  -p 5432:5432 -d postgres:15

cd backend
DATABASE_URL="postgresql://datamind:datamind123@localhost:5432/datamind" npx prisma migrate dev --name init

# 清理
docker stop temp-postgres && docker rm temp-postgres
```

**状态**：⚠️ 待执行（本地无运行中的 PostgreSQL）

### 2. 默认管理员用户配置

**现状分析**：

- `prisma/seed.ts` 中硬编码了管理员用户：
  ```ts
  email: "admin@datamind.ai",
  password: "hashed-password",  // ← 明文占位符，未哈希
  role: "ADMIN",
  ```
- 登录接口 `POST /api/auth/login` 密码验证为 TODO 状态
- 注册接口 `POST /api/auth/register` 密码存储为明文

**安全方案讨论**：

| 方案 | 安全性 | 说明 |
|------|--------|------|
| A. 环境变量 + bcrypt 哈希 | ★★★★ | 密码通过 Railway 环境变量传入，seed 时 bcrypt 哈希后存库。源码中不保留密码。 |
| B. 手动执行 seed 命令 | ★★★ | 不自动 seed，手动在 Railway 终端执行。密码存在于命令历史中。 |
| C. 首次启动生成随机密码 | ★★★★ | 自动生成随机强密码打印到日志，通过日志查看。 |

**共识**：seed 设置的密码为**初始密码**，用户首次登录后必须修改。需在 User 模型增加 `mustChangePassword` 字段。

**待实施**：
- [ ] 安装 `bcrypt` 依赖
- [ ] 修改 `seed.ts`：从环境变量读取管理员信息 + bcrypt 哈希
- [ ] 更新 `.env.example` 添加 `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`
- [ ] User 模型增加 `mustChangePassword` 字段
- [ ] 登录接口实现真实密码验证（bcrypt compare）
- [ ] 登录响应中包含 `mustChangePassword` 标记
- [ ] 前端：检测到 `mustChangePassword=true` 时强制跳转修改密码页面

### 3. Railway 内部域名与服务间通信

**关键发现**：

1. **内部域名必须保持为 `<服务名>.railway.internal`**
   - Railway 为每个服务分配内部域名，格式为 `<service-name>.railway.internal`
   - 其他服务必须使用此内部域名才能访问，不能使用外部公网域名
   - 例如：frontend 代理到 backend 时，必须用 `http://backend.railway.internal:4000`

2. **使用变量 + 引用方式获取其他服务域名**
   - 在 Railway 中，不要硬编码其他服务的域名
   - 应使用 Railway 的**变量引用**语法：`${{ backend.RAILWAY_PRIVATE_DOMAIN }}`
   - 在服务的 Variables 面板中配置：
     ```
     BACKEND_INTERNAL_URL=http://${{ backend.RAILWAY_PRIVATE_DOMAIN }}:4000
     ```
   - 这样当 backend 服务重建/迁移时，域名会自动更新，无需手动修改

**配置示例**（frontend 服务变量）：
```
BACKEND_INTERNAL_URL=http://${{ backend.RAILWAY_PRIVATE_DOMAIN }}:4000
```

**配置示例**（backend 服务变量）：
```
DATABASE_URL=postgresql://datamind:datamind123@${{ postgres.RAILWAY_PRIVATE_DOMAIN }}:5432/datamind
```

## 当前架构图

```
浏览器
  ↓ (HTTPS)
Next.js Frontend (frontend.railway.internal:3000)
  ↓ API Route 代理 (内部网络)
Express Backend (backend.railway.internal:4000)
  ↓ Prisma
PostgreSQL (postgres.railway.internal:5432)
```

## 待办事项更新

- [ ] 生成 Prisma 迁移文件（`prisma migrate dev --name init`）
- [ ] 实现管理员初始密码安全方案（环境变量 + bcrypt + mustChangePassword）
- [ ] Railway 变量配置改用引用语法（`${{ service.RAILWAY_PRIVATE_DOMAIN }}`）
- [ ] 注册页面对接 Backend
- [ ] JWT 真实实现（bcrypt + jsonwebtoken）
- [ ] 认证路由守卫

---

# 2026-05-07

## Railway 部署实践

成功配置 Railway 部署流程，支持前后端分离部署。

## Next.js 工程构建目录结构

当 `package.json` 不在仓库根目录下时（如 `frontend/package.json`），Next.js standalone 构建后的目录结构为：

```
<project_root>/
└── frontend/
    └── .next/
        └── standalone/
            └── frontend/          # <-- 多一层目录
                ├── server.js
                └── .next/
```

**关键发现**：构建输出会保留原始目录名作为子目录。

## Railway 部署要求

- **server.js 位置**：Railway 要求 `server.js` 在配置的根目录下
- **根目录配置**：部署时可指定子目录作为服务根目录（如 `frontend`）
- **端口监听**：应用必须监听 `PORT` 环境变量（Railway 自动分配）

## Railway 部署配置

**frontend/railway.json**：
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

**关键配置项**：
- `buildCommand`: 构建命令，构建后将 server.js 复制到根目录
- `startCommand`: 启动命令（从根目录启动）
- `healthcheckPath`: 健康检查路径

## 端口配置

应用代码中应使用环境变量：
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Backend 部署

**backend/railway.json**：
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

## Prisma + Alpine Linux 问题修复

部署 backend 时遇到 Prisma 缺少 OpenSSL 库错误：
```
Error loading shared library libssl.so.1.1: No such file or directory
```

**解决方案**：在 Dockerfile 中安装 openssl
```dockerfile
RUN apk add --no-cache openssl
```

**状态**：✅ Backend 已在 Railway 部署成功

---

# 2026-05-06

## 项目结构初始化

```
DataMind/
├── frontend/              # Next.js 前端
│   ├── src/app/
│   │   ├── landing-page/  # 落地页
│   │   ├── (auth)/        # 登录/注册
│   │   ├── (workspace)/   # 仪表盘/聊天/设置
│   │   └── admin/         # 管理后台
│   └── package.json
├── backend/               # Express 后端
│   ├── src/index.ts       # API 接口
│   └── package.json
└── docs/                  # 项目文档
```

## 已完成页面

| 页面 | 路径 | 状态 |
|------|------|------|
| Landing Page | `/` | ✅ |
| 登录 | `/login` | ✅ |
| 注册 | `/register` | ✅ |
| 仪表盘 | `/dashboard` | ✅ |
| 聊天分析 | `/chat` | ✅ |
| 设置 | `/settings` | ✅ |
| 管理后台 | `/admin` | ✅ |

## 后端 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册 |
| GET | `/api/datasources` | 数据源列表 |
| POST | `/api/datasources` | 添加数据源 |
| GET | `/api/chats` | 对话列表 |
| POST | `/api/chats` | 创建对话 |
| POST | `/api/chats/:id/messages` | 发送消息 |
| GET | `/api/dashboard/stats` | 仪表盘统计 |
| GET | `/api/admin/users` | 用户管理 |
| GET | `/api/admin/stats` | 平台统计 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + TypeScript |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| UI 组件 | shadcn/ui |
| 图标 | Lucide React |
| 后端框架 | Express + TypeScript |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 开发工具 | tsx (热重载) |

## 运行命令

```bash
# 同时启动前后端（本地开发）
npm run dev

# 单独启动前端
npm run dev:frontend   # http://localhost:3000

# 单独启动后端
npm run dev:backend    # http://localhost:4000

# Docker Compose 启动
cd docker && docker-compose up -d

# 安装所有依赖
npm run install:all
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 (本地) | http://localhost:3000 |
| 后端 API (本地) | http://localhost:4000 |

---

# 2026-05-10

## 架构决策

**决策**：选择 **方案 A — Next.js API Routes 代理 + Railway 内部网络**

```
浏览器 → Next.js API Route (/api/*) → Railway 内部网络 → Backend (backend.railway.internal:4000)
```

**关键点**：
- 浏览器无法访问 Railway 内部网络，所以前端调相对路径 `/api/*`
- Next.js 服务端 API Route 代理请求到 Backend 内部域名
- 本地开发时 `BACKEND_INTERNAL_URL=http://localhost:4000`
- Railway 部署时 `BACKEND_INTERNAL_URL=http://backend.railway.internal:4000`
- `BACKEND_INTERNAL_URL` 是服务端环境变量，不暴露给浏览器（无 `NEXT_PUBLIC_` 前缀）

## 今日完成

### ✅ Frontend-Backend 登录连接

- 创建 `frontend/src/lib/api.ts` — API 客户端封装（调相对路径 `/api/*`，自动携带 JWT token）
- 创建 `frontend/src/hooks/useAuth.ts` — 认证状态管理 Hook（login/register/logout + localStorage 持久化）
- 创建 `frontend/src/app/api/[...path]/route.ts` — Next.js API Route 代理层（转发到 Backend）
- 修改 `frontend/.env.local` — 配置 `BACKEND_INTERNAL_URL=http://localhost:4000`
- 修改 `frontend/src/app/(auth)/login/page.tsx` — 接入真实登录 API + 修复 @base-ui Button 不触发表单提交的 bug
- 修改 `frontend/src/app/(workspace)/dashboard/page.tsx` — 侧边栏显示真实用户信息 + 退出登录按钮

### 登录流程

```
用户输入邮箱+密码
→ 前端 fetch("/api/auth/login")  （相对路径，同域请求）
→ Next.js API Route 代理转发到 BACKEND_INTERNAL_URL/api/auth/login
→ 后端查数据库验证
→ 返回 mock-jwt-token + 用户信息
→ 前端存入 localStorage
→ 跳转 /dashboard → 侧边栏显示真实用户名/邮箱
```

### Bug 修复

**@base-ui/react Button 强制覆盖 type 属性**：Button 组件内部将 `type` 设为 `'button'`，导致 `type="submit"` 无效，表单无法提交。修复方式：登录按钮改用原生 `<button>` 元素。

---

## Frontend-Backend 连接 TODO List

### Phase 1：认证系统（当前阶段）

- [x] API 客户端封装（`src/lib/api.ts`）
- [x] 认证状态管理 Hook（`src/hooks/useAuth.ts`）
- [x] 登录页面对接 Backend
- [x] Dashboard 显示真实用户信息 + 退出登录
- [ ] 注册页面对接 Backend（`/register`）
- [ ] JWT 真实实现（后端：密码 bcrypt 哈希 + JWT 签发 + 验证中间件）
- [ ] 认证路由守卫（未登录访问 workspace 页面自动跳转 `/login`）
- [ ] `GET /api/auth/me` 端点（验证 token 有效性，返回当前用户）

### Phase 2：核心业务对接

- [ ] Dashboard 统计数据对接（`GET /api/dashboard/stats`）
- [ ] Chat 页面对接（对话列表 + 创建对话 + 发送消息）
- [ ] 数据源管理对接（列表 + 上传）
- [ ] 设置页面对接（加载/保存用户设置）

### Phase 3：AI 能力

- [ ] AI 对话接口集成（OpenAI / Kimi）
- [ ] SSE 流式响应（后端 → 前端实时渲染）
- [ ] Mastra Agent 集成

### Phase 4：管理后台

- [ ] Admin 统计数据对接
- [ ] Admin 用户管理对接
- [ ] Admin 独立认证（管理员 JWT）

### Phase 5：安全加固

- [ ] 后端 CORS 限制来源
- [ ] 后端请求限流（rate-limit）
- [ ] 后端输入验证（zod）
- [ ] 后端统一错误处理中间件
- [ ] 后端 API 鉴权中间件（JWT 验证）

---

# 2026-05-08

## 明日开发计划

### 1. 架构决策：Frontend-Backend 通信方案

**决策项**：选择 Frontend 与 Backend 的通信架构方案

#### 方案对比

| 方案 | 复杂度 | 安全性 | 适用场景 |
|------|--------|--------|----------|
| **A. Next.js API Routes 代理** | 低 | 中 | 单 Backend 服务，快速实现 |
| **B. 独立 BFF 服务** | 高 | 高 | 多 Backend 服务，复杂鉴权 |

#### 方案 A：Next.js API Routes 代理

**优点**：
- 无需额外服务，架构简单
- 利用 Railway 内部网络通信（`backend.railway.internal`）
- 部署维护成本低

**缺点**：
- Frontend 服务承担代理职责
- 无法处理复杂的聚合逻辑

**实现方式**：
```typescript
// API Route 代理到 Backend
fetch('http://backend.railway.internal:4000/api/...')
```

#### 方案 B：独立 BFF 服务

**优点**：
- 统一 API 网关，支持多后端聚合
- 独立的认证/鉴权层
- 更好的扩展性

**缺点**：
- 需要额外部署维护一个服务
- 架构复杂度增加

#### 决策参考因素

- [ ] 当前是否只有 1 个 Backend 服务？
- [ ] 是否需要聚合多个后端服务？
- [ ] 认证逻辑是否复杂？
- [ ] 团队是否有维护 BFF 的资源？

**建议**：现阶段选择 **方案 A**，当 Backend 服务超过 2-3 个时再考虑 BFF。

### 2. 实施方案（根据决策结果）

如果选择方案 A：
- [ ] 创建 Next.js API Routes 代理
- [ ] 配置 `BACKEND_INTERNAL_URL` 环境变量
- [ ] 更新 Frontend 调用代码使用相对路径 `/api/*`
- [ ] 测试内部网络通信

如果选择方案 B：
- [ ] 设计 BFF 服务架构
- [ ] 创建 BFF 项目结构
- [ ] 实现代理和认证逻辑
- [ ] 部署 BFF 服务

**参考文档**：`docs/deployment.md` - Frontend 与 Backend 连接配置章节

---

## 待办事项

- [x] Railway 前端部署配置
- [x] Railway 后端部署配置
- [ ] Railway Frontend 与 Backend 连接配置
- [x] 前端 API 客户端封装
- [x] 前端登录页面对接 Backend
- [x] 前端用户信息显示 + 退出登录
- [ ] 前端注册页面对接 Backend
- [ ] 后端数据库连接（PostgreSQL）
- [ ] 用户认证 JWT 真实实现（bcrypt + jsonwebtoken）
- [ ] 认证路由守卫
- [ ] AI 对话接口集成（OpenAI / Claude / Kimi）
- [ ] 数据源文件上传功能
- [ ] 图表生成与导出
- [ ] 前端 API 对接（Dashboard/Chat/Settings）
- [ ] 测试覆盖
