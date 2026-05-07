# DataMind AI — 项目架构设计文档

## 1. 项目概述

**DataMind AI** 是一款多租户 SaaS 智能数据分析平台，类似 Julius AI。用户通过自然语言对话完成数据上传、分析、可视化和报告导出。

- **产品形态**：Web 应用（工作台）+ Landing Page + **后台管理系统（Admin）**
- **目标用户**：数据分析师、产品经理、运营人员、企业决策者
- **核心差异化**：分析过程透明化（实时展示分析步骤）、中文原生、Human-in-the-loop 规划审查
- **后台管理**：隐藏式超级管理员后台，仅系统管理员可访问，用于全局配置和租户管理

---

## 2. 技术架构

### 2.1 整体架构

```
用户浏览器
  │
  ├── Next.js 15 (前端 SSR/SSG)
  │     ├── React + TypeScript + Tailwind CSS
  │     ├── 自写 SSE 数据层（接收 Agent 事件流）
  │     └── ECharts（前端渲染交互式图表）
  │
  └── Express API (后端)
        ├── SaaS 中间件链：helmet → cors → rate-limit → JWT → RBAC → quota → audit
        ├── Mastra（通过 @mastra/express adapter 嵌入）
        │     ├── Agent + Workflow + RAG + Memory + Evals + Observability
        │     └── 自动注册 Agent/Workflow 路由（受 Express 中间件链保护）
        ├── PostgreSQL + RLS（多租户数据隔离）
        ├── Redis Cluster（会话 + 缓存 + 限流）
        ├── BullMQ（异步任务队列）
        └── Python 微服务（Pandas 分析 + matplotlib 静态图）
```

**三层架构**：
1. **SaaS 业务层**：Express 中间件链处理鉴权/限流/配额
2. **AI 分析层**：Mastra 嵌入 Express，不使用 Mastra 内置 Auth
3. **数据计算层**：Python 微服务处理复杂分析

### 2.2 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | Next.js 15 + TypeScript + Tailwind CSS | App Router, Server Components, SSR/SSG/ISR |
| 后端运行时 | Node.js + Express + TypeScript | 无状态设计，支持横向扩展 |
| AI Agent | Mastra (@mastra/core) + @mastra/express | Agent + Workflow + RAG + Memory + Evals + Observability |
| AI 模型 | **Kimi k2.5**（默认）+ GPT-4o + Claude 3.5 Sonnet | 多模型路由，按场景选择，默认 Provider 为 Kimi |
| 数据库 | PostgreSQL + RLS | 行级安全，多租户数据隔离 |
| 缓存/会话 | Redis Cluster | 共享状态，支持多实例 |
| 消息队列 | BullMQ (Redis) | 异步任务，多 Worker |
| 可视化 | ECharts（前端渲染）+ matplotlib（报告导出） | Python 生成 ECharts JSON 配置，前端交互式渲染 |
| 文件处理 | SheetJS + pdf-parse (Node.js) + Pandas (Python) | 轻量解析 Node.js，复杂分析 Python |
| 文件存储 | AWS S3 + KMS | 租户目录隔离，每租户独立密钥 |
| 支付 | Stripe + 微信支付 | 海外 Stripe，国内微信 |
| 后台管理 | Next.js Admin 路由组 + Express Admin API | 隐藏入口，独立认证，超级管理员专属 |

---

## 3. 关键架构决策

| 决策 | 方案 | 理由 |
|------|------|------|
| AI Agent 框架 | **Mastra（Apache 2.0）** | 原生 Human-in-the-loop、Workflow 图编排、内置 Observability + Evals、MCP 支持、40+ LLM 提供商、Apache 2.0 商业许可 |
| Mastra 集成方式 | **@mastra/express adapter 嵌入 Express** | 自动注册 Agent/Workflow 路由，无需独立 AI 服务进程。Mastra 内置 Auth 为 API Key 模式，不适用于 SaaS 多租户 JWT 认证 |
| Express 保留 | **Express 作为 SaaS 后端主框架** | 丰富的中间件生态满足多租户 SaaS 需求：express-jwt、casbin、express-rate-limit、helmet、multer、swagger-ui-express 等 |
| 前端数据层 | **自写 SSE（非 useChat）** | Mastra stream 需要自定义 SSE 协议对接前端，完全可控 |
| 图表渲染 | **Python 生成 ECharts JSON → 前端渲染** | 传输轻量（1-3KB vs 50-200KB PNG），可交互，样式统一 |
| 后端语言 | **Node.js（非 Python）** | 与 Next.js 同语言，类型端到端共享，Mastra 原生 TypeScript |
| Python 微服务 | **仅用于复杂分析** | Pandas/Scikit-learn/Prophet，通过 BullMQ 调用 |
| AI 模型 Provider | **Kimi（默认）** | 中文原生支持优秀，长上下文窗口，k2.5 模型推理能力强，适合数据分析场景 |

---

## 4. AI 模型配置

### 4.1 默认配置

```typescript
// 默认 AI Provider 和模型
const DEFAULT_PROVIDER = 'kimi';
const DEFAULT_MODEL = 'kimi-k2.5';

// 模型配置
const MODEL_CONFIG = {
  kimi: {
    name: 'Kimi',
    models: {
      'kimi-k2.5': { contextWindow: 256000, maxOutputTokens: 8192 },
      'kimi-k2': { contextWindow: 128000, maxOutputTokens: 4096 },
    },
    baseURL: 'https://api.moonshot.cn/v1',
  },
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4o': { contextWindow: 128000, maxOutputTokens: 4096 },
      'gpt-4o-mini': { contextWindow: 128000, maxOutputTokens: 4096 },
    },
    baseURL: 'https://api.openai.com/v1',
  },
  anthropic: {
    name: 'Anthropic',
    models: {
      'claude-3-5-sonnet': { contextWindow: 200000, maxOutputTokens: 4096 },
      'claude-3-haiku': { contextWindow: 200000, maxOutputTokens: 4096 },
    },
    baseURL: 'https://api.anthropic.com',
  },
};
```

### 4.2 模型选择策略

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| 默认对话 | **kimi-k2.5** | 中文理解能力强，长上下文，适合数据分析 |
| 复杂推理 | gpt-4o / claude-3-5-sonnet | 多步推理、代码生成 |
| 快速响应 | gpt-4o-mini / kimi-k2 | 轻量任务，降低成本 |
| 超长文档 | kimi-k2.5 | 256K 上下文，适合大文件分析 |

### 4.3 租户级模型配置模式

管理后台为每个租户配置 AI 模型时，提供三种模式：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **自动** | 系统根据负载、上下文长度、任务类型自动选择最优模型 | 租户无特殊偏好，追求性价比 |
| **系统模型** | 从管理员预设的系统模型列表中选择 | 租户有明确偏好，但使用平台统一管理的 API Key |
| **自定义模型** | 租户自行配置 Provider、模型名、API Key | 企业租户使用自己的 AI 账号 |

```typescript
// 租户 AI 配置模式
type TenantAIMode = 'auto' | 'system' | 'custom';

// 租户 AI 配置结构
interface TenantAIConfig {
  mode: TenantAIMode;
  // mode = 'auto' 时，以下字段为空
  // mode = 'system' 时，使用 systemModelId 引用系统模型
  // mode = 'custom' 时，使用 customConfig 自定义
  systemModelId?: string;
  customConfig?: {
    provider: string;
    model: string;
    apiKey: string;
    baseURL?: string;
  };
}

// 系统预设模型（管理员在后台配置）
interface SystemModel {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;        // 加密存储
  baseURL?: string;
  isDefault: boolean;
  isEnabled: boolean;
  description?: string;
}

// 自动模式路由策略
interface AutoRoutingStrategy {
  // 根据上下文长度选择
  contextThresholds: {
    short: { maxTokens: 4000, model: 'gpt-4o-mini' },
    medium: { maxTokens: 32000, model: 'kimi-k2' },
    long: { maxTokens: 128000, model: 'kimi-k2.5' },
  };
  // 根据任务类型选择
  taskRouting: {
    code: 'claude-3-5-sonnet',      // 代码生成用 Claude
    analysis: 'kimi-k2.5',          // 数据分析用 Kimi
    chat: 'gpt-4o',                 // 普通对话用 GPT-4o
  };
  // 负载均衡：当某个 Provider 失败率过高时切换
  failoverEnabled: boolean;
}
```

### 4.4 管理后台模型配置界面

**系统模型管理页面**（仅超级管理员）：

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI 模型配置                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【系统模型列表】                                            │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ 模型名称     │ Provider    │ 模型ID      │ 状态        │ │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤ │
│  │ Kimi K2.5   │ Kimi        │ kimi-k2.5   │ ✅ 默认     │ │
│  │ GPT-4o      │ OpenAI      │ gpt-4o      │ ✅ 启用     │ │
│  │ Claude 3.5  │ Anthropic   │ claude-3-5  │ ❌ 禁用     │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
│  [+ 添加系统模型]                                            │
│                                                             │
│  【自动路由策略】                                            │
│  上下文阈值：                                                │
│    短文本 (<4K)  →  [gpt-4o-mini ▼]                        │
│    中文本 (<32K) →  [kimi-k2 ▼]                            │
│    长文本 (<128K)→  [kimi-k2.5 ▼]                          │
│  任务类型路由：                                              │
│    代码生成      →  [claude-3-5-sonnet ▼]                  │
│    数据分析      →  [kimi-k2.5 ▼]                          │
│    普通对话      →  [gpt-4o ▼]                             │
│  [✓] 启用故障转移                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**租户模型配置页面**（在租户详情页中）：

```
┌─────────────────────────────────────────────────────────────┐
│  租户：星辰科技  |  AI 模型配置                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  模型选择模式：                                              │
│                                                             │
│  ○ 自动（推荐）                                              │
│    └─ 系统自动根据负载和任务类型选择最优模型                  │
│                                                             │
│  ● 系统模型                                                  │
│    └─ 选择模型：[Kimi K2.5 ▼]                               │
│       可用选项：                                             │
│       ├── Kimi K2.5  (默认)                                 │
│       ├── GPT-4o                                            │
│       └── GPT-4o Mini                                       │
│                                                             │
│  ○ 自定义模型                                                │
│    ├─ Provider：[Kimi ▼]                                    │
│    ├─ 模型名称：[kimi-k2.5 ▼]                               │
│    ├─ API Key ：[•••••••••••• sk-xxx] [验证]                │
│    └─ Base URL ：[https://api.moonshot.cn/v1]               │
│                                                             │
│              [保存配置]  [重置为默认]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 模型解析逻辑

```typescript
// 解析租户最终使用的模型
async function resolveTenantModel(tenantId: string, request: RequestContext): Promise<ResolvedModel> {
  const config = await getTenantAIConfig(tenantId);
  
  switch (config.mode) {
    case 'auto':
      return autoSelectModel(request);
    case 'system':
      return getSystemModel(config.systemModelId);
    case 'custom':
      return validateCustomModel(config.customConfig);
    default:
      return getDefaultModel();
  }
}

// 自动模式选择逻辑
function autoSelectModel(request: RequestContext): ResolvedModel {
  const strategy = getAutoRoutingStrategy();
  
  // 1. 根据上下文长度选择
  if (request.estimatedTokens > strategy.contextThresholds.medium.maxTokens) {
    return strategy.contextThresholds.long.model;
  } else if (request.estimatedTokens > strategy.contextThresholds.short.maxTokens) {
    return strategy.contextThresholds.medium.model;
  }
  
  // 2. 根据任务类型选择
  if (request.taskType && strategy.taskRouting[request.taskType]) {
    return strategy.taskRouting[request.taskType];
  }
  
  // 3. 默认返回系统默认模型
  return getDefaultModel();
}
```

---

## 5. 项目目录结构

```
datamind/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing Page 路由组
│   │   │   └── page.tsx        # 首页（参考 index.html）
│   │   ├── (auth)/             # 登录/注册
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (workspace)/        # 工作台（需认证）
│   │   │   ├── chat/page.tsx   # AI 对话分析页（参考 workspace.html）
│   │   │   ├── datasets/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx      # 工作台布局（三栏）
│   │   ├── (admin)/            # 后台管理系统（隐藏路由，超级管理员）
│   │   │   ├── login/page.tsx  # 管理员登录（独立入口）
│   │   │   ├── dashboard/page.tsx   # 运营概览
│   │   │   ├── tenants/page.tsx     # 租户管理
│   │   │   ├── users/page.tsx       # 用户管理
│   │   │   ├── models/page.tsx      # AI 模型配置
│   │   │   ├── billing/page.tsx     # 计费管理
│   │   │   ├── audit/page.tsx       # 审计日志
│   │   │   ├── system/page.tsx      # 系统设置
│   │   │   └── layout.tsx           # 后台布局（侧边栏 + 主内容）
│   │   └── api/                # API Routes
│   │       ├── auth/
│   │       ├── datasets/
│   │       ├── analysis/       # SSE 端点
│   │       ├── reports/
│   │       └── billing/
│   ├── components/
│   │   ├── chat/               # 聊天相关组件
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── AnalysisSteps.tsx
│   │   │   ├── InlineChart.tsx
│   │   │   ├── InlineTable.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── charts/             # ECharts 封装
│   │   │   ├── ChartRenderer.tsx
│   │   │   └── themes/dark.ts
│   │   ├── workspace/          # 工作台组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DataPanel.tsx
│   │   │   └── DataPreview.tsx
│   │   └── ui/                 # 通用 UI 组件
│   ├── hooks/
│   │   ├── useSSE.ts           # SSE 连接 Hook
│   │   ├── useChat.ts          # 聊天状态管理
│   │   └── useAuth.ts          # 认证状态
│   ├── lib/
│   │   ├── agent/              # Mastra Agent 集成
│   │   │   ├── agent-factory.ts
│   │   │   ├── workflow.ts
│   │   │   ├── tools/
│   │   │   └── memory.ts
│   │   ├── auth/               # JWT + RBAC
│   │   ├── db/                 # PostgreSQL + Drizzle ORM
│   │   ├── redis/              # Redis 客户端
│   │   ├── queue/              # BullMQ 任务队列
│   │   ├── storage/            # S3 文件存储
│   │   ├── billing/            # Stripe + 配额
│   │   └── evals/              # Mastra Evals
│   ├── types/                  # 共享 TypeScript 类型
│   └── styles/                 # 全局样式 + Tailwind 配置
├── server/                     # Express 后端（独立进程）
│   ├── src/
│   │   ├── index.ts            # Express 入口
│   │   ├── routes/             # API 路由
│   │   │   ├── admin/          # 后台管理 API（独立认证）
│   │   │   │   ├── auth.ts     # 管理员登录
│   │   │   │   ├── tenants.ts  # 租户管理
│   │   │   │   ├── users.ts    # 用户管理
│   │   │   │   ├── models.ts   # AI 模型配置
│   │   │   │   ├── billing.ts  # 计费管理
│   │   │   │   ├── audit.ts    # 审计日志
│   │   │   │   └── dashboard.ts # 运营数据
│   │   │   └── ...             # 其他业务路由
│   │   ├── middleware/         # 认证、RBAC、限流、配额、审计
│   │   │   ├── admin-auth.ts   # 管理员 JWT 认证中间件
│   │   │   └── ...             # 其他中间件
│   │   ├── mastra/             # Mastra 配置
│   │   └── services/           # 业务逻辑
│   └── tsconfig.json
├── python-service/             # Python 微服务
│   ├── analysis/
│   ├── export/
│   ├── main.py                 # FastAPI 入口
│   └── requirements.txt
├── CLAUDE.md
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── package.json
└── docker-compose.yml
```

---

## 6. 多租户架构

### 6.1 数据模型

```
tenants (租户)
  └── users (用户，tenant_id 关联)
        └── data_sources (数据源)
        └── analyses (分析记录)
        └── subscriptions (订阅)
```

### 6.2 数据隔离

- **第一层**：应用层 — 每个 SQL 查询带 `WHERE tenant_id = ?`
- **第二层**：数据库层 — PostgreSQL RLS 策略，即使代码漏了 WHERE 也不会跨租户泄露

### 6.3 RBAC 权限

| 操作 | Owner | Admin | Member | Viewer |
|------|-------|-------|--------|--------|
| 管理租户设置 | ✅ | ✅ | ❌ | ❌ |
| 邀请/移除成员 | ✅ | ✅ | ❌ | ❌ |
| 管理订阅/账单 | ✅ | ✅ | ❌ | ❌ |
| 上传数据源 | ✅ | ✅ | ✅ | ❌ |
| 执行分析 | ✅ | ✅ | ✅ | ❌ |
| 查看分析结果 | ✅ | ✅ | ✅ | ✅ |
| 导出报告 | ✅ | ✅ | ✅ | ❌ |

### 6.4 系统管理员（Super Admin）

系统管理员独立于租户体系，拥有平台级最高权限：

| 权限 | 说明 |
|------|------|
| 访问后台管理界面 | 通过隐藏入口 `/admin` 登录 |
| 管理所有租户 | 创建/编辑/禁用/删除租户 |
| 管理所有用户 | 查看/禁用/删除任意租户下的用户 |
| 配置 AI 模型 | 设置默认 Provider、模型参数、API Key |
| 查看全局计费 | 所有租户的消费统计和发票 |
| 查看审计日志 | 全平台操作日志查询 |
| 系统设置 | 邮件模板、通知配置、维护模式 |

### 6.5 JWT 结构

**普通用户 JWT**：

```json
{
  "sub": "user_id",
  "tenant_id": "tenant_uuid",
  "role": "admin",
  "plan": "pro",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**系统管理员 JWT**：

```json
{
  "sub": "admin_id",
  "role": "super_admin",
  "type": "admin",
  "permissions": ["tenants", "users", "models", "billing", "audit", "system"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

```json
{
  "sub": "user_id",
  "tenant_id": "tenant_uuid",
  "role": "admin",
  "plan": "pro",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 7. AI Agent 引擎（Mastra）

### 7.1 Agent 生命周期（含 Human-in-the-loop）

```
用户提问 → Express API → 创建/获取 Agent 实例（按租户）
                          │
                          ▼
                    Workflow.start(question)
                          │
                    ┌─────┴─────┐
                    │ 阶段 1：规划 │ ← Agent 推理，生成执行计划
                    │（无工具执行） │
                    └─────┬─────┘
                          │
                    workflow.suspend() ← 暂停，等待用户审查
                          │
                    ┌─────┴─────┐
                    │ 用户审查计划 │ ← 前端 PlanReviewCard
                    │ 批准/修改/取消│
                    └─────┬─────┘
                          │
                    workflow.resume(plan) ← 用户批准后恢复
                          │
                    ┌─────┴─────┐
                    │ 阶段 2：执行 │ ← Agent 按计划逐步调用工具
                    │（真实工具）  │
                    └─────┬─────┘
                          │
                    Mastra stream → SSE → 前端实时展示
```

### 7.2 工具清单

| 工具名 | 功能 | 执行位置 |
|--------|------|---------|
| `read_csv` | 读取 CSV/Excel 文件 | Node.js |
| `read_database` | 查询数据库 | Node.js |
| `statistics` | 描述性统计 | Node.js |
| `chart_config` | 生成 ECharts JSON 配置 | Node.js |
| `pivot_table` | 交叉分析/透视表 | Python 微服务 |
| `code_executor` | 执行 Python/SQL 代码 | Python 微服务（沙箱） |
| `predict` | 预测建模 | Python 微服务 |
| `classify` | 分类分析 | Python 微服务 |

### 7.3 Mastra Stream → SSE 映射

```typescript
// Mastra Agent stream → 前端 SSE 消息格式
const result = agent.stream(question);

for await (const part of result.fullStream) {
  switch (part.type) {
    case "tool-call":
      sse.send({ type: "step_start", tool: part.toolName });
      break;
    case "tool-result":
      sse.send({ type: "step_done", tool: part.toolName, result: part.result });
      break;
    case "text-delta":
      sse.send({ type: "text_delta", delta: part.textDelta });
      break;
    case "finish":
      sse.send({ type: "analysis_done", tokens: part.usage });
      break;
  }
}
```

---

## 8. 前端设计

### 8.1 设计系统（基于参考稿提取）

**颜色方案（深色主题）**：

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-primary` | `#0a0a0f` | 页面背景 |
| `--bg-secondary` | `#111118` | 卡片背景 |
| `--bg-tertiary` | `#1a1a24` | elevated 表面 |
| `--text-primary` | `#e8e8f0` | 主文本 |
| `--text-secondary` | `#9898b0` | 次要文本 |
| `--text-muted` | `#68687e` | 提示文本 |
| `--accent` | `#6c5ce7` | 主强调色 |
| `--accent-light` | `#8b7cf7` | 强调色亮 |
| `--green` | `#00d68f` | 成功/增长 |
| `--blue` | `#54a0ff` | 信息 |
| `--orange` | `#ff9f43` | 警告 |
| `--red` | `#ff6b6b` | 错误 |

**字体**：
- 显示字体：`Space Grotesk` / `DM Sans`
- 正文字体：`Noto Sans SC`
- 等宽字体：`JetBrains Mono`

### 8.2 页面结构

#### Landing Page（参考 index.html）

```
Navigation (固定顶部，滚动时毛玻璃效果)
├── Logo + 导航链接 + 登录/注册按钮
│
Hero Section (全屏)
├── 动态光晕背景 + 粒子效果
├── 标题 + 副标题 + CTA 按钮
├── 数据统计展示
│
Brands Section
├── 合作企业 Logo
│
How It Works
├── 三步流程卡片
│
Chat Demo Section
├── 交互式聊天演示窗口
│
Features Grid
├── 6 个核心功能卡片
│
Data Sources
├── 4 种数据源支持
│
Templates Grid
├── 6 个场景模板
│
Testimonials
├── 用户评价卡片
│
Security Section
├── 安全合规展示
│
Pricing
├── 三档定价方案
│
CTA Section
├── 最终转化号召
│
Footer
├── 多列链接 + 版权信息
```

#### 工作台（参考 workspace.html）

```
三栏布局：
┌─────────────────┬─────────────────────────────┬─────────────────┐
│   LEFT SIDEBAR  │      MAIN CHAT AREA         │  RIGHT PANEL    │
│   (260px)       │      (flex: 1)              │  (420px)        │
├─────────────────┼─────────────────────────────┼─────────────────┤
│ 数据源列表      │  消息列表（用户/AI）         │ 数据概览标签页   │
│ 导航菜单        │  ├── 文本消息               │ ├── 统计卡片     │
│ 历史记录        │  ├── 分析步骤展示           │ ├── 字段列表     │
│                 │  ├── 内嵌图表               │ ├── 推荐问题     │
│                 │  ├── 内嵌数据表             │ └── Token 用量   │
│                 │  ├── 代码块                 │                 │
│                 │  └── 洞察卡片               │ 字段详情标签页   │
│                 │                             │ 分析设置标签页   │
│                 │  输入框区域                 │                 │
│                 │  ├── 多行文本输入           │                 │
│                 │  ├── 附件/语音按钮          │                 │
│                 │  └── 发送按钮               │                 │
└─────────────────┴─────────────────────────────┴─────────────────┘
```

### 8.3 后台管理界面（Admin）

后台管理采用独立布局，深色主题，左侧固定导航栏 + 右侧主内容区。

**隐藏入口策略**：
- 前端不提供公开的 Admin 入口链接
- 管理员直接访问 `/admin/login` 登录
- 登录成功后跳转 `/admin/dashboard`
- 非管理员访问 `/admin/*` 返回 404（不暴露后台存在）

**后台布局**：

```
┌─────────────────┬──────────────────────────────────────┐
│  ADMIN SIDEBAR  │           MAIN CONTENT               │
│   (240px)       │           (flex: 1)                  │
├─────────────────┼──────────────────────────────────────┤
│ ⚡ DataMind     │  ┌────────────────────────────────┐  │
│    Admin        │  │  页面标题 + 面包屑              │  │
│                 │  ├────────────────────────────────┤  │
│ 📊 运营概览     │  │                                │  │
│ 👥 租户管理     │  │     数据表格 / 图表 / 表单      │  │
│ 🧑‍💻 用户管理     │  │                                │  │
│ 🤖 模型配置     │  │                                │  │
│ 💰 计费管理     │  │                                │  │
│ 📝 审计日志     │  │                                │  │
│ ⚙️ 系统设置     │  │                                │  │
│                 │  │                                │  │
│ ─────────────── │  └────────────────────────────────┘  │
│ 🚪 退出登录     │                                      │
└─────────────────┴──────────────────────────────────────┘
```

**后台页面设计**：

| 页面 | 功能 | 核心组件 |
|------|------|---------|
| **运营概览** | 平台级 KPI 看板 | 统计卡片、趋势图、活跃租户 Top10 |
| **租户管理** | CRUD 租户、启用/禁用 | 数据表格、筛选、分页、操作按钮 |
| **用户管理** | 查看所有用户、禁用账号 | 跨租户用户搜索、详情弹窗 |
| **模型配置** | 设置默认模型、API Key | Provider 卡片、模型选择、参数配置 |
| **计费管理** | 查看消费、发票、退款 | 消费趋势图、账单表格 |
| **审计日志** | 全平台操作记录 | 时间线、筛选器、导出 |
| **系统设置** | 全局配置、维护模式 | 配置表单、开关组件 |

### 8.4 响应式断点

| 断点 | 布局变化 |
|------|---------|
| `> 1200px` | 完整三栏布局 |
| `768px - 1200px` | 隐藏右侧面板，两栏布局 |
| `< 768px` | 隐藏侧边栏，单栏布局 |

---

## 9. 开发阶段规划

### Phase 1（第 1-3 周）：多租户基础 + AI Agent MVP

**目标**：搭建可运行的基础框架，实现核心 AI 对话功能

| 周 | 任务 | 交付物 |
|----|------|--------|
| 1 | 项目初始化、数据库设计、认证系统 | Next.js + Express 项目骨架，PostgreSQL schema，JWT 认证 |
| 2 | Mastra 集成、基础 Agent、SSE 数据层 | AI 对话流，前端消息渲染 |
| 3 | 数据源上传、文件解析、基础图表 | CSV/Excel 上传，数据预览，简单图表 |

### Phase 2（第 4-6 周）：可视化引擎 + 高级分析 + 报告

| 周 | 任务 | 交付物 |
|----|------|--------|
| 4 | ECharts 集成、图表交互、主题系统 | 多种图表类型，深色主题 |
| 5 | Python 微服务、预测建模、代码执行 | 高级分析能力 |
| 6 | 报告生成、导出功能、邮件推送 | PDF/Word 导出 |

### Phase 3（第 7-9 周）：工作台 + 订阅计费 + 配额 + Beta

| 周 | 任务 | 交付物 |
|----|------|--------|
| 7 | 工作台 UI 完善、Human-in-the-loop | PlanReviewCard，Workflow suspend/resume |
| 8 | Stripe 集成、配额系统、RBAC 完善 | 支付流程，用量限制 |
| 9 | 性能优化、Beta 测试准备 | 内测版本 |

### Phase 4（第 10-12 周）：部署上线 + 公开发布 + 迭代

| 周 | 任务 | 交付物 |
|----|------|--------|
| 10 | 生产环境部署、监控配置 | Vercel + AWS 部署 |
| 11 | 公开发布、用户反馈收集 | 正式上线 |
| 12 | 迭代优化、功能增强 | 版本更新 |

---

## 10. 关键约束

1. **多租户安全**：所有数据查询必须带 `tenant_id`，RLS 作为最后防线
2. **AI 成本追踪**：按租户 + 按工具追踪 token 消耗，配额超限自动降级
3. **无状态后端**：Express 不存储任何会话状态，全部放 Redis
4. **Express 中间件链**：所有 API 请求必须经过 helmet → cors → rate-limit → JWT → RBAC → quota → audit
5. **Mastra Auth 不使用**：Mastra 内置 Auth 为 API Key 模式，SaaS 用户认证使用 Express 自定义 JWT + RBAC
6. **文件安全**：S3 租户目录隔离 + KMS 加密，文件访问需验证 tenant_id
7. **前端不依赖 Vercel AI SDK**：使用自写 SSE 数据层对接 Mastra Agent stream
8. **Python 微服务边界**：仅处理复杂分析（Pandas/ML），轻量解析走 Node.js
9. **Human-in-the-loop**：所有复杂分析任务必须先生成计划、用户审查后才能执行
10. **AI 模型可配置**：默认 Provider 为 Kimi，默认模型为 kimi-k2.5，支持租户级自定义配置
11. **后台管理安全**：
    - Admin 路由完全独立，使用单独的 JWT Secret
    - 非管理员访问 `/admin/*` 返回 404，不暴露后台存在
    - 管理员密码使用 bcrypt 加密，强制复杂密码策略
    - Admin 操作全量审计日志，包括 IP、UA、操作内容
    - Admin 登录支持双因素认证（2FA）
    - Admin Session 有效期短（默认 2 小时），支持强制下线
