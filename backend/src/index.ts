import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ===== 健康检查 =====
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== 用户相关 =====
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  res.json({
    token: "mock-jwt-token",
    user: { id: "1", email, name: "用户" },
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email } = req.body;
  res.json({
    token: "mock-jwt-token",
    user: { id: "2", email, name },
  });
});

// ===== 数据源 =====
app.get("/api/datasources", (_req, res) => {
  res.json([
    { id: "1", name: "销售数据 2024.xlsx", type: "excel", size: "2.4 MB" },
    { id: "2", name: "用户行为日志", type: "postgres", size: "实时" },
    { id: "3", name: "市场调研报告.pdf", type: "pdf", size: "5.1 MB" },
  ]);
});

app.post("/api/datasources", (req, res) => {
  res.json({ id: Date.now().toString(), ...req.body, status: "connected" });
});

// ===== 对话 / 分析 =====
app.get("/api/chats", (_req, res) => {
  res.json([
    { id: "1", title: "Q3 销售数据分析", updatedAt: "2024-01-15T10:00:00Z" },
    { id: "2", title: "用户留存率预测", updatedAt: "2024-01-14T08:30:00Z" },
    { id: "3", title: "产品库存优化", updatedAt: "2024-01-13T16:45:00Z" },
  ]);
});

app.post("/api/chats", (req, res) => {
  res.json({ id: Date.now().toString(), title: req.body.title || "新对话" });
});

app.post("/api/chats/:id/messages", (req, res) => {
  const { content } = req.body;
  res.json({
    id: Date.now().toString(),
    role: "assistant",
    content: `收到你的问题："${content}"。这是一个模拟回复。`,
    createdAt: new Date().toISOString(),
  });
});

// ===== 仪表盘统计 =====
app.get("/api/dashboard/stats", (_req, res) => {
  res.json({
    chats: 128,
    datasources: 12,
    charts: 86,
    reports: 15,
  });
});

// ===== 管理后台 =====
app.get("/api/admin/users", (_req, res) => {
  res.json([
    { id: "1", name: "张明远", email: "zhang@example.com", plan: "专业版", status: "active" },
    { id: "2", name: "李思涵", email: "li@example.com", plan: "企业版", status: "active" },
  ]);
});

app.get("/api/admin/stats", (_req, res) => {
  res.json({
    totalUsers: 12458,
    monthlyRevenue: 426000,
    activeSessions: 1284,
    conversionRate: 18.6,
  });
});

app.listen(PORT, () => {
  console.log(`DataMind API server running on http://localhost:${PORT}`);
});
