# Tasks

- [ ] Task 1: 更新 Prisma Schema 并创建数据库迁移
  - [ ] SubTask 1.1: 修改 schema.prisma，扩展 Datasource 模型，新增 DatasourceType 和 DatasourceStatus 枚举
  - [ ] SubTask 1.2: 运行 prisma migrate dev 生成迁移文件
  - [ ] SubTask 1.3: 运行 prisma generate 更新客户端

- [ ] Task 2: 安装文件上传和解析依赖
  - [ ] SubTask 2.1: 安装 multer（文件上传）、xlsx（Excel 解析）、csv-parse（CSV 解析）
  - [ ] SubTask 2.2: 安装 @types/multer 类型定义

- [ ] Task 3: 实现数据源 API 路由
  - [ ] SubTask 3.1: 重构后端路由结构，将数据源路由拆分到独立文件 src/routes/datasources.ts
  - [ ] SubTask 3.2: 实现 POST /api/datasources/upload 文件上传接口（含 multer 配置、文件验证、保存、解析）
  - [ ] SubTask 3.3: 实现 GET /api/datasources 列表查询接口（支持分页、筛选、仅返回当前用户数据）
  - [ ] SubTask 3.4: 实现 GET /api/datasources/:id 详情接口（含权限检查）
  - [ ] SubTask 3.5: 实现 PATCH /api/datasources/:id 更新接口（仅允许更新 name 等元数据）
  - [ ] SubTask 3.6: 实现 DELETE /api/datasources/:id 删除接口（删除记录并清理文件）
  - [ ] SubTask 3.7: 实现 GET /api/datasources/:id/preview 预览接口（返回前 N 行数据）

- [ ] Task 4: 集成认证中间件
  - [ ] SubTask 4.1: 将现有的 authenticateToken 中间件提取到 src/middleware/auth.ts
  - [ ] SubTask 4.2: 为所有数据源路由添加认证保护

- [ ] Task 5: 测试验证
  - [ ] SubTask 5.1: 使用 curl/Postman 测试文件上传流程
  - [ ] SubTask 5.2: 测试 CRUD 接口的权限隔离
  - [ ] SubTask 5.3: 测试错误场景（不支持的文件类型、过大文件、越权访问）

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3
- Task 5 depends on Task 4
