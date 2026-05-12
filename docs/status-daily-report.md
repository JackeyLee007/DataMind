# DataMind AI - 项目开发日报

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
