* [x] Prisma Schema 已更新，包含 Tenant 模型和 TenantRole 枚举

* [x] User 模型包含 tenantId（可为 null）和 tenantRole 字段

* [x] email 唯一约束改为 (email, tenantId) 组合唯一

* [x] Chat/Datasource/Report 模型包含 tenantId 字段（可为 null）

* [x] 普通用户注册时可创建租户（tenantRole=OWNER）或加入现有租户

* [x] 系统管理员注册时 tenantId 为 null

* [x] 注册使用事务保证租户和用户同时创建

* [x] JWT payload 包含 userId、tenantId（可为 null）、tenantRole（可为 null）、role

* [x] 认证中间件将 tenantId 注入请求上下文（可为 null）

* [x] 登录接口返回用户所属租户信息（如果有）

* [x] 租户邀请接口 POST /api/tenants/invite 已实现

* [x] 接受邀请接口 POST /api/tenants/join 已实现

* [x] 租户成员列表接口 GET /api/tenants/members 已实现

* [x] 修改成员角色接口 PATCH /api/tenants/members/:id/role 已实现

* [x] 移除成员接口 DELETE /api/tenants/members/:id 已实现

* [x] 有租户用户的数据源按 tenantId 隔离，无租户用户按 userId 隔离

* [x] 数据源权限检查基于 tenantRole（如果有租户）

* [x] Chat 相关 API 按 tenantId 过滤（如果有）

* [x] Report 相关 API 按 tenantId 过滤（如果有）

* [x] Dashboard 统计按租户隔离（如果有）

* [x] 跨租户访问返回 404

* [x] TypeScript 编译通过，无类型错误

