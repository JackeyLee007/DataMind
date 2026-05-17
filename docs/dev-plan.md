# DataMind AI - 开发计划

## 项目概述

AI 驱动的智能数据分析平台，让每个人都能轻松获得数据洞察。

---

## 技术架构

```
DataMind/
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS
├── backend/           # Express + TypeScript + Prisma ORM
├── docker-compose.yaml # 本地一键启动
└── docs/              # 项目文档
```

---

## 开发阶段

### 第一周：基础设施搭建

#### 1.1 CI/CD 管道 & Docker 本地环境
- [x] 创建前端 Dockerfile（多阶段构建）
- [x] 创建后端 Dockerfile（多阶段构建）
- [x] 编写 docker-compose.yaml（PostgreSQL + 后端 + 前端）
- [x] 集成 GitHub Actions CI/CD
- [x] 配置自动化测试流水线
- [x] 配置镜像构建与推送

**部署说明：** 代码提交到 GitHub 后，自动在 Railway 上构建和部署

**一键启动命令：**
```bash
docker-compose up -d
```

**服务架构：**
| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | 5432 | PostgreSQL 数据库 |
| backend | 4000 | Express API 服务 |
| frontend | 3000 | Next.js 前端服务 |

#### 1.2 数据库变更工具（ORM + Migration）
- [x] 集成 Prisma ORM
- [x] 设计数据库 Schema（User, Chat, Message, Datasource, Report）
- [x] 配置数据库迁移脚本
- [x] 创建数据种子脚本

**数据库变更命令：**
```bash
# 开发环境迁移
cd backend && npm run db:migrate

# 生产环境迁移
cd backend && npm run db:migrate:prod

# 生成 Prisma Client
cd backend && npm run db:generate

# 数据库可视化
cd backend && npm run db:studio

# 数据种子
cd backend && npm run db:seed
```

**Schema 变更流程：**
1. 修改 `prisma/schema.prisma`
2. 运行 `npm run db:migrate` 生成迁移文件
3. 运行 `npm run db:generate` 更新客户端
4. 提交迁移文件到版本控制

### 第二周：后端核心功能

#### 2.1 用户认证系统 ✅
- [x] JWT 认证实现
- [x] 密码加密（bcrypt）
- [x] 登录/注册 API
- [x] 权限中间件

#### 2.2 数据源管理
- [ ] 文件上传 API（Excel, CSV, PDF）
- [ ] 数据库连接管理
- [ ] 数据源 CRUD

#### 2.3 AI 对话引擎
- [ ] 集成 OpenAI/Claude API
- [ ] 对话上下文管理
- [ ] 流式响应支持

### 第三周：前端功能对接

#### 3.1 API 集成
- [ ] 封装 API 客户端
- [ ] 用户认证状态管理
- [ ] 错误处理与重试

#### 3.2 数据可视化
- [ ] 集成 ECharts
- [ ] 图表组件封装
- [ ] 数据表格组件

#### 3.3 实时对话
- [ ] WebSocket 连接
- [ ] 消息流式显示
- [ ] 代码高亮渲染

### 第四周：测试与优化

#### 4.1 测试覆盖
- [ ] 单元测试（Vitest）
- [ ] API 集成测试
- [ ] E2E 测试（Playwright）

#### 4.2 性能优化
- [ ] 前端代码分割
- [ ] 数据库查询优化
- [ ] 缓存策略

#### 4.3 部署准备
- [ ] 生产环境配置
- [ ] 日志监控
- [ ] 备份策略

---

## 数据库 Schema

### 模型关系

```
User (1) --- (*) Chat
User (1) --- (*) Datasource
User (1) --- (*) Report
Chat (1) --- (*) Message
```

### 枚举类型

| 枚举 | 值 |
|------|-----|
| Role | USER, ADMIN |
| Plan | FREE, PRO, ENTERPRISE |
| Status | ACTIVE, INACTIVE, SUSPENDED |

---

## 环境变量

### 后端 (.env)

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://datamind:datamind123@localhost:5432/datamind
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### 前端 (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 运行命令

### 本地开发

```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端
npm run dev

# 单独启动
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:4000
```

### Docker 环境

```bash
# 一键启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重建镜像
docker-compose up -d --build
```

---

## API 设计

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 用户
- `GET /api/users` - 用户列表（管理员）
- `GET /api/users/:id` - 用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 数据源
- `GET /api/datasources` - 数据源列表
- `POST /api/datasources` - 创建数据源
- `GET /api/datasources/:id` - 数据源详情
- `DELETE /api/datasources/:id` - 删除数据源

### 对话
- `GET /api/chats` - 对话列表
- `POST /api/chats` - 创建对话
- `GET /api/chats/:id` - 对话详情
- `DELETE /api/chats/:id` - 删除对话
- `POST /api/chats/:id/messages` - 发送消息

### 仪表盘
- `GET /api/dashboard/stats` - 统计数据

### 管理后台
- `GET /api/admin/users` - 用户管理
- `GET /api/admin/stats` - 平台统计

---

## 待办事项

- [ ] GitHub Actions CI/CD 配置
- [ ] 自动化测试流水线
- [ ] 生产环境部署脚本
- [ ] 日志聚合（ELK/Loki）
- [ ] 监控告警（Prometheus + Grafana）
