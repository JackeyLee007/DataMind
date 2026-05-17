-- 添加多租户支持的迁移

-- 1. 创建新枚举类型
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "DatasourceType" AS ENUM ('EXCEL', 'CSV', 'PDF', 'POSTGRES', 'MYSQL', 'SQLSERVER', 'ORACLE', 'OCEANBASE', 'DORIS', 'STARROCKS', 'MONGODB', 'ELASTICSEARCH', 'GOOGLE_SHEETS', 'S3', 'OSS', 'MINIO');
CREATE TYPE "DatasourceStatus" AS ENUM ('ACTIVE', 'PROCESSING', 'ERROR', 'INACTIVE');

-- 2. 创建租户表
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- 3. 修改 users 表 - 添加租户字段
ALTER TABLE "users" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "users" ADD COLUMN "tenant_role" "TenantRole";

-- 4. 移除旧的 email 唯一约束，添加组合唯一约束
DROP INDEX "users_email_key";
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");

-- 5. 添加外键关联
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. 修改 chats 表 - 添加 tenant_id
ALTER TABLE "chats" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "chats" ADD CONSTRAINT "chats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. 修改 datasources 表 - 添加新字段和 tenant_id
ALTER TABLE "datasources" ADD COLUMN "status" "DatasourceStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "datasources" ADD COLUMN "file_name" TEXT;
ALTER TABLE "datasources" ADD COLUMN "file_size" INTEGER;
ALTER TABLE "datasources" ADD COLUMN "file_path" TEXT;
ALTER TABLE "datasources" ADD COLUMN "mime_type" TEXT;
ALTER TABLE "datasources" ADD COLUMN "connection_config" JSONB;
ALTER TABLE "datasources" ADD COLUMN "preview_data" JSONB;
ALTER TABLE "datasources" ADD COLUMN "column_schema" JSONB;
ALTER TABLE "datasources" ADD COLUMN "row_count" INTEGER;
ALTER TABLE "datasources" ADD COLUMN "tenant_id" TEXT;

-- 8. 修改 type 字段为枚举类型
-- 先添加新列
ALTER TABLE "datasources" ADD COLUMN "type_new" "DatasourceType";
-- 迁移数据（将现有 TEXT 数据映射到枚举）
UPDATE "datasources" SET "type_new" = CASE 
    WHEN "type" = 'excel' THEN 'EXCEL'::"DatasourceType"
    WHEN "type" = 'csv' THEN 'CSV'::"DatasourceType"
    WHEN "type" = 'pdf' THEN 'PDF'::"DatasourceType"
    WHEN "type" = 'postgres' THEN 'POSTGRES'::"DatasourceType"
    WHEN "type" = 'google_sheets' THEN 'GOOGLE_SHEETS'::"DatasourceType"
    ELSE 'EXCEL'::"DatasourceType"
END;
-- 删除旧列，重命名新列
ALTER TABLE "datasources" DROP COLUMN "type";
ALTER TABLE "datasources" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "datasources" ALTER COLUMN "type" SET NOT NULL;

-- 9. 删除旧字段
ALTER TABLE "datasources" DROP COLUMN "size";
ALTER TABLE "datasources" DROP COLUMN "url";

-- 10. 添加外键
ALTER TABLE "datasources" ADD CONSTRAINT "datasources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. 修改 reports 表 - 添加 tenant_id
ALTER TABLE "reports" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. 创建默认租户（为现有用户）
-- 插入一个默认租户
INSERT INTO "tenants" ("id", "name", "status", "created_at", "updated_at")
VALUES ('default_tenant', 'Default Tenant', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 将现有用户关联到默认租户
UPDATE "users" SET 
    "tenant_id" = 'default_tenant',
    "tenant_role" = 'OWNER'::"TenantRole"
WHERE "role" = 'USER';

-- 13. 将现有数据关联到默认租户
UPDATE "chats" SET "tenant_id" = 'default_tenant';
UPDATE "datasources" SET "tenant_id" = 'default_tenant';
UPDATE "reports" SET "tenant_id" = 'default_tenant';
