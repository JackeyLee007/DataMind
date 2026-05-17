# Tasks

- [ ] Task 1: 更新 Prisma Schema 添加多租户模型
  - [ ] SubTask 1.1: 创建 Tenant 模型（id, name, status, createdAt, updatedAt）
  - [ ] SubTask 1.2: User 模型添加 tenantId（可为 null）和 tenantRole 字段
  - [ ] SubTask 1.3: 修改 email 唯一约束为 (email, tenantId) 组合唯一
  - [ ] SubTask 1.4: Chat/Datasource/Report 模型添加 tenantId 字段（可为 null）
  - [ ] SubTask 1.5: 新增 TenantRole 枚举（OWNER, ADMIN, MEMBER, VIEWER）
  - [ ] SubTask 1.6: 运行 prisma generate 更新客户端

- [ ] Task 2: 改造用户注册流程
  - [ ] SubTask 2.1: 普通用户注册时可选创建租户（tenantRole=OWNER）或加入现有租户
  - [ ] SubTask 2.2: 系统管理员注册时 tenantId 为 null
  - [ ] SubTask 2.3: 使用事务保证租户和用户同时创建

- [ ] Task 3: 更新认证系统
  - [ ] SubTask 3.1: JWT payload 包含 userId、tenantId（可为 null）、tenantRole（可为 null）、role
  - [ ] SubTask 3.2: 认证中间件注入 tenantId 到请求上下文（可为 null）
  - [ ] SubTask 3.3: 登录时返回用户所属租户信息（如果有）

- [ ] Task 4: 实现租户成员管理 API
  - [ ] SubTask 4.1: POST /api/tenants/invite 邀请成员（生成邀请码/链接）
  - [ ] SubTask 4.2: POST /api/tenants/join 接受邀请加入租户
  - [ ] SubTask 4.3: GET /api/tenants/members 获取租户成员列表
  - [ ] SubTask 4.4: PATCH /api/tenants/members/:id/role 修改成员角色
  - [ ] SubTask 4.5: DELETE /api/tenants/members/:id 移除成员

- [ ] Task 5: 更新数据源管理添加租户隔离
  - [ ] SubTask 5.1: 有租户用户按 tenantId 隔离，无租户用户按 userId 隔离
  - [ ] SubTask 5.2: 列表查询按 tenantId 过滤（如果有）
  - [ ] SubTask 5.3: 权限检查基于 tenantRole（如果有租户）

- [ ] Task 6: 更新其他业务模块添加租户隔离
  - [ ] SubTask 6.1: Chat 相关 API 按 tenantId 过滤（如果有）
  - [ ] SubTask 6.2: Report 相关 API 按 tenantId 过滤（如果有）
  - [ ] SubTask 6.3: Dashboard 统计按租户隔离（如果有）

- [ ] Task 7: 测试验证
  - [ ] SubTask 7.1: 测试普通用户注册创建租户
  - [ ] SubTask 7.2: 测试系统管理员无租户
  - [ ] SubTask 7.3: 测试租户成员邀请和加入流程
  - [ ] SubTask 7.4: 测试跨租户数据隔离
  - [ ] SubTask 7.5: 测试不同角色的权限控制

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3
- Task 5 depends on Task 3
- Task 6 depends on Task 3
- Task 5 and Task 6 can be parallel
- Task 7 depends on Task 4, Task 5, Task 6
