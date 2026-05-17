import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role, TenantRole } from "@prisma/client";
import { authenticateToken, AuthRequest } from "./middleware/auth";
import datasourceRoutes from "./routes/datasources";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || "datamind-secret-key";
const SALT_ROUNDS = 10;

interface JWTPayload {
  userId: string;
  tenantId?: string | null;
  tenantRole?: string | null;
  role: string;
}

function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

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
    // 查找无租户的用户（系统管理员）或指定租户的用户
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: null, // 优先查找无租户的用户（管理员）
      },
    });

    if (!user) {
      return res.status(401).json({ error: "用户不存在或密码错误" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "用户不存在或密码错误" });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId,
      tenantRole: user.tenantRole,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantRole: user.tenantRole,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "登录失败" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, tenantName, inviteCode } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 如果有邀请码，加入现有租户
    if (inviteCode) {
      // TODO: 验证邀请码并获取 tenantId
      return res.status(501).json({ error: "邀请码功能待实现" });
    }

    // 系统管理员注册（role=ADMIN）
    if (req.body.role === Role.ADMIN) {
      const existingAdmin = await prisma.user.findFirst({
        where: { email, tenantId: null },
      });

      if (existingAdmin) {
        return res.status(409).json({ error: "管理员邮箱已被注册" });
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });

      const token = generateToken({
        userId: user.id,
        tenantId: null,
        tenantRole: null,
        role: user.role,
      });

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // 普通用户注册 - 创建新租户
    const result = await prisma.$transaction(async (tx) => {
      // 创建租户
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName || name || email.split("@")[0],
        },
      });

      // 创建用户，设置为租户 OWNER
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.USER,
          tenantId: tenant.id,
          tenantRole: TenantRole.OWNER,
        },
      });

      return { tenant, user };
    });

    const token = generateToken({
      userId: result.user.id,
      tenantId: result.user.tenantId,
      tenantRole: result.user.tenantRole,
      role: result.user.role,
    });

    res.json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        tenantId: result.user.tenantId,
        tenantRole: result.user.tenantRole,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "注册失败" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        tenantRole: true,
        plan: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    // 如果有租户，返回租户信息
    let tenant = null;
    if (user.tenantId) {
      tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, name: true, status: true },
      });
    }

    res.json({ user, tenant });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "获取用户信息失败" });
  }
});

// ===== 租户管理 =====
app.post("/api/tenants/invite", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tenantId } = req;
    const { email, role = TenantRole.MEMBER } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: "您不属于任何租户" });
    }

    // 检查当前用户是否有权限邀请（OWNER 或 ADMIN）
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantRole: true },
    });

    if (!currentUser?.tenantRole || (currentUser.tenantRole !== TenantRole.OWNER && currentUser.tenantRole !== TenantRole.ADMIN)) {
      return res.status(403).json({ error: "无权邀请成员" });
    }

    // TODO: 生成邀请码并发送邮件
    const inviteCode = Math.random().toString(36).substring(2, 15);

    res.json({
      inviteCode,
      message: `邀请已生成，请发送给 ${email}`,
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ error: "邀请失败" });
  }
});

app.get("/api/tenants/members", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tenantId } = req;

    if (!tenantId) {
      return res.status(400).json({ error: "您不属于任何租户" });
    }

    const members = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        tenantRole: true,
        status: true,
        createdAt: true,
      },
    });

    res.json(members);
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "获取成员列表失败" });
  }
});

app.patch("/api/tenants/members/:id/role", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tenantId } = req;
    const memberId = String(req.params.id);
    const { role } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: "您不属于任何租户" });
    }

    // 检查当前用户是否是 OWNER
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantRole: true },
    });

    if (currentUser?.tenantRole !== TenantRole.OWNER) {
      return res.status(403).json({ error: "只有 OWNER 可以修改角色" });
    }

    // 不能修改自己的角色
    if (memberId === userId) {
      return res.status(400).json({ error: "不能修改自己的角色" });
    }

    const updated = await prisma.user.update({
      where: { id: memberId, tenantId },
      data: { tenantRole: role },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "更新角色失败" });
  }
});

app.delete("/api/tenants/members/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tenantId } = req;
    const memberId = String(req.params.id);

    if (!tenantId) {
      return res.status(400).json({ error: "您不属于任何租户" });
    }

    // 检查当前用户是否有权限移除（OWNER 或 ADMIN）
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantRole: true },
    });

    if (!currentUser?.tenantRole || (currentUser.tenantRole !== TenantRole.OWNER && currentUser.tenantRole !== TenantRole.ADMIN)) {
      return res.status(403).json({ error: "无权移除成员" });
    }

    // 不能移除自己
    if (memberId === userId) {
      return res.status(400).json({ error: "不能移除自己" });
    }

    // 将用户移出租户
    await prisma.user.update({
      where: { id: memberId, tenantId },
      data: { tenantId: null, tenantRole: null },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "移除成员失败" });
  }
});

// ===== 数据源 =====
app.use("/api/datasources", datasourceRoutes);

// ===== 对话 / 分析 =====
app.get("/api/chats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tenantId } = req;

    const where = tenantId ? { tenantId } : { userId };

    const chats = await prisma.chat.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ error: "获取对话失败" });
  }
});

app.post("/api/chats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tenantId } = req;

    const chat = await prisma.chat.create({
      data: {
        title: req.body.title || "新对话",
        userId,
        tenantId,
      },
    });
    res.json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ error: "创建对话失败" });
  }
});

app.post("/api/chats/:id/messages", authenticateToken, async (req: AuthRequest, res) => {
  const chatId = String(req.params.id);
  const { content } = req.body;

  try {
    // 验证对话权限
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        ...(req.tenantId ? { tenantId: req.tenantId } : { userId: req.userId }),
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "对话不存在" });
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content,
      },
    });

    // 模拟 AI 回复
    const assistantMessage = await prisma.message.create({
      data: {
        chatId,
        role: "assistant",
        content: `收到你的问题："${content}"。这是一个模拟回复。`,
      },
    });

    // 更新对话时间
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    res.json(assistantMessage);
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ error: "发送消息失败" });
  }
});

// ===== 仪表盘统计 =====
app.get("/api/dashboard/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tenantId, userId, role } = req;

    let where: any = {};
    if (role === Role.ADMIN) {
      // 管理员可以查看全局统计
      where = {};
    } else if (tenantId) {
      where = { tenantId };
    } else {
      where = { userId };
    }

    const [chats, datasources, reports] = await Promise.all([
      prisma.chat.count({ where }),
      prisma.datasource.count({ where }),
      prisma.report.count({ where }),
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
app.get("/api/admin/users", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // 只允许系统管理员访问
    if (req.role !== Role.ADMIN) {
      return res.status(403).json({ error: "无权访问" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        tenantRole: true,
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

app.get("/api/admin/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // 只允许系统管理员访问
    if (req.role !== Role.ADMIN) {
      return res.status(403).json({ error: "无权访问" });
    }

    const [totalUsers, totalTenants, activeSessions] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.chat.count({ where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    ]);

    res.json({
      totalUsers,
      totalTenants,
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
