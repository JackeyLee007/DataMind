import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log("Start seeding...");

  // 检查是否已存在管理员，避免重复创建
  let user = await prisma.user.findUnique({
    where: { email: "admin@datamind.ai" },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("admin-123", SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        email: "admin@datamind.ai",
        name: "管理员",
        password: hashedPassword,
        role: "ADMIN",
        plan: "ENTERPRISE",
      },
    });
    console.log("Created admin user:", user.id);
  } else {
    console.log("Admin user already exists, skipping user creation...");
  }

  // 检查是否已存在示例聊天
  const existingChat = await prisma.chat.findFirst({
    where: {
      title: "Q3 销售数据分析",
      userId: user.id,
    },
  });

  let chat;
  if (!existingChat) {
    chat = await prisma.chat.create({
      data: {
        title: "Q3 销售数据分析",
        userId: user.id,
        messages: {
          create: [
            {
              content: "帮我分析这份销售数据",
              role: "user",
            },
            {
              content: "已完成分析，发现线上渠道增长显著",
              role: "assistant",
            },
          ],
        },
      },
    });
    console.log("Created sample chat:", chat.id);
  } else {
    console.log("Sample chat already exists, skipping chat creation...");
    chat = existingChat;
  }

  // 检查是否已存在示例数据源
  const existingDatasource = await prisma.datasource.findFirst({
    where: {
      name: "销售数据 2024.xlsx",
      userId: user.id,
    },
  });

  if (!existingDatasource) {
    await prisma.datasource.create({
      data: {
        name: "销售数据 2024.xlsx",
        type: "excel",
        size: "2.4 MB",
        userId: user.id,
      },
    });
    console.log("Created sample datasource");
  } else {
    console.log("Sample datasource already exists, skipping datasource creation...");
  }

  console.log({ user, chat });
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
