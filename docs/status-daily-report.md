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

## 待办事项

- [x] Railway 前端部署配置
- [ ] Railway 后端部署配置
- [ ] 后端数据库连接（PostgreSQL）
- [ ] 用户认证 JWT 实现
- [ ] AI 对话接口集成（OpenAI / Claude）
- [ ] 数据源文件上传功能
- [ ] 图表生成与导出
- [ ] 前端 API 对接
- [ ] 测试覆盖
