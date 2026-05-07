# DataMind AI - 项目概览

AI 驱动的智能数据分析平台，让每个人都能轻松获得数据洞察。

## 项目结构

```
DataMind/
├── frontend/              # Next.js 16 + TypeScript + Tailwind CSS
│   ├── src/app/
│   │   ├── landing-page/  # 落地页
│   │   ├── (auth)/        # 登录/注册
│   │   ├── (workspace)/   # 仪表盘/聊天/设置
│   │   └── admin/         # 管理后台
│   ├── Dockerfile         # 前端容器镜像
│   └── package.json
├── backend/               # Express + TypeScript + Prisma ORM
│   ├── src/               # API 源代码
│   ├── prisma/            # 数据库 Schema 和迁移
│   ├── Dockerfile         # 后端容器镜像
│   └── package.json
├── docker-compose.yaml    # 本地一键启动
├── docs/                  # 项目文档
│   ├── dev-plan.md        # 开发计划
│   ├── status-daily-report.md  # 状态日报
│   └── arch-design.md     # 架构设计
└── package.json           # 根目录脚本
```

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
| 容器 | Docker + Docker Compose |

## 快速开始

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

### Docker 一键启动

```bash
# 启动所有服务（PostgreSQL + 后端 + 前端）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 数据库迁移

```bash
cd backend

# 开发环境迁移
npm run db:migrate

# 生成 Prisma Client
npm run db:generate

# 数据库可视化
npm run db:studio

# 数据种子
npm run db:seed
```

## 页面列表

| 页面 | 路径 | 说明 |
|------|------|------|
| Landing Page | `/` | 产品落地页 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 用户注册 |
| 仪表盘 | `/dashboard` | 数据概览 |
| 聊天分析 | `/chat` | AI 对话分析 |
| 设置 | `/settings` | 账户设置 |
| 管理后台 | `/admin` | 平台管理 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册 |
| GET | `/api/datasources` | 数据源列表 |
| GET | `/api/chats` | 对话列表 |
| POST | `/api/chats/:id/messages` | 发送消息 |
| GET | `/api/dashboard/stats` | 仪表盘统计 |
| GET | `/api/admin/users` | 用户管理 |
| GET | `/api/admin/stats` | 平台统计 |

## 开发计划

详见 [docs/dev-plan.md](docs/dev-plan.md)

### 第一周：基础设施
- [x] Docker Compose 本地环境
- [x] Prisma ORM + 数据库迁移
- [ ] GitHub Actions CI/CD

### 第二周：后端核心
- [ ] JWT 认证
- [ ] 文件上传
- [ ] AI 对话引擎

### 第三周：前端对接
- [ ] API 集成
- [ ] 数据可视化
- [ ] 实时对话

### 第四周：测试优化
- [ ] 测试覆盖
- [ ] 性能优化
- [ ] 部署准备

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发计划 | `docs/dev-plan.md` | 详细开发路线图 |
| 状态日报 | `docs/status-daily-report.md` | 项目当前状态 |
| 架构设计 | `docs/arch-design.md` | 系统架构设计 |

---

*用 ❤️ 和 AI 构建*
