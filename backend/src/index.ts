import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ===== 健康检查 =====
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== 用户相关 =====
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "用户不存在" });
    }
    
    // TODO: 添加密码验证逻辑
    
    res.json({
      token: "mock-jwt-token",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "登录失败" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({ error: "邮箱已被注册" });
    }
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // TODO: 添加密码哈希
      },
    });
    
    res.json({
      token: "mock-jwt-token",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "注册失败" });
  }
});

// ===== 数据源 =====
app.get("/api/datasources", async (_req, res) => {
  try {
    const datasources = await prisma.datasource.findMany();
    res.json(datasources);
  } catch (error) {
    console.error("Get datasources error:", error);
    res.status(500).json({ error: "获取数据源失败" });
  }
});

app.post("/api/datasources", async (req, res) => {
  try {
    const datasource = await prisma.datasource.create({
      data: req.body,
    });
    res.json(datasource);
  } catch (error) {
    console.error("Create datasource error:", error);
    res.status(500).json({ error: "创建数据源失败" });
  }
});

// ===== 对话 / 分析 =====
app.get("/api/chats", async (_req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ error: "获取对话失败" });
  }
});

app.post("/api/chats", async (req, res) => {
  try {
    const chat = await prisma.chat.create({
      data: {
        title: req.body.title || "新对话",
        userId: req.body.userId,
      },
    });
    res.json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ error: "创建对话失败" });
  }
});

app.post("/api/chats/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  try {
    // 保存用户消息
    await prisma.message.create({
      data: {
        chatId: id,
        role: "user",
        content,
      },
    });
    
    // 模拟 AI 回复
    const assistantMessage = await prisma.message.create({
      data: {
        chatId: id,
        role: "assistant",
        content: `收到你的问题："${content}"。这是一个模拟回复。`,
      },
    });
    
    // 更新对话时间
    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
    
    res.json(assistantMessage);
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ error: "发送消息失败" });
  }
});

// ===== 仪表盘统计 =====
app.get("/api/dashboard/stats", async (_req, res) => {
  try {
    const [chats, datasources, reports] = await Promise.all([
      prisma.chat.count(),
      prisma.datasource.count(),
      prisma.report.count(),
    ]);
    
    res.json({
      chats,
      datasources,
      charts: 0, // TODO: 添加图表统计
      reports,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "获取统计失败" });
  }
});

// ===== 管理后台 =====
app.get("/api/admin/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

app.get("/api/admin/stats", async (_req, res) => {
  try {
    const [totalUsers, activeSessions] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count({ where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    ]);
    
    res.json({
      totalUsers,
      monthlyRevenue: 0, // TODO: 添加收入统计
      activeSessions,
      conversionRate: 0, // TODO: 添加转化率统计
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ error: "获取管理统计失败" });
  }
});

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing HTTP server and Prisma client");
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`DataMind API server running on http://localhost:${PORT}`);
});
