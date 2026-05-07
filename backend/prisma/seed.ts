import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  const user = await prisma.user.create({
    data: {
      email: "admin@datamind.ai",
      name: "管理员",
      password: "hashed-password",
      role: "ADMIN",
      plan: "ENTERPRISE",
    },
  });

  const chat = await prisma.chat.create({
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

  await prisma.datasource.create({
    data: {
      name: "销售数据 2024.xlsx",
      type: "excel",
      size: "2.4 MB",
      userId: user.id,
    },
  });

  console.log({ user, chat });
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
