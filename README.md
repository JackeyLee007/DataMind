# DataMind AI

AI 驱动的智能数据分析平台，让每个人都能轻松获得数据洞察。

## 项目结构

```
DataMind/
├── frontend/          # Next.js 前端应用
│   ├── src/app/       # 页面路由
│   ├── src/components/# 组件
│   └── package.json   # 前端依赖
├── backend/           # Express 后端 API
│   ├── src/           # 源代码
│   └── package.json   # 后端依赖
└── docs/              # 项目文档
```

## 快速开始

### 安装所有依赖

```bash
npm run install:all
```

### 同时启动前后端

```bash
npm run dev
```

- 前端: http://localhost:3000
- 后端 API: http://localhost:4000

### 单独启动

```bash
# 仅前端
npm run dev:frontend

# 仅后端
npm run dev:backend
```

## 页面

| 页面 | 路径 |
|------|------|
| Landing Page | `/` |
| 登录 | `/login` |
| 注册 | `/register` |
| 仪表盘 | `/dashboard` |
| 聊天分析 | `/chat` |
| 设置 | `/settings` |
| 管理后台 | `/admin` |
