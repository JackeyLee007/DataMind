# DataMind AI - 项目状态日报

> 日期：2026-05-06

---

## 项目结构

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

---

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

---

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

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + TypeScript |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| UI 组件 | shadcn/ui |
| 图标 | Lucide React |
| 后端框架 | Express + TypeScript |
| 开发工具 | tsx (热重载) |

---

## 运行命令

```bash
# 同时启动前后端
npm run dev

# 单独启动前端
npm run dev:frontend   # http://localhost:3000

# 单独启动后端
npm run dev:backend    # http://localhost:4000

# 构建前端
npm run build

# 安装所有依赖
npm run install:all
```

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:4000 |

---

## 待办事项

- [ ] 后端数据库连接（PostgreSQL / MongoDB）
- [ ] 用户认证 JWT 实现
- [ ] AI 对话接口集成（OpenAI / Claude）
- [ ] 数据源文件上传功能
- [ ] 图表生成与导出
- [ ] 前端 API 对接
- [ ] 测试覆盖
